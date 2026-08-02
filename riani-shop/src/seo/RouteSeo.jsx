import { useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

import { getAdminSeo, PAGE_SEO } from "./pageMeta";
import {
  breadcrumbSchema,
  organizationSchema,
  websiteSearchSchema,
} from "./schemas";
import { SITE_NAME } from "./site";
import { useSeo } from "./useSeo";

function RouteSeo() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const pathname = location.pathname;

  const isProductPage = pathname.startsWith("/product/");
  const isOrderDetails = /^\/orders\/[^/]+$/.test(pathname);

  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const config = useMemo(() => {
    if (isProductPage) {
      return null;
    }

    if (isOrderDetails) {
      return {
        title: `Order Details | ${SITE_NAME}`,
        description: "View your Riani Shop order details.",
        path: pathname,
        noindex: true,
        jsonLd: [],
      };
    }

    const adminSeo = getAdminSeo(pathname);
    if (adminSeo) {
      return {
        ...adminSeo,
        path: pathname,
        jsonLd: [],
      };
    }

    if (pathname === "/shop") {
      const label = category && category !== "All"
        ? category
        : search
          ? `"${search}"`
          : "All Products";

      const title =
        category && category !== "All"
          ? `${category} Fashion | ${SITE_NAME}`
          : search
            ? `Search: ${search} | ${SITE_NAME}`
            : PAGE_SEO["/shop"].title;

      const description =
        category && category !== "All"
          ? `Shop ${category.toLowerCase()} fashion at Riani Shop. Premium quality pieces with style, comfort and elegance.`
          : PAGE_SEO["/shop"].description;

      return {
        title,
        description,
        path: `${pathname}${location.search}`,
        jsonLd: [
          organizationSchema(),
          websiteSearchSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            ...(category && category !== "All"
              ? [
                  {
                    name: category,
                    path: `/shop?category=${encodeURIComponent(category)}`,
                  },
                ]
              : []),
          ]),
        ],
        crumbLabel: label,
      };
    }

    const page = PAGE_SEO[pathname];

    if (!page) {
      return {
        title: `${SITE_NAME}`,
        description: PAGE_SEO["/"].description,
        path: pathname,
        noindex: true,
        jsonLd: [],
      };
    }

    const crumbs = [{ name: "Home", path: "/" }];

    if (pathname !== "/") {
      crumbs.push({
        name: page.title.split("|")[0].trim(),
        path: pathname,
      });
    }

    return {
      ...page,
      path: pathname,
      jsonLd:
        pathname === "/"
          ? [
              organizationSchema(),
              websiteSearchSchema(),
              breadcrumbSchema([{ name: "Home", path: "/" }]),
            ]
          : page.noindex
            ? []
            : [
                organizationSchema(),
                breadcrumbSchema(crumbs),
              ],
    };
  }, [
    pathname,
    location.search,
    category,
    search,
    isProductPage,
    isOrderDetails,
  ]);

  useSeo({
    enabled: Boolean(config),
    title: config?.title,
    description: config?.description,
    path: config?.path,
    noindex: config?.noindex,
    jsonLd: config?.jsonLd || [],
  });

  return null;
}

export default RouteSeo;
