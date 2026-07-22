import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/AdminProducts.css";

function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5000/api/products"
      );

      const productsData = Array.isArray(response.data)
        ? response.data
        : response.data.products || [];

      setProducts(productsData);
    } catch (error) {
      console.error("Fetch products error:", error);

      setError(
        error.response?.data?.message ||
          "Products-ka lama soo qaadi karin."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleDelete(productId, productName) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${productName}"?`
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login as admin first.");
      navigate("/login");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) => product._id !== productId
        )
      );

      alert("Product deleted successfully.");
    } catch (error) {
      console.error("Delete product error:", error);

      alert(
        error.response?.data?.message ||
          "Product could not be deleted."
      );
    }
  }

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase().trim();

    const productName = product.name?.toLowerCase() || "";
    const productCategory =
      product.category?.toLowerCase() || "";
    const productBrand = product.brand?.toLowerCase() || "";

    const matchesSearch =
      productName.includes(searchText) ||
      productCategory.includes(searchText) ||
      productBrand.includes(searchText);

    const matchesCategory =
      category === "All" ||
      product.category === category;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <main className="admin-products-page">
        <h2>Loading products...</h2>
      </main>
    );
  }

  return (
    <main className="admin-products-page">
      <div className="admin-products-header">
        <div>
          <h1>Products Management</h1>
          <p>Manage all products in the shop.</p>
        </div>

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

      <div className="admin-product-tools">
        <input
          type="text"
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

      {error && (
        <p className="error-message">{error}</p>
      )}

      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <p>No products found.</p>
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
                const productImage =
                  Array.isArray(product.images) &&
                  product.images.length > 0
                    ? product.images[0]
                    : product.image || "";

                const displayPrice =
                  product.isOnSale &&
                  product.salePrice !== null &&
                  product.salePrice !== undefined
                    ? product.salePrice
                    : product.price;

                return (
                  <tr key={product._id}>
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

                    <td>{product.category}</td>

                    <td>{product.brand || "-"}</td>

                    <td>
                      {product.isOnSale ? (
                        <div className="admin-price-wrapper">
                          <span className="old-price">
                            ${Number(product.price).toFixed(2)}
                          </span>

                          <span className="sale-price">
                            ${Number(displayPrice).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        `$${Number(product.price).toFixed(2)}`
                      )}
                    </td>

                    <td>
                      <span
                        className={
                          product.countInStock > 0
                            ? "stock-available"
                            : "stock-empty"
                        }
                      >
                        {product.countInStock}
                      </span>
                    </td>

                    <td>
                      {product.countInStock > 0 ? (
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
                              `/admin/products/${product._id}/edit`
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() =>
                            handleDelete(
                              product._id,
                              product.name
                            )
                          }
                        >
                          Delete
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