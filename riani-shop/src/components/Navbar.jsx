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
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const totalItems = cart.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0
  );

  function closeMenu() {
    setMenuOpen(false);
  }

  function closeAccountMenu() {
    setAccountOpen(false);
  }

  function toggleSearch() {
    setSearchOpen((current) => !current);
    setAccountOpen(false);
  }

  function toggleAccountMenu() {
    setAccountOpen((current) => !current);
    setSearchOpen(false);
  }

  function handleLogout() {
    logout();
    setAccountOpen(false);
    setMenuOpen(false);
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
            onClick={() => {
              setMenuOpen((current) => !current);
              setAccountOpen(false);
              setSearchOpen(false);
            }}
            aria-label="Open navigation menu"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Logo */}
          <NavLink
            to="/"
            className="navbar-logo"
            onClick={() => {
              closeMenu();
              closeAccountMenu();
            }}
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
              onClick={toggleSearch}
              aria-label="Search"
              aria-expanded={searchOpen}
            >
              <FaSearch />
            </button>

            {/* Wishlist */}
            <NavLink
              to="/wishlist"
              className="navbar-action-button"
              aria-label="Wishlist"
              onClick={closeAccountMenu}
            >
              <FaHeart />
            </NavLink>

            {/* Account */}
            <div className="account-menu">
              <button
                type="button"
                className="navbar-action-button account-button"
                aria-label="Account"
                aria-expanded={accountOpen}
                onClick={toggleAccountMenu}
              >
                <FaUser />
              </button>

              {accountOpen && (
                <div className="account-dropdown">
                  {!user ? (
                    <>
                      <NavLink
                        to="/login"
                        onClick={closeAccountMenu}
                      >
                        Login
                      </NavLink>

                      <NavLink
                        to="/register"
                        onClick={closeAccountMenu}
                      >
                        Register
                      </NavLink>
                    </>
                  ) : (
                    <>
                      <NavLink
                        to="/profile"
                        onClick={closeAccountMenu}
                      >
                        My Account
                      </NavLink>

                      <NavLink
                        to="/orders"
                        onClick={closeAccountMenu}
                      >
                        My Orders
                      </NavLink>

                      {user.isAdmin && (
                        <NavLink
                          to="/admin"
                          onClick={closeAccountMenu}
                        >
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
              )}
            </div>

            {/* Cart */}
            <NavLink
              to="/cart"
              className="navbar-action-button cart-action"
              aria-label="Shopping cart"
              onClick={closeAccountMenu}
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