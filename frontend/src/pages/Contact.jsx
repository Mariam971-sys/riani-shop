function Contact() {
  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "60px auto",
        padding: "20px",
      }}
    >
      <h1>Contact Us</h1>

      <p>
        We'd love to hear from you! If you have any questions about your order,
        products, shipping, or returns, feel free to contact us.
      </p>

      <div style={{ marginTop: "30px", lineHeight: "2" }}>
        <p>
          <strong>Email:</strong> support@riani-shop.com
        </p>

        <p>
          <strong>Phone:</strong> +46 70 123 45 67
        </p>

        <p>
          <strong>Business Hours:</strong> Monday - Friday, 09:00 - 17:00
        </p>

        <p>
          <strong>Location:</strong> Sweden
        </p>
      </div>
    </main>
  );
}

export default Contact;