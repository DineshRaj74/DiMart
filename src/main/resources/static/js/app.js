const Dimart = (() => {
  const PRODUCT_URL = "data/products.json";
  const CART_KEY = "dimart_cart";
  const WISHLIST_KEY = "dimart_wishlist";
  const THEME_KEY = "dimart_theme";
  const CATALOG_VERSION = "dimart-catalog-v4-product-display-fix";
  const CATALOG_VERSION_KEY = "dimart_catalog_version";
  const CATEGORIES = ["Fashion", "Casual Wear", "Shoes", "Beauty Care", "Accessories"];

  const fallbackProducts = Array.isArray(window.DIMART_PRODUCTS) ? window.DIMART_PRODUCTS : [];

  let productsCache = null;

  const money = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  });

  function formatPrice(value) {
    return money.format(value);
  }

  function readJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async function getProducts() {
    if (productsCache) {
      return productsCache;
    }

    const adminProducts = readJson("dimart_admin_products", null);
    const adminVersion = localStorage.getItem(CATALOG_VERSION_KEY);
    if (Array.isArray(adminProducts) && adminProducts.length > 0 && adminVersion === CATALOG_VERSION) {
      productsCache = adminProducts;
      return productsCache;
    }

    try {
      const response = await fetch(PRODUCT_URL);
      if (!response.ok) {
        throw new Error("Product feed unavailable");
      }
      productsCache = await response.json();
    } catch (error) {
      productsCache = fallbackProducts;
    }
    return productsCache;
  }

  function setProducts(products) {
    productsCache = products;
    writeJson("dimart_admin_products", products);
    localStorage.setItem(CATALOG_VERSION_KEY, CATALOG_VERSION);
  }

  function getCart() {
    return readJson(CART_KEY, []);
  }

  function setCart(cart) {
    writeJson(CART_KEY, cart);
    updateCartCount();
  }

  function getWishlist() {
    return readJson(WISHLIST_KEY, []);
  }

  function setWishlist(wishlist) {
    writeJson(WISHLIST_KEY, wishlist);
  }

  async function addToCart(productId, quantity = 1) {
    const products = await getProducts();
    const product = products.find((item) => Number(item.id) === Number(productId));
    if (!product) {
      toast("Product is not available right now.");
      return;
    }

    const cart = getCart();
    const existing = cart.find((item) => Number(item.id) === Number(product.id));
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }
    setCart(cart);
    toast(`${product.name} added to cart.`);
  }

  function toggleWishlist(productId) {
    const wishlist = getWishlist();
    const numericId = Number(productId);
    const nextWishlist = wishlist.includes(numericId)
      ? wishlist.filter((id) => id !== numericId)
      : [...wishlist, numericId];
    setWishlist(nextWishlist);
    document.querySelectorAll(`[data-action="wishlist"][data-id="${numericId}"]`).forEach((button) => {
      button.classList.toggle("is-active", nextWishlist.includes(numericId));
    });
    toast(nextWishlist.includes(numericId) ? "Saved to wishlist." : "Removed from wishlist.");
  }

  function updateCartCount() {
    const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll("[data-cart-count]").forEach((element) => {
      element.textContent = count;
    });
  }

  function productCard(product) {
    const wishlist = getWishlist();
    const isWishlisted = wishlist.includes(Number(product.id));
    return `
      <article class="product-card">
        <div class="product-media">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          <div class="product-overlay" aria-hidden="true"></div>
          <div class="product-labels">
            <span class="product-badge">${product.badge}</span>
            <span class="discount-badge">${product.discount}% off</span>
          </div>
          <button class="icon-btn wishlist-btn ${isWishlisted ? "is-active" : ""}" type="button" data-action="wishlist" data-id="${product.id}" aria-label="Save ${product.name} to wishlist">
            <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
              <path d="M12 20.3 10.7 19C5.8 14.6 3 12 3 8.8 3 6.2 5 4.2 7.6 4.2c1.5 0 2.9.7 3.8 1.8.9-1.1 2.3-1.8 3.8-1.8 2.6 0 4.6 2 4.6 4.6 0 3.2-2.8 5.8-7.7 10.2L12 20.3Z"></path>
            </svg>
          </button>
          <div class="quick-actions">
            <button class="btn quick-action-btn" type="button" data-action="add-cart" data-id="${product.id}">
              <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17">
                <path d="M7 18.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm10 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM6.2 6l.6 3h10.9l-1 5.2H8L6.1 3H3v2h1.5l2 11.2h11.9l1.5-8.2H7.2L6.8 6H6.2Z"></path>
              </svg>
              Quick add
            </button>
          </div>
        </div>
        <div class="product-body">
          <div class="product-meta mb-2">
            <span class="product-category">${product.category}</span>
            <span class="rating"><span aria-hidden="true">&#9733;</span> ${Number(product.rating).toFixed(2)}</span>
          </div>
          <h3 class="product-title">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <div class="price-row mb-3">
            <span class="price">${formatPrice(product.price)}</span>
            <span class="compare-price">${formatPrice(product.compareAtPrice)}</span>
          </div>
          <div class="product-actions">
            <button class="btn btn-cart-luxe" type="button" data-action="add-cart" data-id="${product.id}">
              <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17">
                <path d="M7 18.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm10 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM6.2 6l.6 3h10.9l-1 5.2H8L6.1 3H3v2h1.5l2 11.2h11.9l1.5-8.2H7.2L6.8 6H6.2Z"></path>
              </svg>
              Add
            </button>
            <button class="btn btn-buy-luxe" type="button" data-action="buy-now" data-id="${product.id}">
              <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17">
                <path d="M13 2 4 14h6l-1 8 10-13h-6l0-7Z"></path>
              </svg>
              Buy now
            </button>
          </div>
        </div>
      </article>
    `;
  }

  async function renderProductGrid(targetId, options = {}) {
    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    const products = await getProducts();
    const query = (options.query || "").toLowerCase();
    const category = (options.category || "").toLowerCase();
    const minPrice = Number(options.minPrice || 0);
    const maxPrice = Number(options.maxPrice || 0);

    const filtered = products
      .filter((product) => !query || product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query))
      .filter((product) => !category || product.category.toLowerCase() === category)
      .filter((product) => !minPrice || product.price >= minPrice)
      .filter((product) => !maxPrice || product.price <= maxPrice);

    const visible = options.limit ? filtered.slice(0, options.limit) : filtered;
    const columnClass = options.columnClass || "col-12 col-sm-6 col-xl-4";
    target.innerHTML = visible.map((product) => `
      <div class="${columnClass}">
        ${productCard(product)}
      </div>
    `).join("");

    const resultCount = document.querySelector("[data-result-count]");
    if (resultCount) {
      resultCount.textContent = `${filtered.length} styles`;
    }
  }

  async function renderCategoryShowcases() {
    const target = document.getElementById("categoryShowcases");
    if (!target) {
      return;
    }

    const products = await getProducts();
    target.innerHTML = CATEGORIES.map((category) => {
      const categoryProducts = products
        .filter((product) => product.category === category)
        .slice(0, 10);

      return `
        <section class="category-showcase" aria-labelledby="${category.replace(/\s+/g, "-").toLowerCase()}-title">
          <div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
            <div>
              <span class="eyebrow">${categoryProducts.length} curated styles</span>
              <h3 class="section-title mb-1" id="${category.replace(/\s+/g, "-").toLowerCase()}-title">${category}</h3>
              <p class="text-muted-dm mb-0">${categoryIntro(category)}</p>
            </div>
            <a class="btn btn-dm-outline" href="products.html?category=${encodeURIComponent(category)}">View all</a>
          </div>
          <div class="product-rail" tabindex="0" aria-label="${category} product row">
            ${categoryProducts.map((product) => `
              <div class="product-rail-item">
                ${productCard(product)}
              </div>
            `).join("")}
          </div>
        </section>
      `;
    }).join("");
  }

  function categoryIntro(category) {
    const copy = {
      Fashion: "Tailored, occasion-ready pieces with clean modern silhouettes.",
      "Casual Wear": "Soft essentials, denim, and relaxed layers for everyday movement.",
      Shoes: "Street sneakers, runners, loafers, and heels with premium styling.",
      "Beauty Care": "Clean skincare, hair care, and beauty essentials for daily routines.",
      Accessories: "Bags, watches, jewelry, frames, and finishing pieces."
    };
    return copy[category] || "Premium Dimart selections for a complete wardrobe.";
  }

  function toast(message) {
    let stack = document.querySelector(".toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "toast-stack";
      document.body.appendChild(stack);
    }

    const item = document.createElement("div");
    item.className = "dm-toast";
    item.textContent = message;
    stack.appendChild(item);
    window.setTimeout(() => item.remove(), 2600);
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      document.documentElement.dataset.theme = saved;
    }

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const isDark = document.documentElement.dataset.theme === "dark";
        const next = isDark ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        localStorage.setItem(THEME_KEY, next);
      });
    });
  }

  function initSearch() {
    document.querySelectorAll("[data-nav-search]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = form.querySelector("input");
        const query = encodeURIComponent(input.value.trim());
        window.location.href = query ? `products.html?query=${query}` : "products.html";
      });
    });
  }

  function initProductListing() {
    const listing = document.getElementById("productListing");
    if (!listing) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const searchInput = document.getElementById("filterSearch");
    const categoryInput = document.getElementById("filterCategory");
    const maxInput = document.getElementById("filterMaxPrice");

    if (params.get("query") && searchInput) {
      searchInput.value = params.get("query");
    }
    if (params.get("category") && categoryInput) {
      categoryInput.value = params.get("category");
    }

    const apply = () => renderProductGrid("productListing", {
      query: searchInput?.value || "",
      category: categoryInput?.value || "",
      maxPrice: maxInput?.value || ""
    });

    document.querySelectorAll("[data-filter-input]").forEach((input) => {
      input.addEventListener("input", apply);
      input.addEventListener("change", apply);
    });

    const clear = document.getElementById("clearFilters");
    if (clear) {
      clear.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        if (categoryInput) categoryInput.value = "";
        if (maxInput) maxInput.value = "";
        apply();
      });
    }

    apply();
  }

  function initCardActions() {
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-action]");
      if (!button) {
        return;
      }

      const id = button.dataset.id;
      if (button.dataset.action === "add-cart") {
        await addToCart(id);
      }
      if (button.dataset.action === "buy-now") {
        await addToCart(id);
        window.location.href = "cart.html";
      }
      if (button.dataset.action === "wishlist") {
        toggleWishlist(id);
      }
    });
  }

  function initBootstrapFallbackMenu() {
    document.querySelectorAll(".navbar-toggler").forEach((button) => {
      button.addEventListener("click", () => {
        const target = document.querySelector(button.getAttribute("data-bs-target"));
        if (target && typeof bootstrap === "undefined") {
          target.classList.toggle("show");
        }
      });
    });
  }

  async function init() {
    initTheme();
    initSearch();
    initCardActions();
    initBootstrapFallbackMenu();
    updateCartCount();
    await renderProductGrid("featuredProducts", {
      limit: 8,
      columnClass: "col-12 col-sm-6 col-lg-3"
    });
    await renderCategoryShowcases();
    initProductListing();
  }

  document.addEventListener("DOMContentLoaded", init);

  return {
    addToCart,
    formatPrice,
    getCart,
    getProducts,
    renderProductGrid,
    renderCategoryShowcases,
    setCart,
    setProducts,
    toast,
    updateCartCount
  };
})();
