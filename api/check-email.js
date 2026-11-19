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

  const url = new URL("https://emailreputation.abstractapi.com/v1/");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("email", email);

  try {
    const result = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!result.ok) {
      console.error("Abstract Email Intelligence returned status", result.status);
      if (result.status === 401) {
        return response.status(502).json({
          error: "Abstract rejected the API key. Use an Email Intelligence API key in Vercel.",
        });
      }
      return response.status(502).json({ error: "The verification service is temporarily unavailable." });
    }

    const data = await result.json();
    const deliverability = data.email_deliverability?.status;
    return response.status(200).json({
      email,
      deliverability: deliverability === "deliverable" || deliverability === "undeliverable"
        ? deliverability
        : "unknown",
      formatValid: data.email_deliverability?.is_format_valid === true,
      mxFound: typeof data.email_deliverability?.is_mx_valid === "boolean"
        ? data.email_deliverability.is_mx_valid
        : null,
      smtpValid: typeof data.email_deliverability?.is_smtp_valid === "boolean"
        ? data.email_deliverability.is_smtp_valid
        : null,
      disposable: typeof data.email_quality?.is_disposable === "boolean"
        ? data.email_quality.is_disposable
        : null,
      freeProvider: typeof data.email_quality?.is_free_email === "boolean"
        ? data.email_quality.is_free_email
        : null,
      domain: data.email_domain?.domain ?? email.split("@")[1] ?? "",
    });
  } catch (error) {
    console.error("Abstract Email Intelligence request failed", error);
    return response.status(502).json({ error: "Could not reach the verification service. Please try again." });
  }
}
