import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { apiUrl } from "../config/api";
import "../styles/Products.css";

function Products({
  selectedCategory = "All",
  initialSearch = "",
}) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [activeCategory, setActiveCategory] =
    useState(selectedCategory);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categories = [
    "All",
    "Women",
    "Men",
    "Shoes",
    "Accessories",
  ];

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setActiveCategory(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          apiUrl("/api/products")
        );

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => null);

          throw new Error(
            errorData?.message ||
              "Failed to fetch products"
          );
        }

        const data = await response.json();

        const productList = Array.isArray(data)
          ? data
          : Array.isArray(data.products)
          ? data.products
          : [];

        setProducts(productList);
      } catch (err) {
        console.error("Fetch products error:", err);

        setError(
          err.message || "Unable to load products."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const productName = String(product.name || "")
      .trim()
      .toLowerCase();

    const productCategory = String(
      product.category || ""
    )
      .trim()
      .toLowerCase();

    const productBrand = String(product.brand || "")
      .trim()
      .toLowerCase();

    const searchText = String(search || "")
      .trim()
      .toLowerCase();

    const selected = String(activeCategory || "All")
      .trim()
      .toLowerCase();

    const matchesSearch =
      searchText === "" ||
      productName.includes(searchText) ||
      productCategory.includes(searchText) ||
      productBrand.includes(searchText);

    let matchesCategory = true;

    if (selected !== "all") {
      if (selected === "women") {
        matchesCategory =
          productCategory === "women" ||
          productCategory === "woman" ||
          productCategory.includes("women") ||
          productCategory.includes("female");
      } else if (selected === "men") {
        matchesCategory =
          productCategory === "men" ||
          productCategory === "man" ||
          productCategory.includes("men") ||
          productCategory.includes("male");
      } else if (selected === "shoes") {
        matchesCategory =
          productCategory === "shoes" ||
          productCategory.includes("shoe") ||
          productCategory.includes("sneaker") ||
          productCategory.includes("footwear");
      } else if (selected === "accessories") {
        matchesCategory =
          productCategory === "accessories" ||
          productCategory.includes("accessor") ||
          productCategory.includes("bag") ||
          productCategory.includes("watch") ||
          productCategory.includes("jewelry");
      } else {
        matchesCategory =
          productCategory === selected;
      }
    }

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="products-status">
        <h2>Loading products...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-status">
        <h2 className="products-error">
          Unable to load products.
        </h2>

        <p>{error}</p>
      </div>
    );
  }

  return (
    <section className="products">
      <div className="products-container">
        <div className="products-title">
          <h2>
            {initialSearch
              ? initialSearch
              : activeCategory === "All"
              ? "Most Popular Products"
              : `${activeCategory} Products`}
          </h2>

          <div className="title-decoration">
            <span />
            <i />
            <span />
          </div>
        </div>

        <div className="search-box">
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="category-buttons">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={
                activeCategory === category
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveCategory(category)
              }
            >
              {category}
            </button>
          ))}
        </div>

        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((product) => {
              const productId =
                product._id || product.id;

              const productImage =
                product.images?.[0] ||
                product.image ||
                "";

              const productPrice =
                product.isOnSale &&
                Number(product.salePrice) > 0
                  ? product.salePrice
                  : product.price;

              return (
                <ProductCard
                  key={productId}
                  id={productId}
                  image={productImage}
                  category={product.category}
                  brand={product.brand}
                  name={product.name}
                  price={productPrice}
                  rating={product.rating}
                  numReviews={product.numReviews}
                />
              );
            })}
          </div>
        ) : (
          <p className="no-products">
            No products found.
          </p>
        )}
      </div>
    </section>
  );
}

export default Products;