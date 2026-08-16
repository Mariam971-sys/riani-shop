import { useState } from "react";

function Contact() {
  const [result, setResult] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSending(true);
    setResult("Sending...");

    const formData = new FormData(event.target);

    formData.append(
      "access_key",
      "f46abd6f-832d-4d02-a4d1-f347fd946f23"
    );

    formData.append("subject", "New message from Riani Shop website");
    formData.append("from_name", "Riani Shop Website");

    try {
      const response = await fetch(
        "https://api.web3forms.com/submit",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setResult("Your message has been sent successfully!");
        event.target.reset();
      } else {
        setResult("Something went wrong. Please try again.");
      }
    } catch {
      setResult("Something went wrong. Please try again.");
    }

    setSending(false);
  };

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "60px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "42px",
          marginBottom: "15px",
        }}
      >
        Contact Riani Shop
      </h1>

      <p
        style={{
          textAlign: "center",
          color: "#666",
          fontSize: "18px",
          maxWidth: "700px",
          margin: "0 auto 50px",
          lineHeight: "1.8",
        }}
      >
        We are always happy to help. Whether you have questions about your
        order, shipping, returns, payments or our products, our support team
        is ready to assist you.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "30px",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "15px",
            boxShadow: "0 10px 25px rgba(0,0,0,.08)",
          }}
        >
          <h2>Customer Support</h2>

          <p>
            <strong>Email</strong>
            <br />
            <a
              href="mailto:riani.shop@proton.me"
              style={{
                color: "#111",
                textDecoration: "none",
              }}
            >
              riani.shop@proton.me
            </a>
          </p>

          <p>
            <strong>Business Hours</strong>
            <br />
            Monday – Friday
            <br />
            09:00 – 17:00
          </p>

          <p>
            <strong>Location</strong>
            <br />
            Sweden
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "15px",
            boxShadow: "0 10px 25px rgba(0,0,0,.08)",
          }}
        >
          <h2>Why Shop With Us?</h2>

          <p>✔ Cash on Delivery</p>
          <p>✔ Fast Shipping</p>
          <p>✔ Easy Returns</p>
          <p>✔ Premium Fashion</p>
          <p>✔ Friendly Customer Support</p>
          <p>✔ Trusted Online Store</p>
        </div>
      </div>

      <div
        style={{
          marginTop: "60px",
          background: "#f7f7f7",
          padding: "40px",
          borderRadius: "15px",
          boxShadow: "0 10px 25px rgba(0,0,0,.06)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          Send Us a Message
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "30px",
          }}
        >
          Fill out the form below and our support team will get back to you.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: "750px",
            margin: "0 auto",
            display: "grid",
            gap: "18px",
          }}
        >
          <div>
            <label
              htmlFor="name"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Name
            </label>

            <input
              id="name"
              type="text"
              name="name"
              placeholder="Your name"
              required
              style={{
                width: "100%",
                padding: "14px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              required
              style={{
                width: "100%",
                padding: "14px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="subject"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Subject
            </label>

            <input
              id="subject"
              type="text"
              name="subject"
              placeholder="How can we help?"
              required
              style={{
                width: "100%",
                padding: "14px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="message"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Message
            </label>

            <textarea
              id="message"
              name="message"
              placeholder="Write your message here..."
              rows="7"
              required
              style={{
                width: "100%",
                padding: "14px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "16px",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            style={{
              background: sending ? "#777" : "#111",
              color: "#fff",
              border: "none",
              padding: "15px 25px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: sending ? "not-allowed" : "pointer",
            }}
          >
            {sending ? "Sending..." : "Send Message"}
          </button>

          {result && (
            <p
              style={{
                textAlign: "center",
                fontWeight: "600",
                marginTop: "5px",
              }}
            >
              {result}
            </p>
          )}
        </form>
      </div>

      <div
        style={{
          marginTop: "60px",
          background: "#111",
          color: "#fff",
          padding: "40px",
          borderRadius: "15px",
          textAlign: "center",
        }}
      >
        <h2>Need Help?</h2>

        <p
          style={{
            color: "#ddd",
            lineHeight: "1.8",
          }}
        >
          Our team aims to respond to every email within 24 hours during
          business days.
        </p>
      </div>
    </main>
  );
}

export default Contact;