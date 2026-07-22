import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import CartProvider from "./context/CartContext";
import WishlistProvider from "./context/WishlistContext";
import UserProvider from "./context/UserContext";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <WishlistProvider>
          <UserProvider>
            <App />
          </UserProvider>
        </WishlistProvider>
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);