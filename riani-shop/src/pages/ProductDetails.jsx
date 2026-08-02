import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import axios from "axios";

import { CartContext } from "../context/CartContext";
import { apiUrl, mediaUrl } from "../config/api";

import womenJacket from "../assets/images/products/women-jacket.jpg";
import menJacket from "../assets/images/products/men-jacket.jpg";
import sneakers from "../assets/images/products/sneakers.jpg";
import dress from "../assets/images/products/dress.jpg";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  const [error, setError] = useState("");
  const [selectionError, setSelectionError] =
    useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");
        setSelectionError("");
        setSuccessMessage("");
        setQuantity(1);

        const productResponse = await axios.get(
          apiUrl(`/api/products/${id}`)
        );

        const productData = productResponse.data;

        setProduct(productData);

        const productImages =
          getProductImages(productData);

        setSelectedImage(productImages[0] || "");

        const sizes = Array.isArray(productData.sizes)
          ? productData.sizes
          : [];

        const colors = Array.isArray(productData.colors)
          ? productData.colors
          : [];

        setSelectedSize(
          sizes.length === 1 ? sizes[0] : ""
        );

        setSelectedColor(
          colors.length === 1 ? colors[0] : ""
        );

        const allProductsResponse = await axios.get(
          apiUrl("/api/products")
        );

        const allProducts = Array.isArray(
          allProductsResponse.data
        )
          ? allProductsResponse.data
          : allProductsResponse.data.products || [];

        const related = allProducts.filter(
          (item) =>
            item.category === productData.category &&
            item._id !== productData._id
        );

        setRelatedProducts(related.slice(0, 4));
      } catch (error) {
        console.error("Fetch product error:", error);

        setError(
          error.response?.data?.message ||
            "Product-ka lama helin."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  function getFallbackImage(productItem) {
    const localImages = {
      "Women's Jacket": womenJacket,
      "Women Jacket": womenJacket,
      "Men Jacket": menJacket,
      "Men's Jacket": menJacket,
      "White Sneakers": sneakers,
      Sneakers: sneakers,
      "Elegant Dress": dress,
      Dress: dress,
    };

    return localImages[productItem?.name] || "";
  }

  function normalizeImageUrl(image) {
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

    if (image.startsWith("/uploads")) {
      return mediaUrl(image);
    }

    return image;
  }

  function getProductImages(productItem) {
    if (!productItem) {
      return [];
    }

    const images = Array.isArray(productItem.images)
      ? productItem.images
          .map((image) => normalizeImageUrl(image))
          .filter(Boolean)
      : [];

    if (images.length > 0) {
      return images;
    }

    if (productItem.image) {
      return [
        normalizeImageUrl(productItem.image),
      ].filter(Boolean);
    }

    const fallbackImage =
      getFallbackImage(productItem);

    return fallbackImage ? [fallbackImage] : [];
  }

  const productImages = useMemo(
    () => getProductImages(product),
    [product]
  );

  if (loading) {
    return (
      <main style={statusPageStyle}>
        <h2>Loading product...</h2>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main style={statusPageStyle}>
        <h1>Product not found</h1>

        <p style={{ color: "#666666" }}>
          {error}
        </p>

        <button
          type="button"
          onClick={() => navigate("/shop")}
          style={primaryButtonStyle}
        >
          Back to Shop
        </button>
      </main>
    );
  }

  const price = Number(product.price || 0);

  const salePrice =
    product.salePrice !== null &&
    product.salePrice !== undefined &&
    product.salePrice !== ""
      ? Number(product.salePrice)
      : null;

  const isValidSale =
    product.isOnSale &&
    salePrice !== null &&
    !Number.isNaN(salePrice) &&
    salePrice >= 0 &&
    salePrice < price;

  const currentPrice = isValidSale
    ? salePrice
    : price;

  const stock = Number(
    product.countInStock ?? 0
  );

  const availableSizes = Array.isArray(
    product.sizes
  )
    ? product.sizes
    : [];

  const availableColors = Array.isArray(
    product.colors
  )
    ? product.colors
    : [];

  function increaseQuantity() {
    setSuccessMessage("");

    if (quantity < stock) {
      setQuantity((currentQuantity) =>
        currentQuantity + 1
      );
    }
  }

  function decreaseQuantity() {
    setSuccessMessage("");

    if (quantity > 1) {
      setQuantity((currentQuantity) =>
        currentQuantity - 1
      );
    }
  }

  function handleSizeSelect(size) {
    setSelectedSize(size);
    setSelectionError("");
    setSuccessMessage("");
  }

  function handleColorSelect(color) {
    setSelectedColor(color);
    setSelectionError("");
    setSuccessMessage("");
  }

  function handleAddToCart() {
    setSelectionError("");
    setSuccessMessage("");

    if (stock <= 0) {
      setSelectionError(
        "Product-kan hadda stock kuma jiro."
      );
      return;
    }

    if (
      availableSizes.length > 0 &&
      !selectedSize
    ) {
      setSelectionError(
        "Fadlan dooro size-ka aad rabto."
      );
      return;
    }

    if (
      availableColors.length > 0 &&
      !selectedColor
    ) {
      setSelectionError(
        "Fadlan dooro color-ka aad rabto."
      );
      return;
    }

    try {
      setAddingToCart(true);

      addToCart({
        id: product._id || product.id,
        _id: product._id || product.id,
        productId: product._id || product.id,

        name: product.name,
        category: product.category,
        brand: product.brand,

        image:
          selectedImage ||
          productImages[0] ||
          "",

        images: productImages,

        price: currentPrice,
        originalPrice: price,

        isOnSale: isValidSale,
        salePrice: isValidSale
          ? salePrice
          : null,

        size: selectedSize || null,
        selectedSize: selectedSize || null,

        color: selectedColor || null,
        selectedColor: selectedColor || null,

        quantity,
        countInStock: stock,
      });

      setSuccessMessage(
        `${product.name} waxaa lagu daray cart-ka.`
      );
    } catch (error) {
      console.error("Add to cart error:", error);

      setSelectionError(
        "Product-ka cart-ka laguma darin."
      );
    } finally {
      setAddingToCart(false);
    }
  }

  return (
    <main style={pageStyle}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        style={backButtonStyle}
      >
        ← Back
      </button>

      <section style={productSectionStyle}>
        <div style={galleryStyle}>
          <div style={mainImageWrapperStyle}>
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                style={mainImageStyle}
                onError={(event) => {
                  event.currentTarget.src =
                    getFallbackImage(product);
                }}
              />
            ) : (
              <div style={noImageStyle}>
                No image available
              </div>
            )}

            {isValidSale && (
              <span style={saleBadgeStyle}>
                Sale
              </span>
            )}

            {product.isFeatured && (
              <span style={featuredBadgeStyle}>
                Featured
              </span>
            )}
          </div>

          {productImages.length > 1 && (
            <div style={thumbnailContainerStyle}>
              {productImages.map(
                (image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() =>
                      setSelectedImage(image)
                    }
                    aria-label={`View product image ${
                      index + 1
                    }`}
                    style={{
                      ...thumbnailButtonStyle,
                      border:
                        selectedImage === image
                          ? "2px solid #111111"
                          : "1px solid #dddddd",
                    }}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${
                        index + 1
                      }`}
                      style={thumbnailImageStyle}
                    />
                  </button>
                )
              )}
            </div>
          )}
        </div>

        <div style={productInfoStyle}>
          <p style={categoryStyle}>
            {product.category || "Product"}
          </p>

          <h1 style={productTitleStyle}>
            {product.name}
          </h1>

          {product.brand && (
            <p style={brandStyle}>
              Brand: <strong>{product.brand}</strong>
            </p>
          )}

          <div style={ratingStyle}>
            <span>
              {"★".repeat(
                Math.round(
                  Number(product.rating || 0)
                )
              )}
              {"☆".repeat(
                Math.max(
                  0,
                  5 -
                    Math.round(
                      Number(
                        product.rating || 0
                      )
                    )
                )
              )}
            </span>

            <span style={reviewCountStyle}>
              {Number(product.numReviews || 0)}{" "}
              reviews
            </span>
          </div>

          <div style={priceContainerStyle}>
            {isValidSale ? (
              <>
                <span style={salePriceStyle}>
                  ${salePrice.toFixed(2)}
                </span>

                <span style={oldPriceStyle}>
                  ${price.toFixed(2)}
                </span>
              </>
            ) : (
              <span style={normalPriceStyle}>
                ${price.toFixed(2)}
              </span>
            )}
          </div>

          <p style={descriptionStyle}>
            {product.description ||
              "High quality product from Riani Shop."}
          </p>

          <div style={productDetailsBoxStyle}>
            {product.material && (
              <p style={detailRowStyle}>
                <strong>Material:</strong>
                <span>{product.material}</span>
              </p>
            )}

            <p style={detailRowStyle}>
              <strong>Availability:</strong>

              <span
                style={{
                  color:
                    stock > 0
                      ? "#167329"
                      : "#b00020",
                  fontWeight: "700",
                }}
              >
                {stock > 0
                  ? `${stock} in stock`
                  : "Out of stock"}
              </span>
            </p>
          </div>

          {availableColors.length > 0 && (
            <div style={optionSectionStyle}>
              <div style={optionHeaderStyle}>
                <h3 style={optionTitleStyle}>
                  Color
                </h3>

                {selectedColor && (
                  <span style={selectedValueStyle}>
                    {selectedColor}
                  </span>
                )}
              </div>

              <div style={optionListStyle}>
                {availableColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      handleColorSelect(color)
                    }
                    style={{
                      ...choiceButtonStyle,
                      backgroundColor:
                        selectedColor === color
                          ? "#111111"
                          : "#ffffff",
                      color:
                        selectedColor === color
                          ? "#ffffff"
                          : "#111111",
                      borderColor:
                        selectedColor === color
                          ? "#111111"
                          : "#cccccc",
                    }}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {availableSizes.length > 0 && (
            <div style={optionSectionStyle}>
              <div style={optionHeaderStyle}>
                <h3 style={optionTitleStyle}>
                  Size
                </h3>

                {selectedSize && (
                  <span style={selectedValueStyle}>
                    {selectedSize}
                  </span>
                )}
              </div>

              <div style={optionListStyle}>
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      handleSizeSelect(size)
                    }
                    style={{
                      ...sizeButtonStyle,
                      backgroundColor:
                        selectedSize === size
                          ? "#111111"
                          : "#ffffff",
                      color:
                        selectedSize === size
                          ? "#ffffff"
                          : "#111111",
                      borderColor:
                        selectedSize === size
                          ? "#111111"
                          : "#cccccc",
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={quantitySectionStyle}>
            <h3 style={optionTitleStyle}>
              Quantity
            </h3>

            <div style={quantityControlStyle}>
              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                style={{
                  ...quantityButtonStyle,
                  opacity:
                    quantity <= 1 ? 0.5 : 1,
                }}
              >
                −
              </button>

              <span style={quantityValueStyle}>
                {quantity}
              </span>

              <button
                type="button"
                onClick={increaseQuantity}
                disabled={
                  stock <= 0 ||
                  quantity >= stock
                }
                style={{
                  ...quantityButtonStyle,
                  opacity:
                    stock <= 0 ||
                    quantity >= stock
                      ? 0.5
                      : 1,
                }}
              >
                +
              </button>
            </div>
          </div>

          {selectionError && (
            <p style={errorMessageStyle}>
              {selectionError}
            </p>
          )}

          {successMessage && (
            <p style={successMessageStyle}>
              {successMessage}
            </p>
          )}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={
              stock <= 0 || addingToCart
            }
            style={{
              ...addToCartButtonStyle,
              opacity:
                stock <= 0 || addingToCart
                  ? 0.6
                  : 1,
              cursor:
                stock <= 0 || addingToCart
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {stock <= 0
              ? "Out of Stock"
              : addingToCart
                ? "Adding..."
                : "Add To Cart"}
          </button>

          <div style={shippingInfoStyle}>
            <p>✓ Secure checkout</p>
            <p>✓ Easy returns</p>
            <p>✓ Fast delivery</p>
          </div>
        </div>
      </section>

      <section style={descriptionSectionStyle}>
        <h2 style={sectionHeadingStyle}>
          Product Information
        </h2>

        <div style={informationGridStyle}>
          <div>
            <h3>Description</h3>

            <p style={informationTextStyle}>
              {product.description ||
                "High quality product from Riani Shop."}
            </p>
          </div>

          <div>
            <h3>Details</h3>

            <p style={informationTextStyle}>
              <strong>Category:</strong>{" "}
              {product.category || "-"}
            </p>

            <p style={informationTextStyle}>
              <strong>Brand:</strong>{" "}
              {product.brand || "Riani"}
            </p>

            <p style={informationTextStyle}>
              <strong>Material:</strong>{" "}
              {product.material || "-"}
            </p>
          </div>
        </div>
      </section>

      <section style={relatedSectionStyle}>
        <div style={relatedHeaderStyle}>
          <h2 style={sectionHeadingStyle}>
            Related Products
          </h2>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/shop?category=${encodeURIComponent(
                  product.category || ""
                )}`
              )
            }
            style={viewAllButtonStyle}
          >
            View All
          </button>
        </div>

        {relatedProducts.length === 0 ? (
          <p style={{ color: "#666666" }}>
            No related products found.
          </p>
        ) : (
          <div style={relatedGridStyle}>
            {relatedProducts.map((item) => {
              const itemImages =
                getProductImages(item);

              const itemPrice = Number(
                item.price || 0
              );

              const itemSalePrice =
                item.salePrice !== null &&
                item.salePrice !== undefined
                  ? Number(item.salePrice)
                  : null;

              const itemHasSale =
                item.isOnSale &&
                itemSalePrice !== null &&
                !Number.isNaN(itemSalePrice) &&
                itemSalePrice < itemPrice;

              return (
                <article
                  key={item._id}
                  onClick={() =>
                    navigate(
                      `/product/${item._id}`
                    )
                  }
                  style={relatedCardStyle}
                >
                  <div
                    style={relatedImageWrapperStyle}
                  >
                    {itemImages[0] ? (
                      <img
                        src={itemImages[0]}
                        alt={item.name}
                        style={relatedImageStyle}
                      />
                    ) : (
                      <div style={noImageStyle}>
                        No image
                      </div>
                    )}

                    {itemHasSale && (
                      <span
                        style={relatedSaleBadgeStyle}
                      >
                        Sale
                      </span>
                    )}
                  </div>

                  <div style={relatedInfoStyle}>
                    <p style={relatedCategoryStyle}>
                      {item.category}
                    </p>

                    <h3 style={relatedNameStyle}>
                      {item.name}
                    </h3>

                    <div
                      style={
                        relatedPriceContainerStyle
                      }
                    >
                      {itemHasSale ? (
                        <>
                          <span
                            style={
                              relatedSalePriceStyle
                            }
                          >
                            $
                            {itemSalePrice.toFixed(
                              2
                            )}
                          </span>

                          <span
                            style={
                              relatedOldPriceStyle
                            }
                          >
                            $
                            {itemPrice.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span>
                          ${itemPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

const pageStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "40px 20px 80px",
};

const statusPageStyle = {
  minHeight: "60vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "15px",
  padding: "30px",
  textAlign: "center",
};

const backButtonStyle = {
  marginBottom: "25px",
  padding: "9px 0",
  border: "none",
  background: "transparent",
  color: "#333333",
  fontSize: "15px",
  cursor: "pointer",
};

const productSectionStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "60px",
  alignItems: "start",
};

const galleryStyle = {
  minWidth: 0,
};

const mainImageWrapperStyle = {
  position: "relative",
  width: "100%",
  minHeight: "520px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  backgroundColor: "#f5f5f5",
  borderRadius: "14px",
};

const mainImageStyle = {
  width: "100%",
  height: "600px",
  objectFit: "contain",
};

const noImageStyle = {
  width: "100%",
  minHeight: "220px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#eeeeee",
  color: "#777777",
};

const saleBadgeStyle = {
  position: "absolute",
  top: "18px",
  left: "18px",
  padding: "7px 13px",
  borderRadius: "20px",
  backgroundColor: "#b00020",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: "700",
};

const featuredBadgeStyle = {
  position: "absolute",
  top: "18px",
  right: "18px",
  padding: "7px 13px",
  borderRadius: "20px",
  backgroundColor: "#111111",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: "700",
};

const thumbnailContainerStyle = {
  display: "flex",
  gap: "12px",
  marginTop: "15px",
  paddingBottom: "5px",
  overflowX: "auto",
};

const thumbnailButtonStyle = {
  width: "85px",
  minWidth: "85px",
  height: "100px",
  padding: "3px",
  overflow: "hidden",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  cursor: "pointer",
};

const thumbnailImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "5px",
};

const productInfoStyle = {
  minWidth: 0,
};

const categoryStyle = {
  margin: "0 0 8px",
  color: "#777777",
  fontSize: "14px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "1px",
};

const productTitleStyle = {
  margin: "0 0 10px",
  fontSize: "clamp(30px, 5vw, 48px)",
  lineHeight: 1.1,
};

const brandStyle = {
  color: "#555555",
};

const ratingStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginTop: "15px",
  color: "#d49b00",
};

const reviewCountStyle = {
  color: "#777777",
  fontSize: "14px",
};

const priceContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "13px",
  margin: "24px 0",
};

const normalPriceStyle = {
  fontSize: "30px",
  fontWeight: "800",
};

const salePriceStyle = {
  color: "#b00020",
  fontSize: "30px",
  fontWeight: "800",
};

const oldPriceStyle = {
  color: "#888888",
  fontSize: "19px",
  textDecoration: "line-through",
};

const descriptionStyle = {
  color: "#555555",
  fontSize: "16px",
  lineHeight: 1.75,
};

const productDetailsBoxStyle = {
  marginTop: "24px",
  padding: "18px",
  borderRadius: "10px",
  backgroundColor: "#f7f7f7",
};

const detailRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  margin: "7px 0",
};

const optionSectionStyle = {
  marginTop: "28px",
};

const optionHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "12px",
};

const optionTitleStyle = {
  margin: 0,
  fontSize: "16px",
};

const selectedValueStyle = {
  color: "#666666",
  fontSize: "14px",
};

const optionListStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
};

const choiceButtonStyle = {
  padding: "10px 16px",
  border: "1px solid #cccccc",
  borderRadius: "7px",
  fontSize: "14px",
  cursor: "pointer",
};

const sizeButtonStyle = {
  minWidth: "48px",
  padding: "10px 13px",
  border: "1px solid #cccccc",
  borderRadius: "7px",
  fontSize: "14px",
  cursor: "pointer",
};

const quantitySectionStyle = {
  marginTop: "28px",
};

const quantityControlStyle = {
  width: "fit-content",
  display: "flex",
  alignItems: "center",
  marginTop: "12px",
  overflow: "hidden",
  border: "1px solid #cccccc",
  borderRadius: "8px",
};

const quantityButtonStyle = {
  width: "44px",
  height: "44px",
  border: "none",
  backgroundColor: "#f3f3f3",
  fontSize: "22px",
  cursor: "pointer",
};

const quantityValueStyle = {
  minWidth: "50px",
  textAlign: "center",
  fontWeight: "700",
};

const errorMessageStyle = {
  padding: "12px",
  marginTop: "20px",
  borderRadius: "7px",
  backgroundColor: "#ffe5e5",
  color: "#b00020",
};

const successMessageStyle = {
  padding: "12px",
  marginTop: "20px",
  borderRadius: "7px",
  backgroundColor: "#e5f8e8",
  color: "#167329",
};

const addToCartButtonStyle = {
  width: "100%",
  marginTop: "24px",
  padding: "16px 25px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#111111",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "700",
};

const shippingInfoStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px 22px",
  marginTop: "20px",
  color: "#555555",
  fontSize: "14px",
};

const descriptionSectionStyle = {
  marginTop: "80px",
  paddingTop: "40px",
  borderTop: "1px solid #e3e3e3",
};

const sectionHeadingStyle = {
  margin: 0,
  fontSize: "28px",
};

const informationGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "45px",
  marginTop: "25px",
};

const informationTextStyle = {
  color: "#555555",
  lineHeight: 1.7,
};

const relatedSectionStyle = {
  marginTop: "80px",
};

const relatedHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "20px",
  marginBottom: "25px",
};

const viewAllButtonStyle = {
  padding: "9px 14px",
  border: "1px solid #222222",
  borderRadius: "6px",
  backgroundColor: "#ffffff",
  cursor: "pointer",
};

const relatedGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(210px, 1fr))",
  gap: "22px",
};

const relatedCardStyle = {
  overflow: "hidden",
  border: "1px solid #eeeeee",
  borderRadius: "10px",
  backgroundColor: "#ffffff",
  cursor: "pointer",
};

const relatedImageWrapperStyle = {
  position: "relative",
  height: "280px",
  overflow: "hidden",
  backgroundColor: "#f5f5f5",
};

const relatedImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const relatedSaleBadgeStyle = {
  position: "absolute",
  top: "12px",
  left: "12px",
  padding: "5px 10px",
  borderRadius: "15px",
  backgroundColor: "#b00020",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: "700",
};

const relatedInfoStyle = {
  padding: "16px",
};

const relatedCategoryStyle = {
  margin: "0 0 6px",
  color: "#777777",
  fontSize: "13px",
};

const relatedNameStyle = {
  minHeight: "48px",
  margin: "0 0 10px",
  fontSize: "17px",
};

const relatedPriceContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  fontWeight: "700",
};

const relatedSalePriceStyle = {
  color: "#b00020",
};

const relatedOldPriceStyle = {
  color: "#888888",
  fontWeight: "400",
  textDecoration: "line-through",
};

const primaryButtonStyle = {
  padding: "12px 22px",
  border: "none",
  borderRadius: "7px",
  backgroundColor: "#111111",
  color: "#ffffff",
  cursor: "pointer",
};

export default ProductDetails;