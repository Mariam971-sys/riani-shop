import "../styles/Categories.css";

import women from "../assets/images/category-women.jpg";
import men from "../assets/images/category-men.jpg";
import shoes from "../assets/images/category-shoes.jpg";
import accessories from "../assets/images/category-accessories.jpg";

import CategoryCard from "./CategoryCard";

function Categories() {
  return (
    <section className="categories">

      <div className="section-title">
        <p>SHOP BY CATEGORY</p>
        <h2>Browse Categories</h2>
      </div>

      <div className="categories-grid">

        <CategoryCard
          image={women}
          title="Women"
        />

        <CategoryCard
          image={men}
          title="Men"
        />

        <CategoryCard
          image={shoes}
          title="Shoes"
        />

        <CategoryCard
          image={accessories}
          title="Accessories"
        />

      </div>

    </section>
  );
}

export default Categories;