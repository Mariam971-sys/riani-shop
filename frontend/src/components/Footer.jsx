import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-column">
          <h2>RIANI SHOP</h2>

          <p>
            Premium fashion for modern lifestyles.
            Discover quality clothing, shoes and accessories
            for every occasion.
          </p>
        </div>

        <div className="footer-column">
          <h3>Shop</h3>

          <ul>
            <li>Women</li>
            <li>Men</li>
            <li>Shoes</li>
            <li>Accessories</li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Support</h3>

          <ul>
            <li>Contact</li>
            <li>FAQ</li>
            <li>Shipping</li>
            <li>Returns</li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Follow Us</h3>

          <ul>
            <li>Facebook</li>
            <li>Instagram</li>
            <li>TikTok</li>
            <li>X (Twitter)</li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 Riani Shop. All Rights Reserved.
      </div>

    </footer>
  );
}

export default Footer;