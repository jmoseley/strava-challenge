module.exports = {
  env: {
    baseUrl: process.env.BASE_URL || "http://localhost:8765"
  },
  head: {
    title: "Strava Challenge",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "Nuxt.js project" },
      { name: "msapplication-TileColor", content: "#ffffff" },
      {
        name: "msapplication-TileImage",
        content: "/favicon/ms-icon-144x144.png"
      },
      { name: "theme-color", content: "#ffffff" }
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon/favicon.ico" },
      {
        rel: "apple-touch-icon",
        type: "image/png",
        sizes: "57x57",
        href: "/favicon/apple-icon-57x57.png"
      },
      {
        rel: "apple-touch-icon",
        type: "image/png",
        sizes: "60x60",
        href: "/favicon/apple-icon-60x60.png"
      },
      {
        rel: "apple-touch-icon",
        type: "image/png",
        sizes: "72x72",
        href: "/favicon/apple-icon-72x72.png"
      },
      {
        rel: "apple-touch-icon",
        type: "image/png",
        sizes: "76x76",
        href: "/favicon/apple-icon-76x76.png"
      },
      {
        rel: "apple-touch-icon",
        type: "image/png",
        sizes: "114x114",
        href: "/favicon/apple-icon-114x114.png"
      },
      {
        rel: "apple-touch-icon",
        type: "image/png",
        sizes: "120x120",
        href: "/favicon/apple-icon-120x120.png"
      },
      {
        rel: "apple-touch-icon",
        type: "image/png",
        sizes: "144x144",
        href: "/favicon/apple-icon-144x144.png"
      },
      {
        rel: "apple-touch-icon",
        type: "image/png",
        sizes: "152x152",
        href: "/favicon/apple-icon-152x152.png"
      },
      {
        rel: "apple-touch-icon",
        type: "image/png",
        sizes: "180x180",
        href: "/favicon/apple-icon-180x180.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        href: "/favicon/android-icon-192x192.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon/favicon-32x32.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "96x96",
        href: "/favicon/favicon-96x96.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon/favicon-16x16.png"
      },
      { rel: "manifest", href: "/favicon/manifest.json" }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: "#3B8070" },
  /*
  ** Build configuration
  */
  css: ["tachyons/css/tachyons.min.css", "~assets/css/main.css"],
  build: {
    vendor: ["axios", "gsap", "vuex-class", "nuxt-class-component"]
  },
  modules: ["~/modules/typescript.ts"]
};
