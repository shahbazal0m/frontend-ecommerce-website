let products = [];
let cart = [];
let currentCategory = "all";

// Load products from API
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

// Render featured products
function renderFeaturedProducts() {
  const container = document.getElementById("featuredProducts");
  const featured = products.slice(0, 2);

  container.innerHTML = featured
    .map(
      (product, index) => `
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
      `
    )
    .join("");
}

// Render products grid
function renderProducts() {
  const container = document.getElementById("productsGrid");
  const filteredProducts =
    currentCategory === "all"
      ? products
      : products.filter((p) => p.category === currentCategory);

  if (filteredProducts.length === 0) {
    container.innerHTML = '<div class="loading"><p>No products found</p></div>';
    return;
  }

  container.innerHTML = filteredProducts
    .map(
      (product) => `
        <div class="product-card">
          <button class="wishlist-btn" onclick="toggleWishlist(${product.id})">
            <i class="far fa-heart"></i>
          </button>
          <img src="${product.image}" alt="${product.title}" class="product-image">
          <div class="product-info">
            <h4>${product.title.substring(0, 40)}...</h4>
            <p style="color: #64748b; font-size: 0.875rem; margin: 0.5rem 0;">
              $${product.price}
            </p>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
              Add to Cart
            </button>
          </div>
        </div>
      `
    )
    .join("");
}

// Add to cart
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

// Remove from cart
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCartUI();
  renderCheckout();
}

// Update quantity
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

// Toggle wishlist
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

// Update cart badge
function updateCartUI() {
  const badge = document.getElementById("cartBadge");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = totalItems;
  badge.style.display = totalItems > 0 ? "flex" : "none";
}

// Show checkout modal
function showCheckout() {
  const overlay = document.getElementById("checkoutOverlay");
  overlay.style.display = "flex";
  renderCheckout();
}

// Render checkout modal content
function renderCheckout() {
  const content = document.getElementById("checkoutContent");
  const footer = document.getElementById("checkoutFooter");
  const totalAmount = document.getElementById("totalAmount");

  if (cart.length === 0) {
    content.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart" style="font-size: 3rem; color: #e2e8f0; margin-bottom: 1rem;"></i>
        <p>Your cart is empty</p>
      </div>
    `;
    footer.style.display = "none";
    return;
  }

  content.innerHTML = cart
    .map(
      (item) => `
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
    `
    )
    .join("");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  totalAmount.textContent = `Total: $${total.toFixed(2)}`;
  footer.style.display = "block";
}

// Show notification popup
function showNotification(message) {
  const notif = document.createElement("div");
  notif.textContent = message;
  notif.style.position = "fixed";
  notif.style.bottom = "20px";
  notif.style.right = "20px";
  notif.style.background = "#3b82f6";
  notif.style.color = "white";
  notif.style.padding = "0.75rem 1rem";
  notif.style.borderRadius = "8px";
  notif.style.fontWeight = "600";
  notif.style.zIndex = "2000";
  notif.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.opacity = "0";
    notif.style.transition = "opacity 0.5s ease";
    setTimeout(() => notif.remove(), 500);
  }, 2000);
}

// Setup event listeners
function setupEventListeners() {
  // Tabs
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentCategory = tab.dataset.category;
      renderProducts();
    });
  });

  // Cart open/close
  document.getElementById("cartBtn").addEventListener("click", showCheckout);
  document.getElementById("closeCheckout").addEventListener("click", () => {
    document.getElementById("checkoutOverlay").style.display = "none";
  });

  // Overlay click to close
  document.getElementById("checkoutOverlay").addEventListener("click", (e) => {
    if (e.target.id === "checkoutOverlay") {
      e.target.style.display = "none";
    }
  });

  // Proceed to Checkout notification
  const checkoutBtn = document.querySelector(".checkout-btn");
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      showNotification("Your cart is empty!");
    } else {
      showNotification("Proceeding to checkout!");
      // Add real checkout logic here if needed
    }
  });
}


// Initialize everything
loadProducts();
setupEventListeners();
