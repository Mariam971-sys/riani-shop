
import "../styles/Navbar.css";
import { FaSearch, FaHeart, FaShoppingCart, FaUser } from "react-icons/fa";

function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="logo">Riani Shop</h2>

      <div className="nav-links">
        <a href="#">Home</a>
        <a href="#">Shop</a>
        <a href="#">Categories</a>
      </div>

      <div className="nav-icons">
        <FaSearch />
        <FaHeart />
        <FaShoppingCart />
        <FaUser />
      </div>
    </nav>
  );
}

export default Navbar;