import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaSearch,
  FaHeart,
  FaShoppingBag,
  FaUser,
} from "react-icons/fa";

import { CartContext } from "../context/CartContext";
import { UserContext } from "../context/UserContext";

import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const { cart = [] } = useContext(CartContext);
  const { user, logout } = useContext(UserContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const totalItems = cart.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0
  );

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    logout();
    closeMenu();
    navigate("/login");
  }

  function handleSearchSubmit(event) {
    event.preventDefault();

    const cleanSearch = searchText.trim();

    if (cleanSearch) {
      navigate(`/shop?search=${encodeURIComponent(cleanSearch)}`);
    } else {
      navigate("/shop");
    }

    setSearchOpen(false);
    setSearchText("");
  }

  return (
    <>
      <div className="top-announcement">
        Free shipping on orders over $75
      </div>

      <header className="main-header">
        <nav className="navbar">
          {/* Mobile menu button */}
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label="Open navigation menu"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Logo */}
          <NavLink
            to="/"
            className="navbar-logo"
            onClick={closeMenu}
          >
            RIANI
            <span>SHOP</span>
          </NavLink>

          {/* Navigation links */}
          <div
            className={`navbar-links ${
              menuOpen ? "navbar-links-open" : ""
            }`}
          >
            <NavLink to="/" onClick={closeMenu}>
              Home
            </NavLink>

            <NavLink to="/shop" onClick={closeMenu}>
              New In
            </NavLink>

            <NavLink
              to="/shop?category=Women"
              onClick={closeMenu}
            >
              Women
            </NavLink>

            <NavLink
              to="/shop?category=Men"
              onClick={closeMenu}
            >
              Men
            </NavLink>

            <NavLink
              to="/shop?category=Kids"
              onClick={closeMenu}
            >
              Kids
            </NavLink>

            <NavLink
              to="/shop?category=Shoes"
              onClick={closeMenu}
            >
              Shoes
            </NavLink>

            <NavLink
              to="/shop?category=Accessories"
              onClick={closeMenu}
            >
              Accessories
            </NavLink>

            <NavLink
              to="/shop?sale=true"
              className="sale-link"
              onClick={closeMenu}
            >
              Sale
            </NavLink>

            {/* Mobile account links */}
            <div className="mobile-account-links">
              {!user ? (
                <>
                  <NavLink to="/login" onClick={closeMenu}>
                    Login
                  </NavLink>

                  <NavLink to="/register" onClick={closeMenu}>
                    Register
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/profile" onClick={closeMenu}>
                    My Account
                  </NavLink>

                  <NavLink to="/orders" onClick={closeMenu}>
                    My Orders
                  </NavLink>

                  {user.isAdmin && (
                    <NavLink to="/admin" onClick={closeMenu}>
                      Admin Dashboard
                    </NavLink>
                  )}

                  <button
                    type="button"
                    className="mobile-logout-button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right side icons */}
          <div className="navbar-actions">
            {/* Search */}
            <button
              type="button"
              className="navbar-action-button"
              onClick={() =>
                setSearchOpen((current) => !current)
              }
              aria-label="Search"
            >
              <FaSearch />
            </button>

            {/* Wishlist */}
            <NavLink
              to="/wishlist"
              className="navbar-action-button"
              aria-label="Wishlist"
            >
              <FaHeart />
            </NavLink>

            {/* Account */}
            <div className="account-menu">
              <button
                type="button"
                className="navbar-action-button account-button"
                aria-label="Account"
              >
                <FaUser />
              </button>

              <div className="account-dropdown">
                {!user ? (
                  <>
                    <NavLink to="/login">
                      Login
                    </NavLink>

                    <NavLink to="/register">
                      Register
                    </NavLink>
                  </>
                ) : (
                  <>
                    <NavLink to="/profile">
                      My Account
                    </NavLink>

                    <NavLink to="/orders">
                      My Orders
                    </NavLink>

                    {user.isAdmin && (
                      <NavLink to="/admin">
                        Admin Dashboard
                      </NavLink>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Cart */}
            <NavLink
              to="/cart"
              className="navbar-action-button cart-action"
              aria-label="Shopping cart"
            >
              <FaShoppingBag />

              {totalItems > 0 && (
                <span className="navbar-cart-count">
                  {totalItems}
                </span>
              )}
            </NavLink>
          </div>
        </nav>

        {/* Search panel */}
        {searchOpen && (
          <div className="navbar-search-panel">
            <form onSubmit={handleSearchSubmit}>
              <input
                type="search"
                placeholder="Search products..."
                value={searchText}
                onChange={(event) =>
                  setSearchText(event.target.value)
                }
                autoFocus
              />

              <button type="submit">
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile overlay */}
      {menuOpen && (
        <button
          type="button"
          className="navbar-overlay"
          onClick={closeMenu}
          aria-label="Close menu"
        />
      )}
    </>
  );
}

export default Navbar;