let products = [];
let cart = [];
let currentCategory = "all";

async function loadProducts() {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    products = await response.json();
    renderFeaturedProducts();
    renderProducts();
    updateCartUI();
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

function renderFeaturedProducts() {
  const container = document.getElementById("featuredProducts");
  const featured = products.slice(0, 2);
  container.innerHTML = featured.map((product, index) => `
    <div class="featured-product">
      <div class="product-badge ${index === 1 ? "dark" : ""}">
        ${index === 0 ? "Our Pick" : "Your Choice"}
      </div>
      <button class="wishlist-btn" onclick="toggleWishlist(${product.id})">
        <i class="far fa-heart"></i>
      </button>
      <img src="${product.image}" alt="${product.title}" class="product-image">
      <div class="product-info">
        <h4>${product.title.substring(0, 30)}...</h4>
        <button class="product-price ${index === 1 ? "dark" : ""}" onclick="addToCart(${product.id})">
          $${product.price}
        </button>
      </div>
    </div>
  `).join("");
}

function renderProducts() {
  const container = document.getElementById("productsGrid");
  const filteredProducts = currentCategory === "all"
    ? products
    : products.filter((p) => p.category === currentCategory);

  if (filteredProducts.length === 0) {
    container.innerHTML = '<div class="loading"><p>No products found</p></div>';
    return;
  }

  container.innerHTML = filteredProducts.map((product) => `
    <div class="product-card">
      <button class="wishlist-btn" onclick="toggleWishlist(${product.id})">
        <i class="far fa-heart"></i>
      </button>
      <img src="${product.image}" alt="${product.title}" class="product-image">
      <div class="product-info">
        <h4>${product.title.substring(0, 40)}...</h4>
        <p style="color: #64748b; font-size: 0.875rem; margin: 0.5rem 0;">$${product.price}</p>
        <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
      </div>
    </div>
  `).join("");
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  const existingItem = cart.find((item) => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCartUI();
  showNotification("Added to cart!");
  renderCheckout();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCartUI();
  renderCheckout();
}

function updateQuantity(productId, change) {
  const item = cart.find((item) => item.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartUI();
      renderCheckout();
    }
  }
}

function toggleWishlist(productId) {
  const btn = document.querySelector(`[onclick="toggleWishlist(${productId})"] i`);
  if (btn.classList.contains("far")) {
    btn.className = "fas fa-heart";
    btn.style.color = "#ef4444";
  } else {
    btn.className = "far fa-heart";
    btn.style.color = "";
  }
}

function updateCartUI() {
  const badge = document.getElementById("cartBadge");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = totalItems;
  badge.style.display = totalItems > 0 ? "flex" : "none";
}

function showCheckout() {
  const overlay = document.getElementById("checkoutOverlay");
  overlay.style.display = "flex";
  renderCheckout();
}

function renderCheckout() {
  const content = document.getElementById("checkoutContent");
  const footer = document.getElementById("checkoutFooter");
  const totalAmount = document.getElementById("totalAmount");

  if (cart.length === 0) {
    content.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart" style="font-size: 3rem; color: #e2e8f0; margin-bottom: 1rem;"></i>
        <p>Your cart is empty</p>
      </div>`;
    footer.style.display = "none";
    return;
  }

  content.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.title}">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.title.substring(0, 30)}...</div>
        <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        <div class="quantity-controls">
          <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
          <span style="padding: 0 0.5rem;">${item.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
          <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
      </div>
    </div>
  `).join("");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  totalAmount.textContent = `Total: $${total.toFixed(2)}`;
  footer.style.display = "block";
}

function showNotification(message) {
  const notif = document.createElement("div");
  notif.textContent = message;
  notif.style.cssText = "position:fixed;bottom:20px;right:20px;background:#3b82f6;color:white;padding:0.75rem 1rem;border-radius:8px;font-weight:600;z-index:2000;box-shadow:0 4px 12px rgba(0,0,0,0.15);";
  document.body.appendChild(notif);
  setTimeout(() => {
    notif.style.opacity = "0";
    notif.style.transition = "opacity 0.5s ease";
    setTimeout(() => notif.remove(), 500);
  }, 2000);
}

function setupSidebar() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  function openSidebar() {
    sidebar.classList.add("open");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  hamburgerBtn.addEventListener("click", openSidebar);
  overlay.addEventListener("click", closeSidebar);

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      if (window.innerWidth <= 768) closeSidebar();
    });
  });
}

function setupEventListeners() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentCategory = tab.dataset.category;
      renderProducts();
    });
  });

  document.getElementById("cartBtn").addEventListener("click", showCheckout);
  document.getElementById("closeCheckout").addEventListener("click", () => {
    document.getElementById("checkoutOverlay").style.display = "none";
  });

  document.getElementById("checkoutOverlay").addEventListener("click", (e) => {
    if (e.target.id === "checkoutOverlay") e.target.style.display = "none";
  });

  document.querySelector(".checkout-btn").addEventListener("click", () => {
    showNotification(cart.length === 0 ? "Your cart is empty!" : "Proceeding to checkout!");
  });

  const newsletterBtn = document.querySelector(".newsletter-btn");
  if (newsletterBtn) {
    newsletterBtn.addEventListener("click", () => {
      const input = document.querySelector(".newsletter-input");
      if (input && input.value.trim()) {
        showNotification("Subscribed successfully!");
        input.value = "";
      } else {
        showNotification("Please enter a valid email.");
      }
    });
  }
}

setupSidebar();
loadProducts();
setupEventListeners();