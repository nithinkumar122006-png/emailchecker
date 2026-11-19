const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Use POST to check an email address." });
  }

  const email = typeof request.body?.email === "string" ? request.body.email.trim() : "";
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return response.status(400).json({ error: "Enter a valid email address." });
  }

  const apiKey = process.env.ABSTRACT_API_KEY;
  if (!apiKey) {
    return response.status(503).json({
      error: "Email verification is not configured yet. Add ABSTRACT_API_KEY in your deployment settings.",
    });
  }

  const url = new URL("https://emailvalidation.abstractapi.com/v1/");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("email", email);

  try {
    const result = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!result.ok) {
      console.error("Email validation provider returned status", result.status);
      return response.status(502).json({ error: "The verification service is temporarily unavailable." });
    }

    const data = await result.json();
    return response.status(200).json({
      email,
      formatValid: data.is_valid_format?.value === true,
      mxFound: typeof data.is_mx_found?.value === "boolean" ? data.is_mx_found.value : null,
      smtpValid: typeof data.is_smtp_valid?.value === "boolean" ? data.is_smtp_valid.value : null,
      disposable: data.is_disposable_email?.value === true,
      freeProvider: data.is_free_email?.value === true,
      domain: data.email?.split("@")[1] ?? "",
    });
  } catch (error) {
    console.error("Email validation request failed", error);
    return response.status(502).json({ error: "Could not reach the verification service. Please try again." });
  }
}
