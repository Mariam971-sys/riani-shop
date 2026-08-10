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
  const [reloadKey, setReloadKey] = useState(0);

  const categories = [
    "All",
    "Women",
    "Men",
    "Kids",
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
    const controller = new AbortController();

    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        let normalProducts = [];
        let printfulProducts = [];

        // ============================
        // NORMAL RIANI PRODUCTS
        // ============================

        try {
          const normalResponse = await fetch(
            apiUrl("/products"),
            {
              signal: controller.signal,
              headers: {
                Accept: "application/json",
              },
            }
          );

          if (normalResponse.ok) {
            const normalData =
              await normalResponse.json();

            normalProducts = Array.isArray(normalData)
              ? normalData
              : Array.isArray(normalData.products)
              ? normalData.products
              : [];
          } else {
            console.error(
              "Normal products error:",
              normalResponse.status
            );
          }
        } catch (normalError) {
          if (normalError.name !== "AbortError") {
            console.error(
              "Could not load normal products:",
              normalError
            );
          }
        }

        // ============================
        // PRINTFUL PRODUCTS
        // ============================

        try {
          const printfulResponse = await fetch(
            apiUrl("/printful/products"),
            {
              signal: controller.signal,
              headers: {
                Accept: "application/json",
              },
            }
          );

          if (printfulResponse.ok) {
            const printfulData =
              await printfulResponse.json();

            const printfulList = Array.isArray(
              printfulData.result
            )
              ? printfulData.result
              : [];

            const detailedProducts =
              await Promise.all(
                printfulList.map(async (product) => {
                  try {
                    const detailResponse =
                      await fetch(
                        apiUrl(
                          `/printful/products/${product.id}`
                        ),
                        {
                          signal:
                            controller.signal,
                          headers: {
                            Accept:
                              "application/json",
                          },
                        }
                      );

                    if (!detailResponse.ok) {
                      console.error(
                        "Could not load Printful product:",
                        product.id
                      );

                      return null;
                    }

                    const detailData =
                      await detailResponse.json();

                    const syncProduct =
                      detailData?.result
                        ?.sync_product;

                    const variants =
                      detailData?.result
                        ?.sync_variants || [];

                    const firstVariant =
                      variants[0];

                    return {
                      id: `printful-${product.id}`,
                      printfulId: product.id,

                      name:
                        syncProduct?.name ||
                        product.name ||
                        "Rianova Product",

                      image:
                        syncProduct?.thumbnail_url ||
                        product.thumbnail_url ||
                        "",

                      category: "Women",
                      brand: "Rianova",

                      price: Number(
                        firstVariant?.retail_price ||
                          299
                      ),

                      rating: 5,
                      numReviews: 0,

                      source: "printful",
                    };
                  } catch (detailError) {
                    if (
                      detailError.name !==
                      "AbortError"
                    ) {
                      console.error(
                        "Printful detail error:",
                        detailError
                      );
                    }

                    return null;
                  }
                })
              );

            printfulProducts =
              detailedProducts.filter(Boolean);
          } else {
            console.error(
              "Printful products error:",
              printfulResponse.status
            );
          }
        } catch (printfulError) {
          if (
            printfulError.name !== "AbortError"
          ) {
            console.error(
              "Could not load Printful products:",
              printfulError
            );
          }
        }

        // ============================
        // COMBINE BOTH
        // ============================

        const allProducts = [
          ...printfulProducts,
          ...normalProducts,
        ];

        setProducts(allProducts);

        if (allProducts.length === 0) {
          setError(
            "No products could be loaded."
          );
        }
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }

        console.error(
          "Fetch products error:",
          err
        );

        setError(
          err.message ||
            "Unable to load products."
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      controller.abort();
    };
  }, [reloadKey]);

  function handleRetry() {
    setReloadKey(
      (currentValue) => currentValue + 1
    );
  }

  // ============================
  // FILTER PRODUCTS
  // ============================

  const filteredProducts = products.filter(
    (product) => {
      const productName = String(
        product.name || ""
      )
        .trim()
        .toLowerCase();

      const productCategory = String(
        product.category || ""
      )
        .trim()
        .toLowerCase();

      const productBrand = String(
        product.brand || ""
      )
        .trim()
        .toLowerCase();

      const searchText = String(
        search || ""
      )
        .trim()
        .toLowerCase();

      const selected = String(
        activeCategory || "All"
      )
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
            productCategory === "female" ||
            productCategory.includes(
              "women"
            );
        } else if (selected === "men") {
          matchesCategory =
            productCategory === "men" ||
            productCategory === "man" ||
            productCategory === "male" ||
            productCategory === "mens" ||
            productCategory.startsWith(
              "men "
            );
        } else if (selected === "kids") {
          matchesCategory =
            productCategory === "kids" ||
            productCategory === "kid" ||
            productCategory === "children" ||
            productCategory === "child" ||
            productCategory.includes(
              "kids"
            );
        } else if (selected === "shoes") {
          matchesCategory =
            productCategory === "shoes" ||
            productCategory.includes(
              "shoe"
            ) ||
            productCategory.includes(
              "sneaker"
            ) ||
            productCategory.includes(
              "footwear"
            );
        } else if (
          selected === "accessories"
        ) {
          matchesCategory =
            productCategory ===
              "accessories" ||
            productCategory.includes(
              "accessor"
            ) ||
            productCategory.includes(
              "bag"
            ) ||
            productCategory.includes(
              "watch"
            ) ||
            productCategory.includes(
              "jewelry"
            );
        } else {
          matchesCategory =
            productCategory === selected;
        }
      }

      return (
        matchesSearch && matchesCategory
      );
    }
  );

  // ============================
  // LOADING
  // ============================

  if (loading) {
    return (
      <section className="products-section">
        <div className="products-container">
          <p>Loading products...</p>
        </div>
      </section>
    );
  }

  // ============================
  // ERROR
  // ============================

  if (error && products.length === 0) {
    return (
      <section className="products-section">
        <div className="products-container">
          <div className="products-error">
            <h3>
              Unable to load products.
            </h3>

            <p>{error}</p>

            <button
              type="button"
              className="products-retry-button"
              onClick={handleRetry}
            >
              Try again
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ============================
  // UI
  // ============================

  return (
    <section className="products-section">
      <div className="products-container">
        <div className="products-heading">
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
            {filteredProducts.map(
              (product) => {
                const productId =
                  product._id ||
                  product.id;

                const productImage =
                  product.images?.[0] ||
                  product.image ||
                  product.thumbnail_url ||
                  "";

                const productPrice =
                  product.isOnSale &&
                  Number(
                    product.salePrice
                  ) > 0
                    ? product.salePrice
                    : product.price;

                return (
                  <ProductCard
                    key={productId}
                    id={productId}
                    image={productImage}
                    category={
                      product.category
                    }
                    brand={product.brand}
                    name={product.name}
                    price={productPrice}
                    rating={product.rating}
                    numReviews={
                      product.numReviews
                    }
                    source={
                      product.source
                    }
                  />
                );
              }
            )}
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