import { DEFAULT_DESCRIPTION, SITE_NAME } from "./site";

export const PAGE_SEO = {
  "/": {
    title: `${SITE_NAME} | Premium Fashion Clothing, Shoes & Accessories`,
    description: DEFAULT_DESCRIPTION,
  },
  "/shop": {
    title: `Shop All Products | ${SITE_NAME}`,
    description:
      "Browse premium clothing, shoes and accessories at Riani Shop. Filter by category and find your perfect style.",
  },
  "/cart": {
    title: `Shopping Cart | ${SITE_NAME}`,
    description: "Review items in your Riani Shop cart and proceed to secure checkout.",
    noindex: true,
  },
  "/wishlist": {
    title: `Wishlist | ${SITE_NAME}`,
    description: "Save your favorite Riani Shop fashion pieces to your wishlist.",
    noindex: true,
  },
  "/checkout": {
    title: `Checkout | ${SITE_NAME}`,
    description: "Complete your Riani Shop order with secure checkout.",
    noindex: true,
  },
  "/order-success": {
    title: `Order Confirmed | ${SITE_NAME}`,
    description: "Your Riani Shop order was placed successfully.",
    noindex: true,
  },
  "/orders": {
    title: `My Orders | ${SITE_NAME}`,
    description: "Track and manage your Riani Shop orders.",
    noindex: true,
  },
  "/login": {
    title: `Login | ${SITE_NAME}`,
    description: "Sign in to your Riani Shop account.",
    noindex: true,
  },
  "/register": {
    title: `Create Account | ${SITE_NAME}`,
    description: "Create a Riani Shop account to shop faster and track orders.",
    noindex: true,
  },
  "/profile": {
    title: `My Profile | ${SITE_NAME}`,
    description: "Manage your Riani Shop profile and account details.",
    noindex: true,
  },
};

export function getAdminSeo(pathname) {
  if (!pathname.startsWith("/admin")) {
    return null;
  }

  return {
    title: `Admin | ${SITE_NAME}`,
    description: "Riani Shop admin dashboard.",
    noindex: true,
  };
}
