import { useState } from "react";
import "../styles/Newsletter.css";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim()) {
      setResult("Enter your email.");
      return;
    }

    setSending(true);
    setResult("Sending...");

    const formData = new FormData();
    formData.append("access_key", "f46abd6f-832d-4d02-a4d1-f347fd946f23");
    formData.append("subject", "Newsletter signup from Riani Shop");
    formData.append("from_name", "Riani Shop Newsletter");
    formData.append("email", email.trim());
    formData.append("message", `Newsletter signup: ${email.trim()}`);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        setResult("Thanks for subscribing.");
        setEmail("");
      } else {
        setResult("Something went wrong. Please try again.");
      }
    } catch {
      setResult("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="newsletter">
      <p>STAY CONNECTED</p>

      <h2>Join Our Newsletter</h2>

      <span>
        Get updates about new arrivals, special offers and fashion trends.
      </span>

      <form className="newsletter-form" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          required
        />

        <button type="submit" disabled={sending}>
          {sending ? "Sending..." : "Subscribe"}
        </button>
      </form>

      {result && <p>{result}</p>}
    </section>
  );
}

export default Newsletter;
