import { useState } from "react";
import {
  ArrowUpRight,
  AtSign,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Fingerprint,
  LoaderCircle,
  Mail,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";

const examples = ["hello@gmail.com", "name@company.com"];

function getVerdict(result) {
  if (!result.formatValid || result.deliverability === "undeliverable") {
    return {
      label: "Likely invalid",
      description: "This address may not be able to receive email.",
      icon: XCircle,
      tone: "invalid",
    };
  }

  if (result.deliverability !== "deliverable") {
    return {
      label: "Could not confirm",
      description: "Some mail providers limit mailbox checks. The address may still work.",
      icon: CircleHelp,
      tone: "unknown",
    };
  }

  return {
    label: "Looks deliverable",
    description: "The address passed format, domain, and mailbox checks.",
    icon: CheckCircle2,
    tone: "valid",
  };
}

function App() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function checkEmail(event) {
    event.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "We couldn't check this address. Please try again.");
      }

      setResult(data);
    } catch (requestError) {
      setError(requestError.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function chooseExample(value) {
    setEmail(value);
    setResult(null);
    setError("");
  }

  const verdict = result ? getVerdict(result) : null;
  const VerdictIcon = verdict?.icon;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Inbox Check home">
          <span className="brand-mark"><Mail size={18} strokeWidth={2.2} /></span>
          <span>inbox<span className="brand-light">check</span></span>
        </a>
        <a className="top-link" href="#how-it-works">
          How it works <ArrowUpRight size={15} />
        </a>
      </header>

      <main>
        <section className="hero">
          <div className="eyebrow"><Sparkles size={14} /> EMAIL VERIFICATION, MADE SIMPLE</div>
          <h1>Is this email<br /><span>the real deal?</span></h1>
          <p className="hero-copy">
            Check if an email address is properly formatted and likely to receive mail.
            No signup, no guesswork.
          </p>

          <form className="checker-card" onSubmit={checkEmail}>
            <label htmlFor="email-address">Email address</label>
            <div className={`input-wrap ${error ? "input-error" : ""}`}>
              <AtSign size={19} aria-hidden="true" />
              <input
                id="email-address"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                  setResult(null);
                }}
                placeholder="you@example.com"
                autoComplete="email"
                maxLength={254}
                required
                aria-describedby={error ? "form-error" : undefined}
              />
              <button type="submit" disabled={loading || !email.trim()}>
                {loading ? <><LoaderCircle className="spin" size={17} /> Checking</> : <>Check email <ArrowUpRight size={17} /></>}
              </button>
            </div>
            {error ? <p className="form-message error-message" id="form-error">{error}</p> : (
              <p className="form-message"><ShieldCheck size={14} /> Your address is checked securely and never stored.</p>
            )}

            {result && verdict && (
              <div className={`result-card ${verdict.tone}`} aria-live="polite">
                <div className="result-heading">
                  <span className="result-icon"><VerdictIcon size={21} /></span>
                  <div>
                    <strong>{verdict.label}</strong>
                    <p>{verdict.description}</p>
                  </div>
                </div>
                <div className="result-details">
                  <ResultRow label="Email format" passed={result.formatValid} />
                  <ResultRow label="Domain can receive mail" passed={result.mxFound} />
                  <ResultRow label="Mailbox check" passed={result.smtpValid} />
                  <ResultRow label="Disposable address" passed={result.disposable} inverse />
                </div>
                {result.disposable && <p className="result-note">This looks like a temporary email provider.</p>}
              </div>
            )}
          </form>

          <div className="examples">
            <span>Try an example</span>
            {examples.map((example) => (
              <button key={example} type="button" onClick={() => chooseExample(example)}>{example}</button>
            ))}
          </div>
        </section>

        <section className="trust-row" aria-label="Benefits">
          <div><span className="trust-icon lavender"><ShieldCheck size={19} /></span><span><strong>Private by design</strong><small>We never save your searches</small></span></div>
          <div><span className="trust-icon mint"><Fingerprint size={19} /></span><span><strong>More than a format check</strong><small>Domain and mailbox signals</small></span></div>
          <div><span className="trust-icon peach"><Sparkles size={18} /></span><span><strong>Instant results</strong><small>Usually takes just a moment</small></span></div>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="section-kicker">A LITTLE CLARITY GOES A LONG WAY</div>
          <h2>What does “real” mean?</h2>
          <p className="section-copy">We check the signals that help determine whether an address can receive email.</p>
          <div className="steps">
            <article><span className="step-number">01</span><h3>Format</h3><p>Is the address structured like a valid email?</p></article>
            <article><span className="step-number">02</span><h3>Domain</h3><p>Does its domain have mail servers configured?</p></article>
            <article><span className="step-number">03</span><h3>Mailbox</h3><p>Does the provider indicate the mailbox is reachable?</p></article>
          </div>
          <div className="disclaimer"><CircleHelp size={17} /><p>Email checks are best-effort signals, not a guarantee. Mail providers can limit mailbox checks, and only sending a confirmation email can prove an address is controlled by its owner.</p><ChevronDown size={16} className="disclaimer-chevron" /></div>
        </section>
      </main>

      <footer>
        <a className="brand footer-brand" href="#"><span className="brand-mark"><Mail size={16} /></span><span>inbox<span className="brand-light">check</span></span></a>
        <span>Less guessing. Better emails.</span>
        <span className="footer-status"><span /> Built for your peace of mind</span>
      </footer>
    </div>
  );
}

function ResultRow({ label, passed, inverse = false }) {
  const positive = passed === null ? null : (inverse ? !passed : passed);
  const statusText = positive === null
    ? "Not confirmed"
    : positive
      ? (inverse ? "No" : "Passed")
      : (inverse ? "Yes" : "Not found");
  return (
    <div className="result-row">
      <span>{label}</span>
      <span className={positive === null ? "row-unknown" : positive ? "row-pass" : "row-fail"}>
        {positive === null ? <CircleHelp size={14} /> : positive ? <Check size={14} /> : <X size={14} />}
        {statusText}
      </span>
    </div>
  );
}

export default App;
