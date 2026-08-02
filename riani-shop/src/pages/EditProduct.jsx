import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../config/api";

const availableSizes = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "One Size",
];

const availableColors = [
  "Black",
  "White",
  "Beige",
  "Blue",
  "Red",
  "Green",
  "Pink",
  "Brown",
  "Grey",
];

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "Women",
    brand: "Riani",
    material: "",
    countInStock: "",
    images: [""],
    sizes: [],
    colors: [],
    isFeatured: false,
    isOnSale: false,
    salePrice: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");

        const { data: product } = await axios.get(
          apiUrl(`/api/products/${id}`)
        );

        const productImages =
          Array.isArray(product.images) &&
          product.images.length > 0
            ? product.images
            : product.image
              ? [product.image]
              : [""];

        setFormData({
          name: product.name || "",
          price: product.price ?? "",
          description: product.description || "",
          category: product.category || "Women",
          brand: product.brand || "Riani",
          material: product.material || "",
          countInStock: product.countInStock ?? "",
          images: productImages,
          sizes: Array.isArray(product.sizes)
            ? product.sizes
            : [],
          colors: Array.isArray(product.colors)
            ? product.colors
            : [],
          isFeatured: Boolean(product.isFeatured),
          isOnSale: Boolean(product.isOnSale),
          salePrice: product.salePrice ?? "",
        });
      } catch (error) {
        console.error("Fetch product error:", error);

        setError(
          error.response?.data?.message ||
            "Product-ka lama soo qaadi karin."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSizeChange(event) {
    const { value, checked } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      sizes: checked
        ? [...currentData.sizes, value]
        : currentData.sizes.filter(
            (size) => size !== value
          ),
    }));
  }

  function handleColorChange(event) {
    const { value, checked } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      colors: checked
        ? [...currentData.colors, value]
        : currentData.colors.filter(
            (color) => color !== value
          ),
    }));
  }

  function handleImageChange(index, value) {
    setFormData((currentData) => {
      const updatedImages = [...currentData.images];
      updatedImages[index] = value;

      return {
        ...currentData,
        images: updatedImages,
      };
    });
  }

  function addImageField() {
    setFormData((currentData) => ({
      ...currentData,
      images: [...currentData.images, ""],
    }));
  }

  function removeImageField(index) {
    setFormData((currentData) => ({
      ...currentData,
      images: currentData.images.filter(
        (_, imageIndex) => imageIndex !== index
      ),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Fadlan marka hore admin ahaan u gal.");
      return;
    }

    const price = Number(
      String(formData.price).replace(",", ".")
    );

    const countInStock = Number(formData.countInStock);

    const cleanImages = formData.images
      .map((image) => image.trim())
      .filter(Boolean);

    if (!formData.name.trim()) {
      setError("Product name-ka waa waajib.");
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      setError(
        "Qiimaha si sax ah u qor, tusaale ahaan 69.99."
      );
      return;
    }

    if (
      Number.isNaN(countInStock) ||
      countInStock < 0
    ) {
      setError(
        "Stock-ku waa inuu noqdaa tiro eber ama ka badan."
      );
      return;
    }

    if (cleanImages.length === 0) {
      setError("Geli ugu yaraan hal sawir.");
      return;
    }

    let salePrice = null;

    if (formData.isOnSale) {
      salePrice = Number(
        String(formData.salePrice).replace(",", ".")
      );

      if (
        Number.isNaN(salePrice) ||
        salePrice < 0 ||
        salePrice >= price
      ) {
        setError(
          "Sale price-ku waa inuu ka hooseeyaa qiimaha caadiga ah."
        );
        return;
      }
    }

    const updatedProduct = {
      name: formData.name.trim(),
      price,
      description: formData.description.trim(),
      category: formData.category,
      brand: formData.brand.trim() || "Riani",
      material: formData.material.trim(),
      countInStock,
      images: cleanImages,
      sizes: formData.sizes,
      colors: formData.colors,
      isFeatured: formData.isFeatured,
      isOnSale: formData.isOnSale,
      salePrice,
    };

    try {
      setSaving(true);

      await axios.put(
        apiUrl(`/api/products/${id}`),
        updatedProduct,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage(
        "Product-ka si guul leh ayaa loo cusboonaysiiyey."
      );

      setTimeout(() => {
        navigate("/admin/products");
      }, 1000);
    } catch (error) {
      console.error("Update product error:", error);

      setError(
        error.response?.data?.message ||
          "Product-ka lama cusboonaysiin karin."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <h2>Loading product...</h2>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ marginTop: 0 }}>Edit Product</h1>

        {error && <p style={errorStyle}>{error}</p>}

        {message && (
          <p style={successStyle}>{message}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>
                Product Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Price</label>

              <input
                type="number"
                name="price"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={inputStyle}
                required
              >
                <option value="Women">Women</option>
                <option value="Men">Men</option>
                <option value="Kids">Kids</option>
                <option value="Shoes">Shoes</option>
                <option value="Accessories">
                  Accessories
                </option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Brand</label>

              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Material
              </label>

              <input
                type="text"
                name="material"
                placeholder="Example: 100% Cotton"
                value={formData.material}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Stock</label>

              <input
                type="number"
                name="countInStock"
                min="0"
                value={formData.countInStock}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div style={sectionStyle}>
            <label style={labelStyle}>
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="6"
              style={{
                ...inputStyle,
                resize: "vertical",
              }}
              required
            />
          </div>

          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              Product Images
            </h2>

            {formData.images.map((image, index) => (
              <div key={index} style={imageRowStyle}>
                <div style={{ flex: 1 }}>
                  <input
                    type="url"
                    placeholder={`Image URL ${index + 1}`}
                    value={image}
                    onChange={(event) =>
                      handleImageChange(
                        index,
                        event.target.value
                      )
                    }
                    style={inputStyle}
                  />

                  {image && (
                    <img
                      src={image}
                      alt={`Product preview ${index + 1}`}
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                      style={previewStyle}
                    />
                  )}
                </div>

                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      removeImageField(index)
                    }
                    style={removeButtonStyle}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addImageField}
              style={secondaryButtonStyle}
            >
              Add Another Image
            </button>
          </div>

          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              Available Sizes
            </h2>

            <div style={optionsStyle}>
              {availableSizes.map((size) => (
                <label key={size} style={optionStyle}>
                  <input
                    type="checkbox"
                    value={size}
                    checked={formData.sizes.includes(
                      size
                    )}
                    onChange={handleSizeChange}
                  />

                  {size}
                </label>
              ))}
            </div>
          </div>

          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              Available Colors
            </h2>

            <div style={optionsStyle}>
              {availableColors.map((color) => (
                <label key={color} style={optionStyle}>
                  <input
                    type="checkbox"
                    value={color}
                    checked={formData.colors.includes(
                      color
                    )}
                    onChange={handleColorChange}
                  />

                  {color}
                </label>
              ))}
            </div>
          </div>

          <div style={sectionStyle}>
            <label style={optionStyle}>
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
              />

              Featured product
            </label>

            <label
              style={{
                ...optionStyle,
                marginTop: "12px",
              }}
            >
              <input
                type="checkbox"
                name="isOnSale"
                checked={formData.isOnSale}
                onChange={handleChange}
              />

              Product is on sale
            </label>

            {formData.isOnSale && (
              <div style={{ marginTop: "18px" }}>
                <label style={labelStyle}>
                  Sale Price
                </label>

                <input
                  type="number"
                  name="salePrice"
                  step="0.01"
                  min="0"
                  value={formData.salePrice}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
            )}
          </div>

          <div style={buttonContainerStyle}>
            <button
              type="button"
              onClick={() =>
                navigate("/admin/products")
              }
              style={cancelButtonStyle}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                ...submitButtonStyle,
                opacity: saving ? 0.7 : 1,
                cursor: saving
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

const pageStyle = {
  minHeight: "80vh",
  padding: "50px 20px",
  backgroundColor: "#f6f6f6",
};

const cardStyle = {
  maxWidth: "950px",
  margin: "0 auto",
  padding: "35px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "20px",
};

const sectionStyle = {
  marginTop: "30px",
};

const sectionTitleStyle = {
  marginBottom: "15px",
  fontSize: "18px",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "600",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  boxSizing: "border-box",
  border: "1px solid #cccccc",
  borderRadius: "6px",
  fontSize: "15px",
};

const imageRowStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  marginBottom: "18px",
};

const previewStyle = {
  width: "130px",
  height: "130px",
  marginTop: "10px",
  objectFit: "cover",
  borderRadius: "8px",
  border: "1px solid #dddddd",
};

const optionsStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
};

const optionStyle = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  padding: "9px 12px",
  border: "1px solid #dddddd",
  borderRadius: "6px",
  cursor: "pointer",
};

const buttonContainerStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "15px",
  marginTop: "35px",
};

const submitButtonStyle = {
  padding: "13px 25px",
  border: "none",
  borderRadius: "7px",
  backgroundColor: "#222222",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "700",
};

const cancelButtonStyle = {
  padding: "13px 25px",
  border: "1px solid #222222",
  borderRadius: "7px",
  backgroundColor: "#ffffff",
  color: "#222222",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  padding: "10px 16px",
  border: "1px solid #222222",
  borderRadius: "6px",
  backgroundColor: "#ffffff",
  cursor: "pointer",
};

const removeButtonStyle = {
  marginTop: "1px",
  padding: "12px 15px",
  border: "none",
  borderRadius: "6px",
  backgroundColor: "#b00020",
  color: "#ffffff",
  cursor: "pointer",
};

const errorStyle = {
  padding: "12px",
  marginBottom: "20px",
  borderRadius: "6px",
  backgroundColor: "#ffe5e5",
  color: "#b00020",
};

const successStyle = {
  padding: "12px",
  marginBottom: "20px",
  borderRadius: "6px",
  backgroundColor: "#e5f8e8",
  color: "#167329",
};

export default EditProduct;