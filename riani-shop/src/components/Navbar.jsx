import { useContext } from "react";
import { NavLink } from "react-router-dom";
import {
  FaSearch,
  FaHeart,
  FaShoppingCart,
  FaUser,
} from "react-icons/fa";

import { CartContext } from "../context/CartContext";
import "../styles/Navbar.css";

function Navbar() {
  const { cart } = useContext(CartContext);

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <nav className="navbar">
      <NavLink to="/" className="logo">
        Riani Shop
      </NavLink>

      <div className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/shop">Shop</NavLink>
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/register">Register</NavLink>
      </div>

      <div className="nav-icons">
        <FaSearch />

        <NavLink
          to="/wishlist"
          className="wishlist-icon-link"
        >
          <FaHeart />
        </NavLink>

        <NavLink
          to="/cart"
          className="cart-icon-link"
        >
          <FaShoppingCart />

          {totalItems > 0 && (
            <span className="cart-count">
              {totalItems}
            </span>
          )}
        </NavLink>

        <FaUser />
      </div>
    </nav>
  );
}

export default Navbar;