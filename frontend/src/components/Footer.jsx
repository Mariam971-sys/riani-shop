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
            <li>
              <a href="/shop?category=women">Women</a>
            </li>

            <li>
              <a href="/shop?category=men">Men</a>
            </li>

            <li>
              <a href="/shop?category=shoes">Shoes</a>
            </li>

            <li>
              <a href="/shop?category=accessories">Accessories</a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Support</h3>

          <ul>
            <li>
              <a href="/contact">Contact</a>
            </li>

            <li>
              <a href="/faq">FAQ</a>
            </li>

            <li>
              <a href="/shipping">Shipping</a>
            </li>

            <li>
              <a href="/returns">Returns</a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Follow Us</h3>

          <ul>
            <li>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
              >
                Facebook
              </a>
            </li>

            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
            </li>

            <li>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
              >
                TikTok
              </a>
            </li>

            <li>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
              >
                X (Twitter)
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Payment Methods</h3>

          <div className="payment-methods">
            <span>VISA</span>
            <span>Mastercard</span>
            <span>Klarna</span>
            <span>PayPal</span>
            <span>Swish</span>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 Riani Shop. All Rights Reserved.
      </div>

    </footer>
  );
}

export default Footer;