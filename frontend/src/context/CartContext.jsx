import {
  createContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const CartContext = createContext(null);

function getSavedCart() {
  try {
    const savedCart = localStorage.getItem("cart");

    if (!savedCart) {
      return [];
    }

    const parsedCart = JSON.parse(savedCart);

    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch (error) {
    console.error("Failed to read cart from localStorage:", error);

    localStorage.removeItem("cart");

    return [];
  }
}

function normalizeValue(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  return String(value);
}

function getProductId(product) {
  return String(
    product?.productId ||
      product?._id ||
      product?.id ||
      ""
  );
}

function isSameCartItem(item, productId, size, color) {
  return (
    getProductId(item) === String(productId) &&
    normalizeValue(
      item.selectedSize ?? item.size
    ) === normalizeValue(size) &&
    normalizeValue(
      item.selectedColor ?? item.color
    ) === normalizeValue(color)
  );
}

function CartProvider({ children }) {
  const [cart, setCart] = useState(getSavedCart);

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.error(
        "Failed to save cart to localStorage:",
        error
      );
    }
  }, [cart]);

  function addToCart(product) {
    if (!product) {
      return;
    }

    const productId = getProductId(product);

    if (!productId) {
      console.error("Product ID is missing.");
      return;
    }

    const selectedSize = normalizeValue(
      product.selectedSize ?? product.size
    );

    const selectedColor = normalizeValue(
      product.selectedColor ?? product.color
    );

    const requestedQuantity = Math.max(
      1,
      Number(product.quantity) || 1
    );

    const stock = Math.max(
      0,
      Number(product.countInStock ?? 9999)
    );

    if (stock <= 0) {
      return;
    }

    setCart((currentCart) => {
      const existingIndex = currentCart.findIndex(
        (item) =>
          isSameCartItem(
            item,
            productId,
            selectedSize,
            selectedColor
          )
      );

      if (existingIndex !== -1) {
        return currentCart.map((item, index) => {
          if (index !== existingIndex) {
            return item;
          }

          const itemStock = Math.max(
            0,
            Number(
              product.countInStock ??
                item.countInStock ??
                9999
            )
          );

          const currentQuantity = Math.max(
            1,
            Number(item.quantity) || 1
          );

          return {
            ...item,
            countInStock: itemStock,
            quantity: Math.min(
              currentQuantity + requestedQuantity,
              itemStock
            ),
          };
        });
      }

      return [
        ...currentCart,
        {
          ...product,

          id: productId,
          _id: productId,
          productId,

          size: selectedSize,
          selectedSize,

          color: selectedColor,
          selectedColor,

          price: Number(product.price) || 0,
          countInStock: stock,
          quantity: Math.min(requestedQuantity, stock),
        },
      ];
    });
  }

  function removeFromCart(id, size, color) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          !isSameCartItem(item, id, size, color)
      )
    );
  }

  function increaseQuantity(id, size, color) {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (!isSameCartItem(item, id, size, color)) {
          return item;
        }

        const stock = Math.max(
          0,
          Number(item.countInStock ?? 9999)
        );

        const currentQuantity = Math.max(
          1,
          Number(item.quantity) || 1
        );

        return {
          ...item,
          quantity: Math.min(
            currentQuantity + 1,
            stock
          ),
        };
      })
    );
  }

  function decreaseQuantity(id, size, color) {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (
            !isSameCartItem(item, id, size, color)
          ) {
            return item;
          }

          return {
            ...item,
            quantity:
              (Number(item.quantity) || 1) - 1,
          };
        })
        .filter(
          (item) => Number(item.quantity) > 0
        )
    );
  }

  function updateQuantity(
    id,
    size,
    color,
    newQuantity
  ) {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (
            !isSameCartItem(item, id, size, color)
          ) {
            return item;
          }

          const stock = Math.max(
            0,
            Number(item.countInStock ?? 9999)
          );

          const quantity = Math.min(
            Math.max(0, Number(newQuantity) || 0),
            stock
          );

          return {
            ...item,
            quantity,
          };
        })
        .filter(
          (item) => Number(item.quantity) > 0
        )
    );
  }

  function clearCart() {
    setCart([]);
  }

  const totalItems = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + (Number(item.quantity) || 0),
        0
      ),
    [cart]
  );

  const totalPrice = useMemo(
    () =>
      cart.reduce((total, item) => {
        const price = Number(item.price) || 0;
        const quantity =
          Number(item.quantity) || 0;

        return total + price * quantity;
      }, 0),
    [cart]
  );

  const cartValue = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      setCart,
    }),
    [cart, totalItems, totalPrice]
  );

  return (
    <CartContext.Provider value={cartValue}>
      {children}
    </CartContext.Provider>
  );
}

export default CartProvider;