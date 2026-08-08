import { createContext, useEffect, useState } from "react";

export const WishlistContext = createContext();

function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem("wishlist");

    return savedWishlist
      ? JSON.parse(savedWishlist)
      : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

  function getProductId(product) {
    return product?._id || product?.id;
  }

  function addToWishlist(product) {
    const productId = getProductId(product);

    const exists = wishlist.some(
      (item) =>
        String(getProductId(item)) ===
        String(productId)
    );

    if (!exists) {
      setWishlist((currentWishlist) => [
        ...currentWishlist,
        product,
      ]);
    }
  }

  function removeFromWishlist(id) {
    setWishlist((currentWishlist) =>
      currentWishlist.filter(
        (item) =>
          String(getProductId(item)) !==
          String(id)
      )
    );
  }

  function isInWishlist(id) {
    return wishlist.some(
      (item) =>
        String(getProductId(item)) ===
        String(id)
    );
  }

  function toggleWishlist(product) {
    const productId = getProductId(product);

    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(product);
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        setWishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export default WishlistProvider;