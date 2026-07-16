import "../styles/Products.css";

import ProductCard from "./ProductCard";

import womenJacket from "../assets/images/products/women-jacket.jpg";
import menJacket from "../assets/images/products/men-jacket.jpg";
import sneakers from "../assets/images/products/sneakers.jpg";
import handbag from "../assets/images/products/handbag.jpg";

function Products() {
  return (
    <section className="products">

      <div className="products-title">
        <p>OUR PRODUCTS</p>
        <h2>Featured Products</h2>
      </div>

      <div className="products-grid">

        <ProductCard
          image={womenJacket}
          category="Women"
          name="Women's Jacket"
          price="69.99"
        />

        <ProductCard
          image={menJacket}
          category="Men"
          name="Men Jacket"
          price="79.99"
        />

        <ProductCard
          image={sneakers}
          category="Shoes"
          name="White Sneakers"
          price="89.99"
        />

        <ProductCard
          image={handbag}
          category="Accessories"
          name="Luxury Handbag"
          price="59.99"
        />

      </div>

    </section>
  );
}

export default Products;