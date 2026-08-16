import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CONTACT_EMAIL } from "../config/shop";

function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const choice = localStorage.getItem("rianiCookieConsent");
    if (!choice) {
      setVisible(true);
    }
  }, []);

  function saveChoice(value) {
    localStorage.setItem("rianiCookieConsent", value);
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        right: "16px",
        bottom: "16px",
        left: "16px",
        zIndex: 80,
        maxWidth: "720px",
        margin: "0 auto",
        padding: "18px 20px",
        borderRadius: "12px",
        background: "#111",
        color: "#fff",
        boxShadow: "0 12px 40px rgba(0,0,0,.25)",
      }}
    >
      <p style={{ margin: "0 0 12px", lineHeight: 1.6 }}>
        We use necessary cookies to run the shop and remember your cart.
        Read more in our <Link to="/privacy" style={{ color: "#fff" }}>Privacy Policy</Link>.
        Questions: {CONTACT_EMAIL}.
      </p>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => saveChoice("accepted")}
          style={{
            padding: "10px 16px",
            border: "none",
            borderRadius: "8px",
            background: "#fff",
            color: "#111",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => saveChoice("necessary")}
          style={{
            padding: "10px 16px",
            border: "1px solid #fff",
            borderRadius: "8px",
            background: "transparent",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Necessary only
        </button>
      </div>
    </div>
  );
}

export default CookieBanner;
