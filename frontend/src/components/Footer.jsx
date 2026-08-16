import { Link } from "react-router-dom";
import { CONTACT_EMAIL } from "../config/shop";
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
              <Link to="/shop?category=Women">Women</Link>
            </li>
            <li>
              <Link to="/shop?category=Men">Men</Link>
            </li>
            <li>
              <Link to="/shop?category=Shoes">Shoes</Link>
            </li>
            <li>
              <Link to="/shop?category=Accessories">Accessories</Link>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Support</h3>
          <ul>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/faq">FAQ</Link>
            </li>
            <li>
              <Link to="/shipping">Shipping</Link>
            </li>
            <li>
              <Link to="/returns">Returns</Link>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Legal</h3>
          <ul>
            <li>
              <Link to="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/terms">Terms of Service</Link>
            </li>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Payment Methods</h3>
          <div className="payment-methods">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Klarna</span>
            <span>Swish</span>
            <span>PayPal</span>
          </div>
          <p>Payments are processed by Stripe in SEK. Methods shown at checkout depend on your Stripe account.</p>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 Riani Shop. All Rights Reserved.
      </div>
    </footer>
  );
}

export default Footer;
