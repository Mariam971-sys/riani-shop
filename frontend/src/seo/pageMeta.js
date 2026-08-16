import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_NAME } from "./site";

export const PAGE_SEO = {
  "/": {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  "/shop": {
    title: `Shop All Products | ${SITE_NAME}`,
    description:
      "Browse clothing, shoes and accessories for women, men and kids at Riani Shop.",
  },
  "/cart": {
    title: `Shopping Cart | ${SITE_NAME}`,
    description: "Review items in your Riani Shop cart and proceed to checkout.",
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
  "/contact": {
    title: `Contact | ${SITE_NAME}`,
    description: "Contact Riani Shop customer support in Sweden.",
  },
  "/faq": {
    title: `FAQ | ${SITE_NAME}`,
    description: "Answers about shipping, returns, payment and orders at Riani Shop.",
  },
  "/shipping": {
    title: `Shipping | ${SITE_NAME}`,
    description: "Delivery times and shipping information for Riani Shop orders.",
  },
  "/returns": {
    title: `Returns | ${SITE_NAME}`,
    description: "Return and withdrawal information for Riani Shop customers.",
  },
  "/privacy": {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: "How Riani Shop collects and uses personal information.",
  },
  "/terms": {
    title: `Terms of Service | ${SITE_NAME}`,
    description: "Terms for shopping at Riani Shop.",
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
