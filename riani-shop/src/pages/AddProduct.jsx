import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AddProduct() {
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSizeChange(event) {
    const { value, checked } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      sizes: checked
        ? [...previousData.sizes, value]
        : previousData.sizes.filter((size) => size !== value),
    }));
  }

  function handleColorChange(event) {
    const { value, checked } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      colors: checked
        ? [...previousData.colors, value]
        : previousData.colors.filter((color) => color !== value),
    }));
  }

  function handleImageChange(index, value) {
    setFormData((previousData) => {
      const updatedImages = [...previousData.images];
      updatedImages[index] = value;

      return {
        ...previousData,
        images: updatedImages,
      };
    });
  }

  function addImageField() {
    setFormData((previousData) => ({
      ...previousData,
      images: [...previousData.images, ""],
    }));
  }

  function removeImageField(index) {
    setFormData((previousData) => ({
      ...previousData,
      images: previousData.images.filter(
        (_, imageIndex) => imageIndex !== index
      ),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Fadlan marka hore admin ahaan u gal.");
      return;
    }

    const cleanImages = formData.images
      .map((image) => image.trim())
      .filter(Boolean);

    if (cleanImages.length === 0) {
      setError("Fadlan geli ugu yaraan hal sawir.");
      return;
    }

    if (Number(formData.price) < 0) {
      setError("Qiimaha product-ka sax ma aha.");
      return;
    }

    if (Number(formData.countInStock) < 0) {
      setError("Stock-ku ma noqon karo tiro taban.");
      return;
    }

    if (
      formData.isOnSale &&
      (formData.salePrice === "" ||
        Number(formData.salePrice) >= Number(formData.price))
    ) {
      setError(
        "Sale price waa inuu ka hooseeyaa qiimaha caadiga ah."
      );
      return;
    }

    const productData = {
      name: formData.name.trim(),
      price: Number(String(formData.price).replace(",", ".")),
      description: formData.description.trim(),
      category: formData.category,
      brand: formData.brand.trim() || "Riani",
      material: formData.material.trim(),
      countInStock: Number(formData.countInStock),
      images: cleanImages,
      sizes: formData.sizes,
      colors: formData.colors,
      isFeatured: formData.isFeatured,
      isOnSale: formData.isOnSale,
      salePrice: formData.isOnSale
        ? Number(String(formData.salePrice).replace(",", "."))
        : null,
    };

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/products",
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Product added successfully!");
      navigate("/admin/products");
    } catch (error) {
      console.error("Add product error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to add product."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Add Product</h1>

        {error && <p style={errorStyle}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Product name</label>

              <input
                type="text"
                name="name"
                placeholder="Product name"
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
                step="0.01"
                min="0"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Category</label>

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
                placeholder="Brand"
                value={formData.brand}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Material</label>

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
                min="0"
                name="countInStock"
                placeholder="Stock"
                value={formData.countInStock}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div style={sectionStyle}>
            <label style={labelStyle}>Description</label>

            <textarea
              name="description"
              placeholder="Product description"
              value={formData.description}
              onChange={handleChange}
              style={{
                ...inputStyle,
                minHeight: "130px",
                resize: "vertical",
              }}
              required
            />
          </div>

          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Product images</h2>

            {formData.images.map((image, index) => (
              <div key={index} style={imageRowStyle}>
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
                  style={{
                    ...inputStyle,
                    marginBottom: 0,
                  }}
                />

                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
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
            <h2 style={sectionTitleStyle}>Available sizes</h2>

            <div style={optionsStyle}>
              {availableSizes.map((size) => (
                <label key={size} style={checkboxStyle}>
                  <input
                    type="checkbox"
                    value={size}
                    checked={formData.sizes.includes(size)}
                    onChange={handleSizeChange}
                  />

                  {size}
                </label>
              ))}
            </div>
          </div>

          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              Available colors
            </h2>

            <div style={optionsStyle}>
              {availableColors.map((color) => (
                <label key={color} style={checkboxStyle}>
                  <input
                    type="checkbox"
                    value={color}
                    checked={formData.colors.includes(color)}
                    onChange={handleColorChange}
                  />

                  {color}
                </label>
              ))}
            </div>
          </div>

          <div style={sectionStyle}>
            <label style={checkboxStyle}>
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
              />

              Featured product
            </label>

            <label style={checkboxStyle}>
              <input
                type="checkbox"
                name="isOnSale"
                checked={formData.isOnSale}
                onChange={handleChange}
              />

              Product is on sale
            </label>

            {formData.isOnSale && (
              <div style={{ marginTop: "15px" }}>
                <label style={labelStyle}>Sale price</label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="salePrice"
                  placeholder="Sale price"
                  value={formData.salePrice}
                  onChange={handleChange}
                  style={inputStyle}
                  required={formData.isOnSale}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...submitButtonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading ? "Adding Product..." : "Add Product"}
          </button>
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

const titleStyle = {
  marginTop: 0,
  marginBottom: "30px",
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
  boxSizing: "border-box",
  padding: "12px",
  marginBottom: "10px",
  border: "1px solid #cccccc",
  borderRadius: "6px",
  fontSize: "15px",
};

const optionsStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
};

const checkboxStyle = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  padding: "9px 12px",
  border: "1px solid #dddddd",
  borderRadius: "6px",
  cursor: "pointer",
};

const imageRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "12px",
};

const submitButtonStyle = {
  width: "100%",
  marginTop: "35px",
  padding: "15px",
  border: "none",
  borderRadius: "7px",
  backgroundColor: "#222222",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "700",
};

const secondaryButtonStyle = {
  marginTop: "5px",
  padding: "10px 16px",
  border: "1px solid #222222",
  borderRadius: "6px",
  backgroundColor: "#ffffff",
  cursor: "pointer",
};

const removeButtonStyle = {
  padding: "11px 14px",
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

export default AddProduct;