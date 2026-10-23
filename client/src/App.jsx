import React, { useState, useEffect } from 'react';
import './App.css';

// SVG Fallback for food images if network or image fails
const FALLBACK_FOOD_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Crect width='400' height='260' fill='%23FFEDD5'/%3E%3Cg transform='translate(160, 90)' fill='%23F97316'%3E%3Cpath d='M40 50c-22.091 0-40-17.909-40-40h80c0 22.091-17.909 40-40 40z'/%3E%3Cpath d='M20 5h40v-4H20v4zm-8 2h56v-2H12v2z'/%3E%3C/g%3E%3Ctext x='50%25' y='180' text-anchor='middle' font-family='sans-serif' font-size='16' font-weight='600' fill='%23C2410C'%3ECampus Canteen Special%3C/text%3E%3C/svg%3E";

const CATEGORIES = ['All', 'Breakfast', 'Snacks', 'Meals', 'Drinks'];

// Backend API URL: In separated deployment (Vercel frontend + Render backend),
// Vercel uses VITE_API_BASE_URL. In local dev or unified Render deploy, defaults to relative path ''.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '') : '';


function App() {
  // 1. Food Menu State
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState(null);

  // 2. Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // 3. Shopping Cart State (Persisted in browser LocalStorage)
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('campuscanteen_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (err) {
      console.error('Error reading cart from LocalStorage:', err);
      return [];
    }
  });

  // 4. Cart Modal & Order Status State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // 5. Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);

  // Save cart to LocalStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('campuscanteen_cart', JSON.stringify(cart));
    } catch (err) {
      console.error('Error saving cart to LocalStorage:', err);
    }
  }, [cart]);

  // Fetch Menu from Express Backend API
  const fetchMenu = async () => {
    setLoadingMenu(true);
    setMenuError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu`);
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const data = await response.json();
      setMenuItems(data);
    } catch (err) {
      console.error('Failed to fetch menu:', err);
      setMenuError('Unable to connect to the canteen server. Please make sure the backend is running.');
    } finally {
      setLoadingMenu(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Show temporary toast notification
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 2500);
  };

  // Cart Functions
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
    showToast(`Added "${item.name}" to cart! 🛒`);
  };

  const updateQuantity = (itemId, change) => {
    setCart((prevCart) => {
      return prevCart
        .map((cartItem) => {
          if (cartItem.id === itemId) {
            const newQty = cartItem.quantity + change;
            return newQty > 0 ? { ...cartItem, quantity: newQty } : null;
          }
          return cartItem;
        })
        .filter(Boolean); // Remove null items where qty was reduced to 0
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((cartItem) => cartItem.id !== itemId));
    showToast('Item removed from cart');
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('campuscanteen_cart');
  };

  // Calculations
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Filtered menu items based on category and search
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle Order Submission to Express Backend
  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      setOrderError('Your cart is empty. Please add items before placing an order.');
      return;
    }

    setIsSubmittingOrder(true);
    setOrderError(null);

    try {
      // Prepare payload with item IDs and quantities
      const orderPayload = {
        items: cart.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
      };

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to place order.');
      }

      // Success: Save confirmed order details and clear cart
      setConfirmedOrder(responseData);
      clearCart();
      setIsCartOpen(false);
    } catch (err) {
      console.error('Order placement error:', err);
      setOrderError(err.message || 'Server error occurred while submitting your order.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toastMessage && <div className="toast-notification">{toastMessage}</div>}

      {/* 1. NAVIGATION BAR */}
      <header className="navbar">
        <div className="nav-content">
          <div className="nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                <line x1="6" y1="1" x2="6" y2="4"></line>
                <line x1="10" y1="1" x2="10" y2="4"></line>
                <line x1="14" y1="1" x2="14" y2="4"></line>
              </svg>
            </div>
            <div className="brand-text">
              <span className="brand-name">Campus<span className="brand-accent">Canteen</span></span>
              <span className="brand-tagline">College Food Ordering</span>
            </div>
          </div>

          <nav className="nav-links">
            <a href="#home" className="nav-link">Home</a>
            <a href="#menu" className="nav-link">Menu</a>
            <button
              id="cart-button"
              className="cart-trigger-btn"
              onClick={() => setIsCartOpen(true)}
              aria-label="Open Shopping Cart"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span className="cart-btn-text">Cart</span>
              {totalCartCount > 0 && (
                <span className="cart-badge">{totalCartCount}</span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* 2. HOME / HERO SECTION */}
      <section id="home" className="hero-section">
        <div className="hero-container">
          <div className="hero-badge">
            <span className="pulse-dot"></span> College Semester Project Demo
          </div>
          <h1 className="hero-title">
            Welcome to <span className="highlight-text">CampusCanteen</span>
          </h1>
          <p className="hero-subtitle">
            Delicious campus food, just a click away! Skip the long lunch queues, order online, and pick up hot meals fresh from the counter.
          </p>

          <div className="hero-actions">
            <a href="#menu" className="btn btn-primary">
              Explore Menu
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            {totalCartCount > 0 && (
              <button className="btn btn-outline" onClick={() => setIsCartOpen(true)}>
                View Cart ({totalCartCount} items • ₹{cartSubtotal})
              </button>
            )}
          </div>

          {/* Quick Perks Bar */}
          <div className="hero-perks">
            <div className="perk-card">
              <span className="perk-icon">⚡</span>
              <div>
                <h4>Fast Pickup</h4>
                <p>Zero counter waiting time</p>
              </div>
            </div>
            <div className="perk-card">
              <span className="perk-icon">🍲</span>
              <div>
                <h4>Fresh & Hygienic</h4>
                <p>Prepared daily on campus</p>
              </div>
            </div>
            <div className="perk-card">
              <span className="perk-icon">💰</span>
              <div>
                <h4>Pocket Friendly</h4>
                <p>Affordable student prices</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOOD MENU SECTION */}
      <section id="menu" className="menu-section">
        <div className="menu-header">
          <div className="section-title-wrap">
            <h2 className="section-title">Today's Canteen Menu</h2>
            <p className="section-description">
              Select your favorite items from our campus kitchen. Live data loaded via Express REST API.
            </p>
          </div>

          {/* Search Bar */}
          <div className="search-wrapper">
            <div className="search-box">
              <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                id="food-search-input"
                type="text"
                placeholder="Search your favorite food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="category-filters">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Loading & Error States */}
        {loadingMenu && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Fetching freshly prepared menu from canteen server...</p>
          </div>
        )}

        {menuError && !loadingMenu && (
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <h3>Unable to Load Menu</h3>
            <p>{menuError}</p>
            <button className="btn btn-primary" onClick={fetchMenu}>
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty Search Results */}
        {!loadingMenu && !menuError && filteredItems.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No Food Items Found</h3>
            <p>No dishes match "{searchQuery}" in category "{selectedCategory}".</p>
            <button
              className="btn btn-outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Food Items Grid */}
        {!loadingMenu && !menuError && filteredItems.length > 0 && (
          <div className="food-grid">
            {filteredItems.map((item) => {
              const inCartItem = cart.find((c) => c.id === item.id);
              const currentQty = inCartItem ? inCartItem.quantity : 0;

              return (
                <div key={item.id} className="food-card">
                  <div className="food-image-container">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="food-image"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_FOOD_IMG;
                      }}
                    />
                    <div className="food-badge-overlay">
                      <span className="category-tag">{item.category}</span>
                      <span className="veg-badge" title="100% Vegetarian">
                        <span className="veg-dot"></span>
                      </span>
                    </div>
                  </div>

                  <div className="food-details">
                    <div className="food-title-row">
                      <h3 className="food-name">{item.name}</h3>
                      <span className="food-price">₹{item.price}</span>
                    </div>

                    <p className="food-description">{item.description}</p>

                    <div className="food-card-footer">
                      {currentQty === 0 ? (
                        <button
                          id={`add-to-cart-btn-${item.id}`}
                          className="btn btn-add"
                          onClick={() => addToCart(item)}
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                          Add to Cart
                        </button>
                      ) : (
                        <div className="quantity-controller">
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, -1)}
                            aria-label="Decrease quantity"
                          >
                            –
                          </button>
                          <span className="qty-value">{currentQty} in cart</span>
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. SHOPPING CART MODAL / DRAWER */}
      {isCartOpen && (
        <div className="modal-backdrop" onClick={() => setIsCartOpen(false)}>
          <div
            className="cart-drawer"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking drawer content
          >
            <div className="drawer-header">
              <div className="drawer-title-group">
                <h3>Your Food Tray</h3>
                <span className="drawer-count">{totalCartCount} items</span>
              </div>
              <button
                className="close-drawer-btn"
                onClick={() => setIsCartOpen(false)}
                aria-label="Close cart"
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart-view">
                <div className="empty-cart-icon">🛒</div>
                <h4>Your tray is hungry!</h4>
                <p>You haven't added any campus canteen items yet. Pick delicious items from the menu.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setIsCartOpen(false)}
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items-list">
                  {cart.map((cartItem) => (
                    <div key={cartItem.id} className="cart-item-row">
                      <img
                        src={cartItem.image}
                        alt={cartItem.name}
                        className="cart-item-thumb"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_FOOD_IMG;
                        }}
                      />
                      <div className="cart-item-info">
                        <h4 className="cart-item-name">{cartItem.name}</h4>
                        <span className="cart-item-price-each">₹{cartItem.price} each</span>
                        <div className="cart-item-calc">
                          ₹{cartItem.price} × {cartItem.quantity} = <strong>₹{cartItem.price * cartItem.quantity}</strong>
                        </div>
                      </div>

                      <div className="cart-item-actions">
                        <div className="mini-qty-box">
                          <button
                            className="mini-qty-btn"
                            onClick={() => updateQuantity(cartItem.id, -1)}
                            aria-label="Decrease"
                          >
                            –
                          </button>
                          <span className="mini-qty-num">{cartItem.quantity}</span>
                          <button
                            className="mini-qty-btn"
                            onClick={() => updateQuantity(cartItem.id, 1)}
                            aria-label="Increase"
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="cart-remove-btn"
                          onClick={() => removeFromCart(cartItem.id)}
                          title="Remove item"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bill Summary */}
                <div className="cart-bill-summary">
                  <h4>Bill Summary</h4>
                  <div className="bill-row">
                    <span>Items Subtotal</span>
                    <span>₹{cartSubtotal}</span>
                  </div>
                  <div className="bill-row text-success">
                    <span>Campus Canteen Convenience Fee</span>
                    <span>FREE (₹0)</span>
                  </div>
                  <div className="bill-divider"></div>
                  <div className="bill-row bill-total">
                    <span>Total Amount to Pay</span>
                    <span className="total-amount-highlight">₹{cartSubtotal}</span>
                  </div>

                  {orderError && (
                    <div className="order-error-banner">
                      ⚠️ {orderError}
                    </div>
                  )}

                  <div className="order-disclaimer-box">
                    ℹ️ <strong>Demo Order:</strong> No real payment or card required. Order verification is performed live on the Express backend.
                  </div>

                  <div className="drawer-actions">
                    <button
                      id="place-order-button"
                      className="btn btn-order-primary"
                      onClick={handlePlaceOrder}
                      disabled={isSubmittingOrder}
                    >
                      {isSubmittingOrder ? (
                        <>
                          <span className="mini-spinner"></span>
                          Processing Order...
                        </>
                      ) : (
                        `Place Demo Order (₹${cartSubtotal})`
                      )}
                    </button>
                    <button
                      className="btn btn-text-danger"
                      onClick={clearCart}
                      disabled={isSubmittingOrder}
                    >
                      Clear Tray
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 5. ORDER CONFIRMATION MODAL */}
      {confirmedOrder && (
        <div className="modal-backdrop">
          <div className="order-receipt-card">
            <div className="receipt-header">
              <div className="receipt-success-icon">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h2>Demo Order Placed Successfully!</h2>
              <p className="receipt-subtitle">
                Your simulated canteen token has been generated.
              </p>
            </div>

            <div className="receipt-token-badge">
              <span className="token-label">PICKUP TOKEN</span>
              <span className="token-number">
                #{confirmedOrder.orderId.slice(-4)}
              </span>
              <span className="token-location">Campus Counter 1 (Hot Foods)</span>
            </div>

            <div className="receipt-details">
              <div className="receipt-row">
                <span className="receipt-label">Order ID:</span>
                <span className="receipt-val mono-font">{confirmedOrder.orderId}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Order Time:</span>
                <span className="receipt-val">{new Date(confirmedOrder.createdAt).toLocaleTimeString()}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Backend Status:</span>
                <span className="status-badge-green">{confirmedOrder.status}</span>
              </div>

              <div className="receipt-items-breakdown">
                <h4>Ordered Items</h4>
                {confirmedOrder.items.map((item, idx) => (
                  <div key={idx} className="receipt-item-line">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{item.subtotal}</span>
                  </div>
                ))}
              </div>

              <div className="receipt-total-row">
                <span>Total Amount Paid (Simulated)</span>
                <span className="receipt-total-val">₹{confirmedOrder.totalAmount}</span>
              </div>

              <div className="college-demo-notice">
                ⚠️ <strong>College Project Notice:</strong> This is an academic semester demonstration. No real food order was sent to the canteen and no actual money was deducted.
              </div>
            </div>

            <div className="receipt-actions">
              <button
                id="receipt-done-btn"
                className="btn btn-primary btn-block"
                onClick={() => setConfirmedOrder(null)}
              >
                Done / Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-col">
            <div className="brand-text">
              <span className="brand-name">Campus<span className="brand-accent">Canteen</span></span>
            </div>
            <p className="footer-desc">
              Full Stack College Canteen Food Ordering demonstration system developed for B.Tech semester examination.
            </p>
          </div>

          <div className="footer-col">
            <h4>Technology Stack</h4>
            <div className="tech-tags">
              <span className="tech-badge">React JS (Vite)</span>
              <span className="tech-badge">Node.js</span>
              <span className="tech-badge">Express.js</span>
              <span className="tech-badge">REST APIs</span>
              <span className="tech-badge">JSON Database</span>
              <span className="tech-badge">Vanilla CSS3</span>
            </div>
          </div>

          <div className="footer-col">
            <h4>System Architecture</h4>
            <p className="footer-desc">
              Single-server full stack deployment. Express API serves backend endpoints and statically serves compiled React client on Render.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 CampusCanteen • Academic Semester Project Demonstration • Designed with #F97316 Orange Theme</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
