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

import {
  breadcrumbSchema,
  organizationSchema,
  productSchema,
} from "../seo/schemas";

import { SITE_NAME, SITE_URL } from "../seo/site";
import { useSeo } from "../seo/useSeo";

import womenJacket from "../assets/images/products/women-jacket.jpg";
import menJacket from "../assets/images/products/men-jacket.jpg";
import sneakers from "../assets/images/products/sneakers.jpg";
import dress from "../assets/images/products/dress.jpg";

function ProductDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { addToCart } =
    useContext(CartContext);

  const [product, setProduct] =
    useState(null);

  const [relatedProducts, setRelatedProducts] =
    useState([]);

  const [selectedImage, setSelectedImage] =
    useState("");

  const [selectedSize, setSelectedSize] =
    useState("");

  const [selectedColor, setSelectedColor] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [addingToCart, setAddingToCart] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    selectionError,
    setSelectionError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  /*
   * =========================================
   * IDENTIFY PRODUCT TYPE
   * =========================================
   */

  const isPrintfulProduct =
    id?.startsWith("printful-");

  const realProductId = isPrintfulProduct
    ? id.replace("printful-", "")
    : id;

  /*
   * =========================================
   * LOAD PRODUCT
   * =========================================
   */

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");
        setSelectionError("");
        setSuccessMessage("");
        setQuantity(1);

        let productData = null;

        /*
         * =========================================
         * PRINTFUL PRODUCT
         * =========================================
         */

        if (isPrintfulProduct) {
          const response = await axios.get(
            apiUrl(
              `/printful/products/${realProductId}`
            )
          );

          const result =
            response.data?.result || {};

          const syncProduct =
            result.sync_product || {};

          const variants =
            Array.isArray(
              result.sync_variants
            )
              ? result.sync_variants
              : [];

          const firstVariant =
            variants[0] || {};

          /*
           * Get all Printful images
           */

          const variantImages =
            variants.flatMap((variant) => {
              if (
                !Array.isArray(variant.files)
              ) {
                return [];
              }

              return variant.files
                .map(
                  (file) =>
                    file.preview_url ||
                    file.thumbnail_url ||
                    file.url ||
                    ""
                )
                .filter(Boolean);
            });

          const images = [
            syncProduct.thumbnail_url,
            ...variantImages,
          ].filter(Boolean);

          /*
           * Remove duplicate images
           */

          const uniqueImages = [
            ...new Set(images),
          ];

          /*
           * Get sizes
           */

          const sizes = [
            ...new Set(
              variants
                .map((variant) => {
                  if (variant.size) {
                    return variant.size;
                  }

                  /*
                   * Fallback:
                   * Printful variant name can contain size
                   */
                  const name =
                    variant.name || "";

                  const sizeMatch =
                    name.match(
                      /\b(XS|S|M|L|XL|2XL|3XL|4XL|5XL)\b/i
                    );

                  return sizeMatch
                    ? sizeMatch[1]
                    : "";
                })
                .filter(Boolean)
            ),
          ];

          /*
           * Get colors
           */

          const colors = [
            ...new Set(
              variants
                .map(
                  (variant) =>
                    variant.color || ""
                )
                .filter(Boolean)
            ),
          ];

          productData = {
            id: `printful-${realProductId}`,

            _id: `printful-${realProductId}`,

            printfulId:
              Number(realProductId),

            source: "printful",

            name:
              syncProduct.name ||
              "Rianova Product",

            category: "Women",

            brand: "Rianova",

            description:
              "Premium Rianova print-on-demand product, made and fulfilled by Printful.",

            image:
              uniqueImages[0] ||
              syncProduct.thumbnail_url ||
              "",

            images: uniqueImages,

            price: Number(
              firstVariant.retail_price ||
                299
            ),

            salePrice: null,

            isOnSale: false,

            isFeatured: true,

            /*
             * POD product:
             * we do not treat it like local warehouse stock.
             */
            countInStock: 999,

            sizes,

            colors,

            material: "",

            rating: 5,

            numReviews: 0,

            printfulVariants: variants,
          };
        }

        /*
         * =========================================
         * NORMAL MONGODB PRODUCT
         * =========================================
         */

        else {
          const response = await axios.get(
            apiUrl(
              `/products/${realProductId}`
            )
          );

          productData =
            response.data;
        }

        setProduct(productData);

        /*
         * =========================================
         * SET PRODUCT IMAGE
         * =========================================
         */

        const productImages =
          getProductImages(productData);

        setSelectedImage(
          productImages[0] || ""
        );

        /*
         * =========================================
         * SET SIZE
         * =========================================
         */

        const sizes =
          Array.isArray(
            productData?.sizes
          )
            ? productData.sizes
            : [];

        setSelectedSize(
          sizes.length === 1
            ? sizes[0]
            : ""
        );

        /*
         * =========================================
         * SET COLOR
         * =========================================
         */

        const colors =
          Array.isArray(
            productData?.colors
          )
            ? productData.colors
            : [];

        setSelectedColor(
          colors.length === 1
            ? colors[0]
            : ""
        );

        /*
         * =========================================
         * RELATED PRODUCTS
         * =========================================
         */

        try {
          const allProductsResponse =
            await axios.get(
              apiUrl("/products")
            );

          const normalProducts =
            Array.isArray(
              allProductsResponse.data
            )
              ? allProductsResponse.data
              : Array.isArray(
                    allProductsResponse
                      .data?.products
                  )
                ? allProductsResponse.data
                    .products
                : [];

          const related =
            normalProducts.filter(
              (item) =>
                String(
                  item.category || ""
                ).toLowerCase() ===
                  String(
                    productData.category ||
                      ""
                  ).toLowerCase() &&
                String(
                  item._id || item.id
                ) !==
                  String(
                    productData._id ||
                      productData.id
                  )
            );

          setRelatedProducts(
            related.slice(0, 4)
          );
        } catch (relatedError) {
          console.error(
            "Related products error:",
            relatedError
          );

          setRelatedProducts([]);
        }
      } catch (fetchError) {
        console.error(
          "Fetch product error:",
          fetchError
        );

        setProduct(null);

        setError(
          fetchError.response?.data
            ?.message ||
            "Product-ka lama helin."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [
    id,
    isPrintfulProduct,
    realProductId,
  ]);

  /*
   * =========================================
   * FALLBACK IMAGES
   * =========================================
   */

  function getFallbackImage(
    productItem
  ) {
    const localImages = {
      "Women's Jacket":
        womenJacket,

      "Women Jacket":
        womenJacket,

      "Men Jacket":
        menJacket,

      "Men's Jacket":
        menJacket,

      "White Sneakers":
        sneakers,

      Sneakers:
        sneakers,

      "Elegant Dress":
        dress,

      Dress:
        dress,
    };

    return (
      localImages[
        productItem?.name
      ] || ""
    );
  }

  /*
   * =========================================
   * NORMALIZE IMAGE URL
   * =========================================
   */

  function normalizeImageUrl(image) {
    if (!image) {
      return "";
    }

    if (
      image.startsWith(
        "http://"
      ) ||
      image.startsWith(
        "https://"
      ) ||
      image.startsWith("data:")
    ) {
      return image;
    }

    if (
      image.startsWith(
        "/uploads"
      )
    ) {
      return mediaUrl(image);
    }

    return image;
  }

  /*
   * =========================================
   * PRODUCT IMAGES
   * =========================================
   */

  function getProductImages(
    productItem
  ) {
    if (!productItem) {
      return [];
    }

    const images =
      Array.isArray(
        productItem.images
      )
        ? productItem.images
            .map((image) =>
              normalizeImageUrl(
                typeof image ===
                  "string"
                  ? image
                  : image?.url ||
                      image
                        ?.preview_url ||
                      image
                        ?.thumbnail_url ||
                      ""
              )
            )
            .filter(Boolean)
        : [];

    if (images.length > 0) {
      return [
        ...new Set(images),
      ];
    }

    if (productItem.image) {
      return [
        normalizeImageUrl(
          productItem.image
        ),
      ].filter(Boolean);
    }

    const fallbackImage =
      getFallbackImage(
        productItem
      );

    return fallbackImage
      ? [fallbackImage]
      : [];
  }

  const productImages =
    useMemo(
      () =>
        getProductImages(
          product
        ),
      [product]
    );

  /*
   * =========================================
   * SEO
   * =========================================
   */

  const productPath =
    `/product/${id}`;

  const productUrl =
    `${SITE_URL}${productPath}`;

  const seoPrice = useMemo(
    () => {
      if (!product) {
        return 0;
      }

      const regular =
        Number(
          product.price || 0
        );

      const sale =
        product.salePrice !==
          null &&
        product.salePrice !==
          undefined &&
        product.salePrice !== ""
          ? Number(
              product.salePrice
            )
          : null;

      if (
        product.isOnSale &&
        sale !== null &&
        !Number.isNaN(sale) &&
        sale > 0 &&
        sale < regular
      ) {
        return sale;
      }

      return regular;
    },
    [product]
  );

  const productJsonLd =
    useMemo(() => {
      if (!product) {
        return [];
      }

      return [
        organizationSchema(),

        breadcrumbSchema([
          {
            name: "Home",
            path: "/",
          },

          {
            name: "Shop",
            path: "/shop",
          },

          ...(product.category
            ? [
                {
                  name:
                    product.category,

                  path: `/shop?category=${encodeURIComponent(
                    product.category
                  )}`,
                },
              ]
            : []),

          {
            name: product.name,
            path: productPath,
          },
        ]),

        productSchema(
          product,
          {
            url: productUrl,
            images:
              productImages,

            price:
              seoPrice,

            originalPrice:
              Number(
                product.price ||
                  0
              ),
          }
        ),
      ];
    }, [
      product,
      productImages,
      productPath,
      productUrl,
      seoPrice,
    ]);

  useSeo({
    enabled: !loading,

    title: product
      ? `${product.name} | ${SITE_NAME}`
      : `Product Not Found | ${SITE_NAME}`,

    description: product
      ? (
          product.description ||
          `Buy ${product.name} from ${SITE_NAME}.`
        ).slice(0, 160)
      : "The requested product could not be found.",

    path: productPath,

    image:
      productImages[0],

    type: product
      ? "product"
      : "website",

    noindex: !product,

    jsonLd: product
      ? productJsonLd
      : [],
  });

  /*
   * =========================================
   * LOADING
   * =========================================
   */

  if (loading) {
    return (
      <main
        style={
          statusPageStyle
        }
      >
        <h2>
          Loading product...
        </h2>
      </main>
    );
  }

  /*
   * =========================================
   * ERROR
   * =========================================
   */

  if (
    error ||
    !product
  ) {
    return (
      <main
        style={
          statusPageStyle
        }
      >
        <h1>
          Product not found
        </h1>

        <p
          style={{
            color:
              "#666666",
          }}
        >
          {error}
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/shop")
          }
          style={
            primaryButtonStyle
          }
        >
          Back to Shop
        </button>
      </main>
    );
  }

  /*
   * =========================================
   * PRICE
   * =========================================
   */

  const price =
    Number(
      product.price || 0
    );

  const salePrice =
    product.salePrice !==
      null &&
    product.salePrice !==
      undefined &&
    product.salePrice !== ""
      ? Number(
          product.salePrice
        )
      : null;

  const isValidSale =
    product.isOnSale &&
    salePrice !== null &&
    !Number.isNaN(
      salePrice
    ) &&
    salePrice >= 0 &&
    salePrice < price;

  const currentPrice =
    isValidSale
      ? salePrice
      : price;

  /*
   * =========================================
   * CURRENCY
   * =========================================
   */

  function formatPrice(
    amount
  ) {
    const value =
      Number(amount || 0);

    if (
      product.source ===
      "printful"
    ) {
      return `${value.toFixed(
        0
      )} kr`;
    }

    return `$${value.toFixed(
      2
    )}`;
  }

  /*
   * =========================================
   * STOCK
   * =========================================
   */

  const stock =
    Number(
      product.countInStock ??
        0
    );

  /*
   * =========================================
   * OPTIONS
   * =========================================
   */

  const availableSizes =
    Array.isArray(
      product.sizes
    )
      ? product.sizes
      : [];

  const availableColors =
    Array.isArray(
      product.colors
    )
      ? product.colors
      : [];

  /*
   * =========================================
   * QUANTITY
   * =========================================
   */

  function increaseQuantity() {
    setSuccessMessage("");

    if (
      quantity < stock
    ) {
      setQuantity(
        (current) =>
          current + 1
      );
    }
  }

  function decreaseQuantity() {
    setSuccessMessage("");

    if (
      quantity > 1
    ) {
      setQuantity(
        (current) =>
          current - 1
      );
    }
  }

  /*
   * =========================================
   * SIZE
   * =========================================
   */

  function handleSizeSelect(
    size
  ) {
    setSelectedSize(size);

    setSelectionError("");

    setSuccessMessage("");
  }

  /*
   * =========================================
   * COLOR
   * =========================================
   */

  function handleColorSelect(
    color
  ) {
    setSelectedColor(color);

    setSelectionError("");

    setSuccessMessage("");
  }

  /*
   * =========================================
   * FIND PRINTFUL VARIANT
   * =========================================
   */

  function getSelectedPrintfulVariant() {
    if (
      product.source !==
      "printful"
    ) {
      return null;
    }

    const variants =
      Array.isArray(
        product.printfulVariants
      )
        ? product.printfulVariants
        : [];

    return (
      variants.find(
        (variant) => {
          const sizeMatches =
            !selectedSize ||
            variant.size ===
              selectedSize ||
            String(
              variant.name ||
                ""
            ).includes(
              selectedSize
            );

          const colorMatches =
            !selectedColor ||
            variant.color ===
              selectedColor;

          return (
            sizeMatches &&
            colorMatches
          );
        }
      ) ||
      variants[0] ||
      null
    );
  }

  /*
   * =========================================
   * ADD TO CART
   * =========================================
   */

  function handleAddToCart() {
    setSelectionError("");

    setSuccessMessage("");

    if (
      stock <= 0
    ) {
      setSelectionError(
        "Product-kan hadda stock kuma jiro."
      );

      return;
    }

    if (
      availableSizes.length >
        0 &&
      !selectedSize
    ) {
      setSelectionError(
        "Fadlan dooro size-ka aad rabto."
      );

      return;
    }

    if (
      availableColors.length >
        0 &&
      !selectedColor
    ) {
      setSelectionError(
        "Fadlan dooro color-ka aad rabto."
      );

      return;
    }

    try {
      setAddingToCart(true);

      const printfulVariant =
        getSelectedPrintfulVariant();

      addToCart({
        id:
          product._id ||
          product.id,

        _id:
          product._id ||
          product.id,

        productId:
          product._id ||
          product.id,

        source:
          product.source ||
          "normal",

        printfulId:
          product.printfulId ||
          null,

        printfulVariantId:
          printfulVariant?.id ||
          null,

        name:
          product.name,

        category:
          product.category,

        brand:
          product.brand,

        image:
          selectedImage ||
          productImages[0] ||
          "",

        images:
          productImages,

        price:
          currentPrice,

        originalPrice:
          price,

        isOnSale:
          isValidSale,

        salePrice:
          isValidSale
            ? salePrice
            : null,

        size:
          selectedSize ||
          null,

        selectedSize:
          selectedSize ||
          null,

        color:
          selectedColor ||
          null,

        selectedColor:
          selectedColor ||
          null,

        quantity,

        countInStock:
          stock,
      });

      setSuccessMessage(
        `${product.name} waxaa lagu daray cart-ka.`
      );
    } catch (cartError) {
      console.error(
        "Add to cart error:",
        cartError
      );

      setSelectionError(
        "Product-ka cart-ka laguma darin."
      );
    } finally {
      setAddingToCart(false);
    }
  }

  /*
   * =========================================
   * UI
   * =========================================
   */

  return (
    <main style={pageStyle}>
      <button
        type="button"
        onClick={() =>
          navigate(-1)
        }
        style={
          backButtonStyle
        }
      >
        ← Back
      </button>

      <section
        style={
          productSectionStyle
        }
      >
        {/* IMAGE AREA */}

        <div style={galleryStyle}>
          <div
            style={
              mainImageWrapperStyle
            }
          >
            {selectedImage ? (
              <img
                src={
                  selectedImage
                }
                alt={
                  product.name
                }
                style={
                  mainImageStyle
                }
                onError={(
                  event
                ) => {
                  event.currentTarget.src =
                    getFallbackImage(
                      product
                    );
                }}
              />
            ) : (
              <div
                style={
                  noImageStyle
                }
              >
                No image available
              </div>
            )}

            {isValidSale && (
              <span
                style={
                  saleBadgeStyle
                }
              >
                Sale
              </span>
            )}

            {product.isFeatured && (
              <span
                style={
                  featuredBadgeStyle
                }
              >
                Featured
              </span>
            )}
          </div>

          {productImages.length >
            1 && (
            <div
              style={
                thumbnailContainerStyle
              }
            >
              {productImages.map(
                (
                  image,
                  index
                ) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() =>
                      setSelectedImage(
                        image
                      )
                    }
                    style={{
                      ...thumbnailButtonStyle,

                      border:
                        selectedImage ===
                        image
                          ? "2px solid #111"
                          : "1px solid #ddd",
                    }}
                  >
                    <img
                      src={
                        image
                      }
                      alt={`${product.name} ${
                        index +
                        1
                      }`}
                      style={
                        thumbnailImageStyle
                      }
                    />
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* PRODUCT INFO */}

        <div
          style={
            productInfoStyle
          }
        >
          <p
            style={
              categoryStyle
            }
          >
            {product.category ||
              "Product"}
          </p>

          <h1
            style={
              productTitleStyle
            }
          >
            {product.name}
          </h1>

          {product.brand && (
            <p
              style={
                brandStyle
              }
            >
              Brand:{" "}
              <strong>
                {
                  product.brand
                }
              </strong>
            </p>
          )}

          <div
            style={
              ratingStyle
            }
          >
            <span>
              {"★".repeat(
                Math.round(
                  Number(
                    product.rating ||
                      0
                  )
                )
              )}

              {"☆".repeat(
                Math.max(
                  0,
                  5 -
                    Math.round(
                      Number(
                        product.rating ||
                          0
                      )
                    )
                )
              )}
            </span>

            <span
              style={
                reviewCountStyle
              }
            >
              {Number(
                product.numReviews ||
                  0
              )}{" "}
              reviews
            </span>
          </div>

          {/* PRICE */}

          <div
            style={
              priceContainerStyle
            }
          >
            {isValidSale ? (
              <>
                <span
                  style={
                    salePriceStyle
                  }
                >
                  {formatPrice(
                    salePrice
                  )}
                </span>

                <span
                  style={
                    oldPriceStyle
                  }
                >
                  {formatPrice(
                    price
                  )}
                </span>
              </>
            ) : (
              <span
                style={
                  normalPriceStyle
                }
              >
                {formatPrice(
                  price
                )}
              </span>
            )}
          </div>

          <p
            style={
              descriptionStyle
            }
          >
            {product.description ||
              "High quality product from Riani Shop."}
          </p>

          {/* AVAILABILITY */}

          <div
            style={
              productDetailsBoxStyle
            }
          >
            {product.material && (
              <p
                style={
                  detailRowStyle
                }
              >
                <strong>
                  Material:
                </strong>

                <span>
                  {
                    product.material
                  }
                </span>
              </p>
            )}

            <p
              style={
                detailRowStyle
              }
            >
              <strong>
                Availability:
              </strong>

              <span
                style={{
                  color:
                    stock > 0
                      ? "#167329"
                      : "#b00020",

                  fontWeight:
                    "700",
                }}
              >
                {product.source ===
                "printful"
                  ? "Available"
                  : stock > 0
                    ? `${stock} in stock`
                    : "Out of stock"}
              </span>
            </p>
          </div>

          {/* COLORS */}

          {availableColors.length >
            0 && (
            <div
              style={
                optionSectionStyle
              }
            >
              <h3
                style={
                  optionTitleStyle
                }
              >
                Color
              </h3>

              <div
                style={
                  optionListStyle
                }
              >
                {availableColors.map(
                  (color) => (
                    <button
                      key={
                        color
                      }
                      type="button"
                      onClick={() =>
                        handleColorSelect(
                          color
                        )
                      }
                      style={{
                        ...choiceButtonStyle,

                        backgroundColor:
                          selectedColor ===
                          color
                            ? "#111"
                            : "#fff",

                        color:
                          selectedColor ===
                          color
                            ? "#fff"
                            : "#111",
                      }}
                    >
                      {color}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* SIZES */}

          {availableSizes.length >
            0 && (
            <div
              style={
                optionSectionStyle
              }
            >
              <h3
                style={
                  optionTitleStyle
                }
              >
                Size
              </h3>

              <div
                style={
                  optionListStyle
                }
              >
                {availableSizes.map(
                  (size) => (
                    <button
                      key={
                        size
                      }
                      type="button"
                      onClick={() =>
                        handleSizeSelect(
                          size
                        )
                      }
                      style={{
                        ...sizeButtonStyle,

                        backgroundColor:
                          selectedSize ===
                          size
                            ? "#111"
                            : "#fff",

                        color:
                          selectedSize ===
                          size
                            ? "#fff"
                            : "#111",
                      }}
                    >
                      {size}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* QUANTITY */}

          <div
            style={
              quantitySectionStyle
            }
          >
            <h3
              style={
                optionTitleStyle
              }
            >
              Quantity
            </h3>

            <div
              style={
                quantityControlStyle
              }
            >
              <button
                type="button"
                onClick={
                  decreaseQuantity
                }
                disabled={
                  quantity <= 1
                }
                style={
                  quantityButtonStyle
                }
              >
                −
              </button>

              <span
                style={
                  quantityValueStyle
                }
              >
                {quantity}
              </span>

              <button
                type="button"
                onClick={
                  increaseQuantity
                }
                disabled={
                  stock <= 0 ||
                  quantity >= stock
                }
                style={
                  quantityButtonStyle
                }
              >
                +
              </button>
            </div>
          </div>

          {selectionError && (
            <p
              style={
                errorMessageStyle
              }
            >
              {selectionError}
            </p>
          )}

          {successMessage && (
            <p
              style={
                successMessageStyle
              }
            >
              {successMessage}
            </p>
          )}

          <button
            type="button"
            onClick={
              handleAddToCart
            }
            disabled={
              stock <= 0 ||
              addingToCart
            }
            style={{
              ...addToCartButtonStyle,

              opacity:
                stock <= 0 ||
                addingToCart
                  ? 0.6
                  : 1,
            }}
          >
            {addingToCart
              ? "Adding..."
              : "Add To Cart"}
          </button>

          <div
            style={
              shippingInfoStyle
            }
          >
            <p>
              ✓ Secure checkout
            </p>

            <p>
              ✓ Easy returns
            </p>

            <p>
              ✓ Fast delivery
            </p>
          </div>
        </div>
      </section>

      {/* PRODUCT INFORMATION */}

      <section
        style={
          descriptionSectionStyle
        }
      >
        <h2
          style={
            sectionHeadingStyle
          }
        >
          Product Information
        </h2>

        <div
          style={
            informationGridStyle
          }
        >
          <div>
            <h3>
              Description
            </h3>

            <p
              style={
                informationTextStyle
              }
            >
              {product.description ||
                "High quality product from Riani Shop."}
            </p>
          </div>

          <div>
            <h3>
              Details
            </h3>

            <p>
              <strong>
                Category:
              </strong>{" "}
              {product.category ||
                "-"}
            </p>

            <p>
              <strong>
                Brand:
              </strong>{" "}
              {product.brand ||
                "Riani"}
            </p>

            <p>
              <strong>
                Fulfilled by:
              </strong>{" "}
              {product.source ===
              "printful"
                ? "Printful"
                : "Riani Shop"}
            </p>
          </div>
        </div>
      </section>

      {/* RELATED PRODUCTS */}

      <section
        style={
          relatedSectionStyle
        }
      >
        <h2
          style={
            sectionHeadingStyle
          }
        >
          Related Products
        </h2>

        {relatedProducts.length ===
        0 ? (
          <p
            style={{
              color:
                "#666666",
            }}
          >
            No related products found.
          </p>
        ) : (
          <div
            style={
              relatedGridStyle
            }
          >
            {relatedProducts.map(
              (item) => {
                const itemImages =
                  getProductImages(
                    item
                  );

                return (
                  <article
                    key={
                      item._id ||
                      item.id
                    }
                    onClick={() =>
                      navigate(
                        `/product/${
                          item._id ||
                          item.id
                        }`
                      )
                    }
                    style={
                      relatedCardStyle
                    }
                  >
                    <div
                      style={
                        relatedImageWrapperStyle
                      }
                    >
                      {itemImages[0] ? (
                        <img
                          src={
                            itemImages[0]
                          }
                          alt={
                            item.name
                          }
                          style={
                            relatedImageStyle
                          }
                        />
                      ) : (
                        <div
                          style={
                            noImageStyle
                          }
                        >
                          No image
                        </div>
                      )}
                    </div>

                    <div
                      style={
                        relatedInfoStyle
                      }
                    >
                      <p>
                        {
                          item.category
                        }
                      </p>

                      <h3>
                        {
                          item.name
                        }
                      </h3>

                      <strong>
                        $
                        {Number(
                          item.price ||
                            0
                        ).toFixed(
                          2
                        )}
                      </strong>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>
    </main>
  );
}

/*
 * =========================================
 * STYLES
 * =========================================
 */

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
  textAlign: "center",
};

const backButtonStyle = {
  marginBottom: "25px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
};

const productSectionStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "60px",
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
  minHeight: "220px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const saleBadgeStyle = {
  position: "absolute",
  top: "18px",
  left: "18px",
  padding: "7px 13px",
  backgroundColor: "#b00020",
  color: "#fff",
};

const featuredBadgeStyle = {
  position: "absolute",
  top: "18px",
  right: "18px",
  padding: "7px 13px",
  backgroundColor: "#111",
  color: "#fff",
};

const thumbnailContainerStyle = {
  display: "flex",
  gap: "12px",
  marginTop: "15px",
  overflowX: "auto",
};

const thumbnailButtonStyle = {
  width: "85px",
  minWidth: "85px",
  height: "100px",
  padding: "3px",
  background: "#fff",
};

const thumbnailImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const productInfoStyle = {
  minWidth: 0,
};

const categoryStyle = {
  color: "#777",
  textTransform: "uppercase",
};

const productTitleStyle = {
  fontSize: "clamp(30px, 5vw, 48px)",
};

const brandStyle = {
  color: "#555",
};

const ratingStyle = {
  display: "flex",
  gap: "10px",
  color: "#d49b00",
};

const reviewCountStyle = {
  color: "#777",
};

const priceContainerStyle = {
  display: "flex",
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
  color: "#888",
  textDecoration: "line-through",
};

const descriptionStyle = {
  lineHeight: 1.7,
  color: "#555",
};

const productDetailsBoxStyle = {
  marginTop: "24px",
  padding: "18px",
  backgroundColor: "#f7f7f7",
};

const detailRowStyle = {
  display: "flex",
  justifyContent: "space-between",
};

const optionSectionStyle = {
  marginTop: "28px",
};

const optionTitleStyle = {
  fontSize: "16px",
};

const optionListStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
};

const choiceButtonStyle = {
  padding: "10px 16px",
  border: "1px solid #ccc",
  cursor: "pointer",
};

const sizeButtonStyle = {
  minWidth: "48px",
  padding: "10px 13px",
  border: "1px solid #ccc",
  cursor: "pointer",
};

const quantitySectionStyle = {
  marginTop: "28px",
};

const quantityControlStyle = {
  display: "flex",
  width: "fit-content",
  border: "1px solid #ccc",
};

const quantityButtonStyle = {
  width: "44px",
  height: "44px",
};

const quantityValueStyle = {
  minWidth: "50px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const errorMessageStyle = {
  padding: "12px",
  backgroundColor: "#ffe5e5",
  color: "#b00020",
};

const successMessageStyle = {
  padding: "12px",
  backgroundColor: "#e5f8e8",
  color: "#167329",
};

const addToCartButtonStyle = {
  width: "100%",
  marginTop: "24px",
  padding: "16px",
  border: "none",
  backgroundColor: "#111",
  color: "#fff",
  cursor: "pointer",
};

const shippingInfoStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "20px",
};

const descriptionSectionStyle = {
  marginTop: "80px",
  paddingTop: "40px",
  borderTop: "1px solid #ddd",
};

const sectionHeadingStyle = {
  fontSize: "28px",
};

const informationGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "45px",
};

const informationTextStyle = {
  lineHeight: 1.7,
};

const relatedSectionStyle = {
  marginTop: "80px",
};

const relatedGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(210px, 1fr))",
  gap: "22px",
};

const relatedCardStyle = {
  border: "1px solid #eee",
  cursor: "pointer",
};

const relatedImageWrapperStyle = {
  height: "280px",
  overflow: "hidden",
};

const relatedImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const relatedInfoStyle = {
  padding: "16px",
};

const primaryButtonStyle = {
  padding: "12px 22px",
  border: "none",
  borderRadius: "7px",
  backgroundColor: "#111",
  color: "#fff",
  cursor: "pointer",
};

export default ProductDetails;