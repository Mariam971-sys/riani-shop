import "../styles/BestSellers.css";

import BestSellerCard from "./BestSellerCard";

import womenJacket from "../assets/images/products/women-jacket.jpg";
import menJacket from "../assets/images/products/men-jacket.jpg";
import sneakers from "../assets/images/products/sneakers.jpg";
import dress from "../assets/images/products/dress.jpg";

function BestSellers() {
  return (
    <section className="best-sellers">
      <div className="best-title">
        <p>OUR BEST SELLERS</p>
        <h2>Most Popular Products</h2>
      </div>

      <div className="best-grid">
        <BestSellerCard
          image={womenJacket}
          category="Women"
          name="Women's Jacket"
          price={69.99}
        />

        <BestSellerCard
          image={menJacket}
          category="Men"
          name="Men's Jacket"
          price={79.99}
        />

        <BestSellerCard
          image={sneakers}
          category="Shoes"
          name="Sneakers"
          price={89.99}
        />

        <BestSellerCard
          image={dress}
          category="Women"
          name="Elegant Dress"
          price={59.99}
        />
      </div>
    </section>
  );
}

export default BestSellers;