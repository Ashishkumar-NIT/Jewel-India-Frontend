import { headers } from "next/headers";

export default async function manifest() {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  // Check if we are serving the admin app subdomain or local development mock
  const isAdmin = host.includes("app.jewelindia.shop") || host.includes("admin");

  if (isAdmin) {
    return {
      name: "Jewel India Admin",
      short_name: "JI Admin",
      description: "Retailer dashboard for managing your Jewel India store",
      start_url: "/dashboard",
      scope: "/",
      display: "standalone",
      orientation: "landscape",
      background_color: "#ffffff",
      theme_color: "#2E2833",
      categories: ["business", "productivity"],
      icons: [
        { src: "/icons/admin-icon-72x72.png", sizes: "72x72", type: "image/png" },
        { src: "/icons/admin-icon-96x96.png", sizes: "96x96", type: "image/png" },
        { src: "/icons/admin-icon-128x128.png", sizes: "128x128", type: "image/png" },
        { src: "/icons/admin-icon-144x144.png", sizes: "144x144", type: "image/png" },
        { src: "/icons/admin-icon-152x152.png", sizes: "152x152", type: "image/png" },
        { src: "/icons/admin-icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
        { src: "/icons/admin-icon-384x384.png", sizes: "384x384", type: "image/png" },
        { src: "/icons/admin-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
      ]
    };
  }

  // Storefront PWA Manifest
  return {
    name: "Jewel India",
    short_name: "Jewel India",
    description: "Discover and shop exquisite jewellery from India's finest collections",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#6B4F4F",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { src: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { src: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { src: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { src: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
      { src: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
    ]
  };
}
