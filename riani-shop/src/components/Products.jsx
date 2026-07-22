import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import "../styles/Products.css";

function Products({
  selectedCategory = "All",
  initialSearch = "",
}) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/products"
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);

          throw new Error(
            errorData?.message || "Failed to fetch products"
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

    const productCategory = String(product.category || "")
      .trim()
      .toLowerCase();

    const searchText = String(search || "")
      .trim()
      .toLowerCase();

    const selected = String(selectedCategory || "All")
      .trim()
      .toLowerCase();

    const matchesSearch =
      searchText === "" ||
      productName.includes(searchText) ||
      productCategory.includes(searchText) ||
      String(product.brand || "")
        .toLowerCase()
        .includes(searchText);

    let matchesCategory = true;

    if (selected !== "all") {
      if (selected === "women") {
        matchesCategory =
          productCategory === "women" ||
          productCategory === "woman" ||
          productCategory.includes("women clothing") ||
          productCategory.includes("female");
      } else if (selected === "men") {
        matchesCategory =
          productCategory === "men" ||
          productCategory === "man" ||
          productCategory.includes("men clothing") ||
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
        matchesCategory = productCategory === selected;
      }
    }

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <h2
        style={{
          textAlign: "center",
          marginTop: "40px",
        }}
      >
        Loading...
      </h2>
    );
  }

  if (error) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "40px",
        }}
      >
        <h2 style={{ color: "red" }}>
          Unable to load products.
        </h2>

        <p>{error}</p>
      </div>
    );
  }

  return (
    <section className="products">
      <div className="products-title">
        <p>FEATURED PRODUCTS</p>

        <h2>
          {initialSearch
            ? initialSearch
            : selectedCategory === "All"
            ? "Most Popular Products"
            : `${selectedCategory} Products`}
        </h2>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />
      </div>

      {filteredProducts.length > 0 ? (
        <div className="products-grid">
          {filteredProducts.map((product) => {
            const productId = product._id || product.id;

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
                images={product.images}
                category={product.category}
                brand={product.brand}
                name={product.name}
                price={productPrice}
                originalPrice={product.price}
                isOnSale={product.isOnSale}
                salePrice={product.salePrice}
                isFeatured={product.isFeatured}
                countInStock={product.countInStock}
              />
            );
          })}
        </div>
      ) : (
        <p className="no-products">
          No products found.
        </p>
      )}
    </section>
  );
}

export default Products;