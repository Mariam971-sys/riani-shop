import {
  createContext,
  useEffect,
  useState,
} from "react";

export const LanguageContext = createContext();

function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const translations = {
    en: {
      home: "Home",
      newIn: "New In",
      women: "Women",
      men: "Men",
      kids: "Kids",
      shoes: "Shoes",
      accessories: "Accessories",
      sale: "Sale",

      availability: "Availability",
      inStock: "in stock",
      outOfStock: "Out of stock",

      quantity: "Quantity",
      addToCart: "Add To Cart",
      adding: "Adding...",

      productInformation: "Product Information",
      description: "Description",
      details: "Details",
      category: "Category",
      brand: "Brand",
      material: "Material",

      color: "Color",
      size: "Size",

      secureCheckout: "Secure checkout",
      easyReturns: "Easy returns",
      fastDelivery: "Fast delivery",

      relatedProducts: "Related Products",
      viewAll: "View All",

      back: "Back",
      reviews: "reviews",

      addedToCart: "has been added to your cart.",
    },

    sv: {
      home: "Hem",
      newIn: "Nyheter",
      women: "Dam",
      men: "Herr",
      kids: "Barn",
      shoes: "Skor",
      accessories: "Accessoarer",
      sale: "Rea",

      availability: "Tillgänglighet",
      inStock: "i lager",
      outOfStock: "Slut i lager",

      quantity: "Antal",
      addToCart: "Lägg i varukorgen",
      adding: "Lägger till...",

      productInformation: "Produktinformation",
      description: "Beskrivning",
      details: "Detaljer",
      category: "Kategori",
      brand: "Varumärke",
      material: "Material",

      color: "Färg",
      size: "Storlek",

      secureCheckout: "Säker betalning",
      easyReturns: "Enkla returer",
      fastDelivery: "Snabb leverans",

      relatedProducts: "Liknande produkter",
      viewAll: "Visa alla",

      back: "Tillbaka",
      reviews: "recensioner",

      addedToCart: "har lagts till i varukorgen.",
    },
  };

  const t = translations[language];

  function changeLanguage(newLanguage) {
    setLanguage(newLanguage);
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export default LanguageProvider;