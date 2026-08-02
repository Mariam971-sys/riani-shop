import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { UserContext } from "../context/UserContext";
import { apiUrl, mediaUrl } from "../config/api";
import "../styles/AdminProducts.css";

const API_URL = apiUrl("/products");

function AdminProducts() {
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!user.isAdmin) {
      navigate("/");
      return;
    }

    fetchProducts();
  }, [user, navigate]);

  function getToken() {
    return localStorage.getItem("token") || user?.token || "";
  }

  function getAuthConfig() {
    return {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    };
  }

  function handleAuthError(currentError) {
    const status = currentError.response?.status;

    if (status === 401 || status === 403) {
      logout();
      navigate("/login");
      return true;
    }

    return false;
  }

  async function fetchProducts() {
    try {
      setLoading(true);
      setError("");

      const { data } = await axios.get(API_URL);

      const productsData = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
        ? data.products
        : [];

      setProducts(productsData);
    } catch (currentError) {
      console.error("Fetch products error:", currentError);

      setError(
        currentError.response?.data?.message ||
          "Products could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(productId, productName) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${productName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(productId);
      setError("");
      setSuccess("");

      await axios.delete(
        `${API_URL}/${productId}`,
        getAuthConfig()
      );

      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) => product._id !== productId
        )
      );

      setSuccess("Product deleted successfully.");
    } catch (currentError) {
      console.error("Delete product error:", currentError);

      if (handleAuthError(currentError)) {
        return;
      }

      setError(
        currentError.response?.data?.message ||
          "Product could not be deleted."
      );
    } finally {
      setDeletingId("");
    }
  }

  const filteredProducts = useMemo(() => {
    const searchText = search.trim().toLowerCase();
    const selectedCategory = category.trim().toLowerCase();

    return products.filter((product) => {
      const productName = String(
        product.name || ""
      ).toLowerCase();

      const productCategory = String(
        product.category || ""
      ).toLowerCase();

      const productBrand = String(
        product.brand || ""
      ).toLowerCase();

      const matchesSearch =
        !searchText ||
        productName.includes(searchText) ||
        productCategory.includes(searchText) ||
        productBrand.includes(searchText);

      const matchesCategory =
        selectedCategory === "all" ||
        productCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  function getImageUrl(image) {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:")
    ) {
      return image;
    }

    if (
      image.startsWith("/uploads") ||
      image.startsWith("/images")
    ) {
      return mediaUrl(image);
    }

    return image;
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <main className="admin-products-page">
      <div className="admin-products-header">
        <div>
          <p className="admin-small-label">
            Riani Shop Admin
          </p>

          <h1>Products Management</h1>

          <p>Manage all products in the shop.</p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="refresh-products-button"
            onClick={fetchProducts}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

          <button
            type="button"
            className="add-product-button"
            onClick={() =>
              navigate("/admin/products/add")
            }
          >
            Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {success && (
        <div className="success-message">{success}</div>
      )}

      <section className="admin-products-summary">
        <div>
          <span>Total Products</span>
          <strong>{products.length}</strong>
        </div>

        <div>
          <span>In Stock</span>
          <strong>
            {
              products.filter(
                (product) =>
                  Number(product.countInStock || 0) > 0
              ).length
            }
          </strong>
        </div>

        <div>
          <span>Out of Stock</span>
          <strong>
            {
              products.filter(
                (product) =>
                  Number(product.countInStock || 0) <= 0
              ).length
            }
          </strong>
        </div>

        <div>
          <span>On Sale</span>
          <strong>
            {
              products.filter(
                (product) => product.isOnSale
              ).length
            }
          </strong>
        </div>
      </section>

      <div className="admin-product-tools">
        <input
          type="search"
          placeholder="Search by name, category or brand..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="admin-product-search"
        />

        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value)
          }
          className="admin-category-filter"
        >
          <option value="All">All Categories</option>
          <option value="Women">Women</option>
          <option value="Men">Men</option>
          <option value="Kids">Kids</option>
          <option value="Shoes">Shoes</option>
          <option value="Accessories">
            Accessories
          </option>
        </select>
      </div>

      {loading ? (
        <div className="no-products">
          <h2>Loading products...</h2>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="no-products">
          <h2>No products found</h2>
          <p>
            No products match your current search or filter.
          </p>
        </div>
      ) : (
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => {
                const productId =
                  product._id || product.id;

                const imageValue =
                  Array.isArray(product.images) &&
                  product.images.length > 0
                    ? product.images[0]
                    : product.image || "";

                const productImage =
                  getImageUrl(imageValue);

                const regularPrice = Number(
                  product.price || 0
                );

                const salePrice = Number(
                  product.salePrice || 0
                );

                const displayPrice =
                  product.isOnSale && salePrice > 0
                    ? salePrice
                    : regularPrice;

                const stock = Number(
                  product.countInStock || 0
                );

                return (
                  <tr key={productId}>
                    <td>
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={product.name}
                          className="admin-product-image"
                        />
                      ) : (
                        <div className="admin-image-placeholder">
                          No image
                        </div>
                      )}
                    </td>

                    <td>
                      <strong>{product.name}</strong>

                      {product.isFeatured && (
                        <span className="featured-badge">
                          Featured
                        </span>
                      )}
                    </td>

                    <td>{product.category || "-"}</td>

                    <td>{product.brand || "-"}</td>

                    <td>
                      {product.isOnSale &&
                      salePrice > 0 ? (
                        <div className="admin-price-wrapper">
                          <span className="old-price">
                            ${regularPrice.toFixed(2)}
                          </span>

                          <span className="sale-price">
                            ${displayPrice.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        `$${regularPrice.toFixed(2)}`
                      )}
                    </td>

                    <td>
                      <span
                        className={
                          stock > 0
                            ? "stock-available"
                            : "stock-empty"
                        }
                      >
                        {stock}
                      </span>
                    </td>

                    <td>
                      {stock > 0 ? (
                        <span className="status-in-stock">
                          In stock
                        </span>
                      ) : (
                        <span className="status-out-stock">
                          Out of stock
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="product-actions">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() =>
                            navigate(
                              `/admin/products/${productId}/edit`
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          disabled={deletingId === productId}
                          onClick={() =>
                            handleDelete(
                              productId,
                              product.name
                            )
                          }
                        >
                          {deletingId === productId
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default AdminProducts;