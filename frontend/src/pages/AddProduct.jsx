import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../config/api";

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
    imageUrls: [""],
    sizes: [],
    colors: [],
    isFeatured: false,
    isOnSale: false,
    salePrice: "",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
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

  useEffect(() => {
    return () => {
      filePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [filePreviews]);

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

  function handleImageUrlChange(index, value) {
    setFormData((previousData) => {
      const updatedImageUrls = [...previousData.imageUrls];

      updatedImageUrls[index] = value;

      return {
        ...previousData,
        imageUrls: updatedImageUrls,
      };
    });
  }

  function addImageUrlField() {
    setFormData((previousData) => ({
      ...previousData,
      imageUrls: [...previousData.imageUrls, ""],
    }));
  }

  function removeImageUrlField(index) {
    setFormData((previousData) => {
      const updatedImageUrls = previousData.imageUrls.filter(
        (_, imageIndex) => imageIndex !== index
      );

      return {
        ...previousData,
        imageUrls:
          updatedImageUrls.length > 0 ? updatedImageUrls : [""],
      };
    });
  }

  function handleFileChange(event) {
    const newFiles = Array.from(event.target.files || []);

    if (newFiles.length === 0) {
      return;
    }

    const invalidFile = newFiles.find(
      (file) => !file.type.startsWith("image/")
    );

    if (invalidFile) {
      setError("Fadlan sawir keliya dooro.");
      event.target.value = "";
      return;
    }

    const tooLargeFile = newFiles.find(
      (file) => file.size > 5 * 1024 * 1024
    );

    if (tooLargeFile) {
      setError(
        `${tooLargeFile.name} wuxuu ka weyn yahay 5 MB.`
      );

      event.target.value = "";
      return;
    }

    const combinedFiles = [...selectedFiles, ...newFiles];

    if (combinedFiles.length > 10) {
      setError("Ugu badnaan waxaad dooran kartaa 10 sawir.");
      event.target.value = "";
      return;
    }

    filePreviews.forEach((preview) => {
      URL.revokeObjectURL(preview);
    });

    const updatedPreviews = combinedFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setSelectedFiles(combinedFiles);
    setFilePreviews(updatedPreviews);
    setError("");

    event.target.value = "";
  }

  function removeSelectedFile(index) {
    const updatedFiles = selectedFiles.filter(
      (_, fileIndex) => fileIndex !== index
    );

    filePreviews.forEach((preview) => {
      URL.revokeObjectURL(preview);
    });

    const updatedPreviews = updatedFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setSelectedFiles(updatedFiles);
    setFilePreviews(updatedPreviews);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Fadlan marka hore admin ahaan u gal.");
      return;
    }

    const cleanImageUrls = formData.imageUrls
      .map((imageUrl) => imageUrl.trim())
      .filter(Boolean);

    if (
      cleanImageUrls.length === 0 &&
      selectedFiles.length === 0
    ) {
      setError(
        "Fadlan geli ugu yaraan hal Image URL ama sawir ka dooro Desktop-ka."
      );

      return;
    }

    const regularPrice = Number(
      String(formData.price).replace(",", ".")
    );

    const stockAmount = Number(formData.countInStock);

    const salePrice = Number(
      String(formData.salePrice).replace(",", ".")
    );

    if (!Number.isFinite(regularPrice) || regularPrice < 0) {
      setError("Qiimaha product-ka sax ma aha.");
      return;
    }

    if (!Number.isFinite(stockAmount) || stockAmount < 0) {
      setError("Stock-ku ma noqon karo tiro taban.");
      return;
    }

    if (
      formData.isOnSale &&
      (formData.salePrice === "" ||
        !Number.isFinite(salePrice) ||
        salePrice < 0 ||
        salePrice >= regularPrice)
    ) {
      setError(
        "Sale price waa inuu ka hooseeyaa qiimaha caadiga ah."
      );

      return;
    }

    const requestData = new FormData();

    requestData.append("name", formData.name.trim());
    requestData.append("price", String(regularPrice));

    requestData.append(
      "description",
      formData.description.trim()
    );

    requestData.append("category", formData.category);

    requestData.append(
      "brand",
      formData.brand.trim() || "Riani"
    );

    requestData.append(
      "material",
      formData.material.trim()
    );

    requestData.append(
      "countInStock",
      String(stockAmount)
    );

    requestData.append(
      "images",
      JSON.stringify(cleanImageUrls)
    );

    requestData.append(
      "sizes",
      JSON.stringify(formData.sizes)
    );

    requestData.append(
      "colors",
      JSON.stringify(formData.colors)
    );

    requestData.append(
      "isFeatured",
      String(formData.isFeatured)
    );

    requestData.append(
      "isOnSale",
      String(formData.isOnSale)
    );

    requestData.append(
      "salePrice",
      formData.isOnSale ? String(salePrice) : ""
    );

    selectedFiles.forEach((file) => {
      requestData.append("uploadedImages", file);
    });

    try {
      setLoading(true);

      await axios.post(
        apiUrl("/products"),
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Product added successfully!");

      navigate("/admin/products");
    } catch (requestError) {
      console.error("Add product error:", requestError);

      setError(
        requestError.response?.data?.message ||
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
              <label style={labelStyle}>Product Name</label>

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
                name="price"
                step="0.01"
                min="0"
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
                name="countInStock"
                min="0"
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
            <h2 style={sectionTitleStyle}>
              Upload Images From Desktop
            </h2>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleFileChange}
              style={fileInputStyle}
            />

            <p style={helpTextStyle}>
              Waxaad dooran kartaa ilaa 10 sawir. Sawir kasta
              ugu badnaan waa 5 MB.
            </p>

            {filePreviews.length > 0 && (
              <div style={previewGridStyle}>
                {filePreviews.map((preview, index) => (
                  <div
                    key={`${preview}-${index}`}
                    style={previewCardStyle}
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      style={previewImageStyle}
                    />

                    <p style={fileNameStyle}>
                      {selectedFiles[index]?.name}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        removeSelectedFile(index)
                      }
                      style={removePreviewButtonStyle}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={dividerStyle}>
            <span style={dividerTextStyle}>AMA / OR</span>
          </div>

          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              Add Images Using URLs
            </h2>

            {formData.imageUrls.map((imageUrl, index) => (
              <div key={index} style={imageRowStyle}>
                <input
                  type="url"
                  placeholder={`Image URL ${index + 1}`}
                  value={imageUrl}
                  onChange={(event) =>
                    handleImageUrlChange(
                      index,
                      event.target.value
                    )
                  }
                  style={{
                    ...inputStyle,
                    marginBottom: 0,
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    removeImageUrlField(index)
                  }
                  style={removeButtonStyle}
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addImageUrlField}
              style={secondaryButtonStyle}
            >
              Add Another URL
            </button>

            <div style={previewGridStyle}>
              {formData.imageUrls
                .map((imageUrl, index) => ({
                  imageUrl: imageUrl.trim(),
                  index,
                }))
                .filter((item) => item.imageUrl)
                .map((item) => (
                  <div
                    key={`${item.imageUrl}-${item.index}`}
                    style={previewCardStyle}
                  >
                    <img
                      src={item.imageUrl}
                      alt={`URL preview ${item.index + 1}`}
                      style={previewImageStyle}
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  </div>
                ))}
            </div>
          </div>

          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              Available Sizes
            </h2>

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
              Available Colors
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

              Featured Product
            </label>

            <label
              style={{
                ...checkboxStyle,
                marginTop: "12px",
              }}
            >
              <input
                type="checkbox"
                name="isOnSale"
                checked={formData.isOnSale}
                onChange={handleChange}
              />

              Product Is On Sale
            </label>

            {formData.isOnSale && (
              <div style={{ marginTop: "15px" }}>
                <label style={labelStyle}>Sale Price</label>

                <input
                  type="number"
                  name="salePrice"
                  step="0.01"
                  min="0"
                  placeholder="Sale price"
                  value={formData.salePrice}
                  onChange={handleChange}
                  style={inputStyle}
                  required
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
  minHeight: "100vh",
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

const fileInputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "15px",
  border: "2px dashed #aaaaaa",
  borderRadius: "8px",
  backgroundColor: "#fafafa",
  cursor: "pointer",
};

const helpTextStyle = {
  marginTop: "8px",
  color: "#666666",
  fontSize: "14px",
};

const previewGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "15px",
  marginTop: "20px",
};

const previewCardStyle = {
  padding: "10px",
  border: "1px solid #dddddd",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
};

const previewImageStyle = {
  width: "100%",
  height: "150px",
  objectFit: "cover",
  borderRadius: "6px",
};

const fileNameStyle = {
  margin: "8px 0",
  fontSize: "13px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const removePreviewButtonStyle = {
  width: "100%",
  padding: "8px",
  border: "none",
  borderRadius: "5px",
  backgroundColor: "#b00020",
  color: "#ffffff",
  cursor: "pointer",
};

const dividerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "40px 0 10px",
  borderTop: "1px solid #dddddd",
};

const dividerTextStyle = {
  padding: "0 15px",
  backgroundColor: "#ffffff",
  color: "#555555",
  fontWeight: "700",
  transform: "translateY(-50%)",
};

const imageRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "12px",
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