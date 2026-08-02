import { createContext, useEffect, useState } from "react";

export const WishlistContext = createContext();


function WishlistProvider({ children }) {


  const [wishlist, setWishlist] = useState(() => {

    const savedWishlist =
      localStorage.getItem("wishlist");


    return savedWishlist
      ? JSON.parse(savedWishlist)
      : [];

  });



  // Save wishlist
  useEffect(() => {

    localStorage.setItem(
      "wishlist",
      JSON.stringify(wishlist)
    );

  }, [wishlist]);





  // Add wishlist
  function addToWishlist(product){


    const exists = wishlist.some(
      (item) =>
        String(item.id) === String(product.id)
    );


    if(!exists){

      setWishlist([
        ...wishlist,
        product
      ]);

    }

  }





  // Remove wishlist
  function removeFromWishlist(id){


    const updatedWishlist =
      wishlist.filter(
        (item)=>
        String(item.id) !== String(id)
      );


    setWishlist(updatedWishlist);

  }





  return (

    <WishlistContext.Provider

      value={{

        wishlist,

        setWishlist,

        addToWishlist,

        removeFromWishlist,

      }}

    >

      {children}

    </WishlistContext.Provider>

  );

}


export default WishlistProvider;