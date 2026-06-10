import { useEffect, useState, useCallback } from "react";

const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
const ASSET_URL = (import.meta.env.VITE_ASSET_URL || API_URL.replace(/\/api$/, "") || "").replace(/\/$/, "");

const statusSteps = ["Placed", "Confirmed", "Processing", "Shipped", "Delivered"];

const quickLinks = [
  { id: "Smartphones", label: "Phones", icon: "📱" },
  { id: "Laptops", label: "Laptops", icon: "💻" },
  { id: "Accessories", label: "Accessories", icon: "🎧" },
  { id: "Home Electronics", label: "Home Tech", icon: "📺" },
  { id: "Gaming", label: "Gaming", icon: "🎮" },
  { id: "Cameras", label: "Cameras", icon: "📷" },
];

const benefits = [
  { icon: "🚚", title: "Free Delivery", detail: "On orders over M500" },
  { icon: "🔒", title: "Secure Payment", detail: "100% protected" },
  { icon: "↩️", title: "Easy Returns", detail: "30-day policy" },
  { icon: "⭐", title: "Best Prices", detail: "Guaranteed value" },
];

const countries = {
  Lesotho: { currency: "LSL", symbol: "M", flag: "🇱🇸", code: "+266", addressFields: ["town", "village", "streetName", "buildingNumber"] },
  "South Africa": { currency: "ZAR", symbol: "R", flag: "🇿🇦", code: "+27", addressFields: ["province", "city", "streetName", "buildingNumber"] },
  Botswana: { currency: "BWP", symbol: "P", flag: "🇧🇼", code: "+267", addressFields: ["city", "village", "streetName", "buildingNumber"] },
  Zimbabwe: { currency: "ZWL", symbol: "Z$", flag: "🇿🇼", code: "+263", addressFields: ["province", "city", "streetName", "buildingNumber"] },
};

const emptyAddress = {
  fullName: "", phoneNumber: "", identityNumber: "", country: "",
  province: "", town: "", city: "", village: "", streetName: "", buildingNumber: "",
};

const amount = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function formatCurrency(value, country) {
  const d = countries[country] || countries["Lesotho"];
  return `${d.symbol} ${amount.format(Number(value) || 0)}`;
}

function resolveImageUrl(image) {
  if (!image) return "";
  const c = image.trim().replace(/\\/g, "/");
  if (c.startsWith("http://") || c.startsWith("https://")) return c;
  if (c.startsWith("/backend/products/images/")) return `${ASSET_URL}${c.replace("/backend/products/images/", "/assets/products/images/")}`;
  if (c.startsWith("/assets/")) return `${ASSET_URL}${c}`;
  if (c.startsWith("/products/")) return `${ASSET_URL}/assets${c}`;
  if (c.startsWith("products/")) return `${ASSET_URL}/assets/${c}`;
  if (c.startsWith("images/")) return `${ASSET_URL}/assets/products/${c}`;
  return `${ASSET_URL}/assets/products/images/${c}`;
}

function ProductImage({ image, name, className }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [image]);
  if (failed || !image) {
    return (
      <div className={`${className ?? ""} imageFallback`} role="img" aria-label={name}>
        <span>{name?.charAt(0) || "D"}</span>
      </div>
    );
  }
  return <img src={resolveImageUrl(image)} alt={name} className={className} onError={() => setFailed(true)} />;
}

async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    });
  } catch {
    throw new Error(`Backend server is not reachable at ${API_URL}.`);
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Backend returned an invalid response from ${API_URL}.`);
  }
  if (!response.ok) throw new Error(data?.message || "Request failed");
  return data;
}

// Main App ───────────────────────────────────────────────
function App() {
  // Data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [session, setSession] = useState(null);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [selectedCartItems, setSelectedCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [adminData, setAdminData] = useState(null);

  // UI State
  const [activeView, setActiveView] = useState("store");
  const [authTab, setAuthTab] = useState("login");
  const [userCountry, setUserCountry] = useState("");
  const [countrySelected, setCountrySelected] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Forms
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "", role: "customer" });
  const [productForm, setProductForm] = useState({ name: "", category: "Laptops", brand: "", price: "", stock: "", description: "", image: "" });

  // Address
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
  const [addressForm, setAddressForm] = useState({ ...emptyAddress });
  const [showAddAddress, setShowAddAddress] = useState(false);

  // Checkout flow: steps = "cart" | "address" | "payment" | "confirm"
  const [checkoutStep, setCheckoutStep] = useState("cart");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardDetails, setCardDetails] = useState({ cardNumber: "", expiryDate: "", cvv: "" });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Modals
  const [showSuccess, setShowSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);

  // ── Toast helper ──────────────────────────────────────────
  const toast = useCallback((msg) => {
    setStatusMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2800);
  }, []);

  // ── Boot ─────────────────────────────────────────────────
  useEffect(() => {
    const savedSession = localStorage.getItem("session");
    if (savedSession) {
      try { setSession(JSON.parse(savedSession)); } catch { localStorage.removeItem("session"); }
    }
    const savedCountry = localStorage.getItem("userCountry");
    if (savedCountry) {
      setUserCountry(savedCountry);
      setCountrySelected(true);
    }
    const addrs = localStorage.getItem("savedAddresses");
    if (addrs) { try { setSavedAddresses(JSON.parse(addrs)); } catch {} }
  }, []);

  useEffect(() => {
    if (savedAddresses.length > 0 && selectedAddressIndex === null) setSelectedAddressIndex(0);
  }, [savedAddresses, selectedAddressIndex]);

  // ── API helpers ───────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    const data = await api(`/products?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`);
    setProducts(data.items);
    setCategories(data.categories);
  }, [search, category]);

  const loadCart = useCallback(async (userId) => {
    const data = await api("/cart", { headers: { "x-user-id": userId } });
    setCart(data);
  }, []);

  const loadOrders = useCallback(async (userId) => {
    const data = await api("/orders", { headers: { "x-user-id": userId } });
    setOrders(data);
  }, []);

  const loadAdmin = useCallback(async (userId) => {
    const data = await api("/admin/dashboard", { headers: { "x-user-id": userId } });
    setAdminData(data);
  }, []);

  useEffect(() => { loadProducts().catch(e => toast(e.message)); }, [search, category]);

  useEffect(() => {
    if (!session) return;
    loadCart(session.token).catch(e => toast(e.message));
    loadOrders(session.token).catch(e => toast(e.message));
    if (session.user.role === "admin") loadAdmin(session.token).catch(e => toast(e.message));
    else setAdminData(null);
  }, [session]);

  // ── Country ───────────────────────────────────────────────
  const selectCountry = (country) => {
    setUserCountry(country);
    setCountrySelected(true);
    localStorage.setItem("userCountry", country);
  };

  // ── Auth ──────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await api("/auth/login", { method: "POST", body: JSON.stringify(loginForm) });
      setSession(data);
      localStorage.setItem("session", JSON.stringify(data));
      toast(`Welcome back, ${data.user.name}! 👋`);
      setActiveView(data.user.role === "admin" ? "admin" : "store");
    } catch (err) { toast(err.message); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const data = await api("/auth/register", { method: "POST", body: JSON.stringify(registerForm) });
      setSession(data);
      localStorage.setItem("session", JSON.stringify(data));
      setRegisterForm({ name: "", email: "", password: "", role: "customer" });
      toast(`Account created! Welcome, ${data.user.name}! 🎉`);
      setActiveView("store");
    } catch (err) { toast(err.message); }
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem("session");
    localStorage.removeItem("userCountry");
    localStorage.removeItem("savedAddresses");
    setCountrySelected(false);
    setAdminData(null);
    setCart({ items: [], total: 0 });
    setOrders([]);
    setSavedAddresses([]);
    setSelectedAddressIndex(null);
    setActiveView("store");
    toast("Signed out. See you soon!");
  };

  const handleDemoLogin = async (mode = "customer") => {
    const creds = mode === "admin"
      ? { email: "admin@datamak.test", password: "Admin123!" }
      : { email: "alice@example.com", password: "Password123!" };
    setLoginForm(creds);
    try {
      const data = await api("/auth/login", { method: "POST", body: JSON.stringify(creds) });
      setSession(data);
      localStorage.setItem("session", JSON.stringify(data));
      toast(`Logged in as ${data.user.name}. 👋`);
      setActiveView(data.user.role === "admin" ? "admin" : "store");
    } catch (err) { toast(err.message); }
  };

  // ── Cart ──────────────────────────────────────────────────
  const handleAddToCart = async (productId) => {
    if (!session) { toast("Sign in to add items to cart 🛒"); setActiveView("account"); return; }
    try {
      const data = await api("/cart", {
        method: "POST",
        headers: { "x-user-id": session.token },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      setCart(data);
      toast("Added to cart! 🛍️");
    } catch (err) { toast(err.message); }
  };

  const handleUpdateQuantity = async (productId, newQty) => {
    if (!session) return;
    if (newQty <= 0) { handleRemoveFromCart(productId); return; }
    try {
      const data = await api(`/cart/${productId}`, {
        method: "PUT",
        headers: { "x-user-id": session.token },
        body: JSON.stringify({ quantity: newQty }),
      });
      setCart(data);
    } catch (err) { toast(err.message); }
  };

  const handleRemoveFromCart = async (productId) => {
    if (!session) return;
    try {
      const data = await api(`/cart/${productId}`, {
        method: "DELETE", headers: { "x-user-id": session.token },
      });
      setCart(data);
      setSelectedCartItems(p => p.filter(id => id !== productId));
    } catch (err) { toast(err.message); }
  };

  const toggleCartItem = (id) => setSelectedCartItems(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  const selectAllCart = (checked) => setSelectedCartItems(checked ? cart.items.map(i => i.productId) : []);

  const selectedItems = cart.items.filter(i => selectedCartItems.includes(i.productId));
  const selectedTotal = selectedItems.reduce((s, i) => s + i.product.price * i.quantity, 0);

  // ── Checkout ──────────────────────────────────────────────
  const initiateCheckout = () => {
    if (!session) { toast("Sign in to checkout"); setActiveView("account"); return; }
    if (selectedItems.length === 0) { toast("Select at least one item to checkout"); return; }
    if (savedAddresses.length === 0) {
      setCheckoutStep("address"); setActiveView("checkout"); return;
    }
    setCheckoutStep("address");
    setActiveView("checkout");
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    const addr = { ...addressForm, country: userCountry };
    const required = ["fullName", "phoneNumber", "identityNumber", "streetName", "buildingNumber"];
    const countryFields = countries[userCountry]?.addressFields || [];
    for (const f of [...required, ...countryFields]) {
      if (!addr[f]) { toast("Please fill all address fields"); return; }
    }
    if (!/^\+\d{7,20}$/.test(addr.phoneNumber)) {
      toast("Phone must include country code, e.g. +26612345678"); return;
    }
    const newAddresses = [...savedAddresses, addr];
    setSavedAddresses(newAddresses);
    localStorage.setItem("savedAddresses", JSON.stringify(newAddresses));
    setSelectedAddressIndex(newAddresses.length - 1);
    setShowAddAddress(false);
    setAddressForm({ ...emptyAddress });
    toast("Address saved!");
  };

  const proceedToPayment = () => {
    if (selectedAddressIndex === null) { toast("Select an address"); return; }
    setCheckoutStep("payment");
  };

  const handlePlaceOrder = async () => {
    if (!paymentMethod) { toast("Select a payment method"); return; }
    if (paymentMethod === "Card") {
      if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv) {
        toast("Please complete all card details"); return;
      }
      if (!/^\d{13,19}$/.test(cardDetails.cardNumber.replace(/\s/g, ""))) {
        toast("Invalid card number"); return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
        toast("Invalid expiry date (MM/YY)"); return;
      }
      if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
        toast("Invalid CVV"); return;
      }
    }
    setIsPlacingOrder(true);
    try {
      const order = await api("/orders/checkout", {
        method: "POST",
        headers: { "x-user-id": session.token },
        body: JSON.stringify({
          selectedProductIds: selectedCartItems,
          shippingAddress: savedAddresses[selectedAddressIndex ?? 0],
          paymentMethod,
        }),
      });
      setPlacedOrder(order);
      setShowSuccess(true);
      setCheckoutStep("cart");
      setSelectedCartItems([]);
      setPaymentMethod("");
      setCardDetails({ cardNumber: "", expiryDate: "", cvv: "" });
      await loadCart(session.token);
      await loadOrders(session.token);
      if (session.user.role === "admin") await loadAdmin(session.token);
    } catch (err) { toast(err.message); }
    setIsPlacingOrder(false);
  };

  // ── Admin ─────────────────────────────────────────────────
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!session || session.user.role !== "admin") { toast("Admin only"); return; }
    try {
      await api("/products", {
        method: "POST",
        headers: { "x-user-id": session.token },
        body: JSON.stringify(productForm),
      });
      setProductForm({ name: "", category: categories[0] ?? "Laptops", brand: "", price: "", stock: "", description: "", image: "" });
      toast("Product created!");
      await loadProducts();
      await loadAdmin(session.token);
    } catch (err) { toast(err.message); }
  };

  const handleAdvanceOrder = async (orderId, nextStatus) => {
    try {
      await api(`/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "x-user-id": session.token },
        body: JSON.stringify({ status: nextStatus }),
      });
      toast(`Order updated to ${nextStatus}`);
      await loadOrders(session.token);
      await loadAdmin(session.token);
    } catch (err) { toast(err.message); }
  };

  // ── Views ──────────────────────────────────────────────────
  const hasFilters = Boolean(search.trim() || category);
  const featured = hasFilters ? [] : products.slice(0, 12);
  const displayedProducts = hasFilters ? products : featured;

  // ── Country Modal ──────────────────────────────────────────
  if (!countrySelected) {
    return (
      <div className="countryOverlay">
        <div className="countryModal">
          <div className="countryModalHeader">
            <div className="countryModalLogo">
              <div className="countryModalLogoMark">D</div>
              <strong style={{ fontSize: 18, fontWeight: 900 }}>DATAMAK</strong>
            </div>
            <h2>Where are you shopping from?</h2>
            <p>We'll show prices and delivery options for your country</p>
          </div>
          <div className="countryOptions">
            {Object.entries(countries).map(([name, d]) => (
              <button key={name} className="countryOption" onClick={() => selectCountry(name)}>
                <span className="countryFlag">{d.flag}</span>
                <span className="countryName">{name}</span>
                <span className="countryCurrency">{d.symbol} ({d.currency})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Store Header (appears on all views) ───────────────────
  const renderHeader = () => (
    <header className="siteHeader">
      <div className="headerTop">
        <button className="headerLogo" onClick={() => setActiveView("store")}>
          <div className="headerLogoMark">D</div>
          <span className="headerLogoText">DATAMAK</span>
        </button>
        <div className="headerSearch">
          <select value={category} onChange={e => { setCategory(e.target.value); setActiveView("store"); }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input value={search} onChange={e => { setSearch(e.target.value); setActiveView("store"); }} placeholder="Search products, brands and more..." />
          <button className="headerSearchBtn">🔍</button>
        </div>
        <div className="headerActions">
          {session ? (
            <button className="headerAction" onClick={() => setActiveView("account")}>
              <span className="actionIcon">👤</span>
              <span style={{ maxWidth: 64, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {session.user.name.split(" ")[0]}
              </span>
            </button>
          ) : (
            <button className="headerSignin" onClick={() => setActiveView("account")}>Sign In</button>
          )}
          <button className="headerAction" onClick={() => {
            if (!session) { toast("Sign in to view cart"); setActiveView("account"); return; }
            setActiveView("cart");
          }}>
            <span className="actionIcon">🛒</span>
            <span>Cart</span>
            {cart.items.length > 0 && <span className="cartBadge">{cart.items.length}</span>}
          </button>
          <button className="headerAction" onClick={() => {
            if (!session) { toast("Sign in to see orders"); setActiveView("account"); return; }
            setActiveView("orders");
          }}>
            <span className="actionIcon">📦</span>
            <span>Orders</span>
          </button>
          {session?.user.role === "admin" && (
            <button className="headerAction" onClick={() => setActiveView("admin")}>
              <span className="actionIcon">⚙️</span>
              <span>Admin</span>
            </button>
          )}
        </div>
      </div>
      <nav className="categoryNav">
        <div className="categoryNavInner">
          <button className={`categoryNavBtn${!category ? " active" : ""}`} onClick={() => { setCategory(""); setActiveView("store"); }}>All</button>
          {quickLinks.map(l => (
            <button key={l.id} className={`categoryNavBtn${category === l.id ? " active" : ""}`}
              onClick={() => { setCategory(l.id); setActiveView("store"); }}>
              {l.icon} {l.label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );

  // ── Product Card ──────────────────────────────────────────
  const renderProductCard = (product) => {
    return (
      <article className="productCard" key={product.id}>
        <div className="productThumb">
          <ProductImage image={product.image} name={product.name} />
          <button className="wishlistBtn" onClick={(e) => { e.stopPropagation(); toast("Added to wishlist ❤️"); }}>♡</button>
        </div>
        <div className="productInfo">
          <div className="productName">{product.name}</div>
          <div className="productPriceRow">
            <span className="productPrice">{formatCurrency(product.price, userCountry)}</span>
          </div>
          <button className="addToCartBtn" onClick={() => handleAddToCart(product.id)}>
            🛒 Add to Cart
          </button>
        </div>
      </article>
    );
  };

  // ── STOREFRONT ────────────────────────────────────────────
  const renderStore = () => (
    <div className="mainContent">
      {/* Hero */}
      <div className="heroBanner">
        <div className="heroContent">
          <div className="heroEyebrow">✨ New Arrivals</div>
          <h1 className="heroTitle">Your Ultimate<br />Tech Marketplace</h1>
          <p className="heroSub">Premium electronics at amazing prices</p>
          <button className="heroCta" onClick={() => { setCategory(""); setSearch(""); }}>
            Shop Now →
          </button>
        </div>
        <div className="heroVisualRight">
        </div>
      </div>

      {/* Quick Category Grid */}
      <div className="quickCatGrid">
        {quickLinks.map(l => (
          <button key={l.id} className="quickCatTile" onClick={() => { setCategory(l.id); }}>
            <span className="quickCatIcon">{l.icon}</span>
            <span className="quickCatLabel">{l.label}</span>
          </button>
        ))}
      </div>

      {/* Products */}
      <div className="secHeader">
        <span className="secTitle">{hasFilters ? (search ? `Results for "${search}"` : `${category} Products`) : "Featured Products"}</span>
        {!hasFilters && <button className="secViewAll" onClick={() => {}}>View All →</button>}
      </div>

      {displayedProducts.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          No products found.
        </div>
      ) : (
        <div className="productGrid">
          {displayedProducts.map(renderProductCard)}
        </div>
      )}

      {/* Benefits */}
      <div className="benefitStrip" style={{ marginTop: 24 }}>
        {benefits.map(b => (
          <div className="benefitCard" key={b.title}>
            <span className="benefitIcon">{b.icon}</span>
            <div className="benefitText">
              <strong>{b.title}</strong>
              <span>{b.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── ACCOUNT ───────────────────────────────────────────────
  const renderAccount = () => (
    <div className="pageAccount" style={{ paddingTop: 16 }}>
      <div className="authCard">
        {session ? (
          <>
            <div className="authCardHeader">
              <div className="authLogoCircle">{session.user.name.charAt(0).toUpperCase()}</div>
              <h2>{session.user.name}</h2>
              <p>{session.user.email} · {session.user.role}</p>
            </div>
            <div className="authSignedIn">
              <div className="authUserInfo">
                <strong>Welcome back!</strong>
                <span>You can shop, track orders & manage your account</span>
              </div>
              <button className="signOutBtn" onClick={handleLogout}>Sign Out</button>
            </div>
            <div style={{ padding: "0 20px 16px", display: "flex", gap: 10 }}>
              <button className="primaryBtn" style={{ flex: 1 }} onClick={() => setActiveView("orders")}>📦 My Orders</button>
              <button className="ghostBtn" style={{ flex: 1, marginTop: 0 }} onClick={() => setActiveView("store")}>🛍️ Shop Now</button>
            </div>
          </>
        ) : (
          <>
            <div className="authCardHeader">
              <div className="authLogoCircle">D</div>
              <h2>Sign in to DataMak</h2>
              <p>Get the best deals, track orders & more</p>
            </div>
            <div className="authTabs">
              <button className={`authTab${authTab === "login" ? " active" : ""}`} onClick={() => setAuthTab("login")}>Sign In</button>
              <button className={`authTab${authTab === "register" ? " active" : ""}`} onClick={() => setAuthTab("register")}>Create Account</button>
            </div>
            {authTab === "login" ? (
              <form className="authForm" onSubmit={handleLogin}>
                <div className="inputGroup">
                  <label>Email Address</label>
                  <input className="inputField" type="email" placeholder="your@email.com" required value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />
                </div>
                <div className="inputGroup">
                  <label>Password</label>
                  <input className="inputField" type="password" placeholder="Your password" required value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
                </div>
                <button type="submit" className="primaryBtn">Sign In</button>
                <div className="authDivider">or use quick access</div>
                <div className="quickLoginBtns">
                  <button type="button" className="quickLoginBtn" onClick={() => handleDemoLogin("customer")}>👤 Demo Customer</button>
                  <button type="button" className="quickLoginBtn" onClick={() => handleDemoLogin("admin")}>⚙️ Demo Admin</button>
                </div>
              </form>
            ) : (
              <form className="authForm" onSubmit={handleRegister}>
                <div className="inputGroup">
                  <label>Full Name</label>
                  <input className="inputField" placeholder="Your full name" value={registerForm.name} onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })} />
                </div>
                <div className="inputGroup">
                  <label>Email Address</label>
                  <input className="inputField" type="email" placeholder="your@email.com" required value={registerForm.email} onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })} />
                </div>
                <div className="inputGroup">
                  <label>Password</label>
                  <input className="inputField" type="password" placeholder="Choose a password" required value={registerForm.password} onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} />
                </div>
                <div className="inputGroup">
                  <label>Account Type</label>
                  <select className="inputSelect" value={registerForm.role} onChange={e => setRegisterForm({ ...registerForm, role: e.target.value })}>
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button type="submit" className="primaryBtn">Create Account</button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );

  // ── CART ──────────────────────────────────────────────────
  const renderCart = () => (
    <div className="pageCart">
      {!session && (
        <div className="miniAuthBox">
          <span>Sign in to access your full cart & checkout</span>
          <button className="miniSigninBtn" onClick={() => setActiveView("account")}>Sign In</button>
        </div>
      )}
      <div className="surface">
        <div className="cartHeader">
          <h2 className="cartHeaderTitle">Shopping Cart</h2>
          <span className="cartHeaderCount">{cart.items.length} item{cart.items.length !== 1 ? "s" : ""}</span>
        </div>
        {cart.items.length > 0 && (
          <div className="selectAllRow">
            <input type="checkbox" id="selectAll"
              checked={cart.items.length > 0 && selectedCartItems.length === cart.items.length}
              onChange={e => selectAllCart(e.target.checked)} />
            <label htmlFor="selectAll">Select All ({cart.items.length} items)</label>
          </div>
        )}
        <div className="cartItemsList">
          {cart.items.length === 0 ? (
            <div className="cartEmpty">
              <div className="emptyIcon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added anything yet</p>
              <button className="shopNowBtn" onClick={() => setActiveView("store")}>Start Shopping</button>
            </div>
          ) : (
            cart.items.map(item => (
              <div className="cartItem" key={item.productId}>
                <input type="checkbox" checked={selectedCartItems.includes(item.productId)} onChange={() => toggleCartItem(item.productId)} />
                <div className="cartItemImg">
                  <ProductImage image={item.product.image} name={item.product.name} />
                </div>
                <div className="cartItemBody">
                  <div className="cartItemName">{item.product.name}</div>
                  <div className="cartItemBrand">{item.product.brand} · {item.product.category}</div>
                  <div className="cartItemPrice">{formatCurrency(item.product.price, userCountry)}</div>
                </div>
                <div className="cartItemRight">
                  <div className="qtyControl">
                    <button className="qtyBtn" onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}>−</button>
                    <span className="qtyNum">{item.quantity}</span>
                    <button className="qtyBtn" onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}>+</button>
                  </div>
                  <div className="cartItemTotal">{formatCurrency(item.product.price * item.quantity, userCountry)}</div>
                  <button className="removeBtn" onClick={() => handleRemoveFromCart(item.productId)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.items.length > 0 && (
          <div className="cartBottom">
            <div className="cartSummaryText">
              <span>Selected ({selectedItems.length})</span>
              <strong>{formatCurrency(selectedTotal, userCountry)}</strong>
            </div>
            <button className="checkoutBtn" disabled={selectedItems.length === 0} onClick={initiateCheckout}>
              Checkout ({selectedItems.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ── CHECKOUT (Address → Payment → Confirm) ────────────────
  const renderCheckout = () => {
    const steps = [
      { key: "address", label: "Address" },
      { key: "payment", label: "Payment" },
      { key: "confirm", label: "Confirm" },
    ];
    const currentStepIdx = steps.findIndex(s => s.key === checkoutStep);

    return (
      <div className="pageCheckout">
        {/* Steps */}
        <div className="checkoutSteps">
          {steps.map((s, i) => (
            <div key={s.key} className="checkoutStep">
              <div className={`stepDot ${i < currentStepIdx ? "done" : i === currentStepIdx ? "active" : ""}`}>
                {i < currentStepIdx ? "✓" : i + 1}
              </div>
              <span className={`stepLabel${i === currentStepIdx ? " active" : ""}`}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Address Step */}
        {checkoutStep === "address" && (
          <div className="checkoutCard">
            <div className="checkoutCardHead">
              <span style={{ fontSize: 20 }}>📍</span>
              <h3>Shipping Address</h3>
            </div>
            <div className="checkoutCardBody">
              {/* Saved addresses */}
              {savedAddresses.length > 0 && (
                <div className="addressList">
                  <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "var(--text-secondary)" }}>Your Addresses</p>
                  {savedAddresses.map((addr, idx) => (
                    <div key={idx} className={`addressOptionCard${selectedAddressIndex === idx ? " selected" : ""}`}
                      onClick={() => setSelectedAddressIndex(idx)}>
                      <input type="radio" name="addrSelect" readOnly checked={selectedAddressIndex === idx} />
                      <div className="addressOptionBody">
                        <div className="addressOptionName">{addr.fullName}</div>
                        <div className="addressOptionDetail">
                          {addr.streetName} {addr.buildingNumber}, {addr.city || addr.town || addr.village}<br />
                          {addr.province ? `${addr.province}, ` : ""}{addr.country || userCountry}<br />
                          {addr.phoneNumber}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add address toggle */}
              {!showAddAddress && (
                <button className="addAddressBtn" onClick={() => setShowAddAddress(true)}>
                  + Add New Address
                </button>
              )}

              {/* Add address form */}
              {showAddAddress && (
                <form onSubmit={handleSaveAddress} style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: "var(--text-secondary)" }}>
                    📍 New Address — {countries[userCountry]?.flag} {userCountry} ({countries[userCountry]?.code})
                  </p>
                  <div className="formRow">
                    <div className="formGroup">
                      <label>Full Name</label>
                      <input className="formInput" placeholder="Your full name" required value={addressForm.fullName} onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })} />
                    </div>
                    <div className="formGroup">
                      <label>Phone Number</label>
                      <input className="formInput" placeholder={`${countries[userCountry]?.code}xxxxxxxx`} required value={addressForm.phoneNumber} onChange={e => setAddressForm({ ...addressForm, phoneNumber: e.target.value })} />
                    </div>
                  </div>
                  <div className="formRow full">
                    <div className="formGroup">
                      <label>ID / Foreigner Number</label>
                      <input className="formInput" placeholder="National ID or passport number" required value={addressForm.identityNumber} onChange={e => setAddressForm({ ...addressForm, identityNumber: e.target.value })} />
                    </div>
                  </div>
                  {countries[userCountry]?.addressFields.includes("province") && (
                    <div className="formRow full">
                      <div className="formGroup">
                        <label>Province</label>
                        <input className="formInput" placeholder="Province" required value={addressForm.province} onChange={e => setAddressForm({ ...addressForm, province: e.target.value })} />
                      </div>
                    </div>
                  )}
                  <div className="formRow">
                    {countries[userCountry]?.addressFields.includes("town") && (
                      <div className="formGroup">
                        <label>Town</label>
                        <input className="formInput" placeholder="Town" required value={addressForm.town} onChange={e => setAddressForm({ ...addressForm, town: e.target.value })} />
                      </div>
                    )}
                    {countries[userCountry]?.addressFields.includes("city") && (
                      <div className="formGroup">
                        <label>City</label>
                        <input className="formInput" placeholder="City" required value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} />
                      </div>
                    )}
                    {countries[userCountry]?.addressFields.includes("village") && (
                      <div className="formGroup">
                        <label>Village</label>
                        <input className="formInput" placeholder="Village" value={addressForm.village} onChange={e => setAddressForm({ ...addressForm, village: e.target.value })} />
                      </div>
                    )}
                  </div>
                  <div className="formRow">
                    <div className="formGroup">
                      <label>Street Name</label>
                      <input className="formInput" placeholder="Street name" required value={addressForm.streetName} onChange={e => setAddressForm({ ...addressForm, streetName: e.target.value })} />
                    </div>
                    <div className="formGroup">
                      <label>Building Number</label>
                      <input className="formInput" placeholder="Building / house no." required value={addressForm.buildingNumber} onChange={e => setAddressForm({ ...addressForm, buildingNumber: e.target.value })} />
                    </div>
                  </div>
                  <div className="checkoutActions">
                    <button type="submit" className="primaryBtn">Save Address</button>
                    <button type="button" className="ghostBtn" onClick={() => setShowAddAddress(false)}>Cancel</button>
                  </div>
                </form>
              )}

              {!showAddAddress && (
                <div className="checkoutActions">
                  <button className="primaryBtn" onClick={proceedToPayment} disabled={selectedAddressIndex === null}>
                    Continue to Payment →
                  </button>
                  <button className="ghostBtn" onClick={() => setActiveView("cart")}>← Back to Cart</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Step */}
        {checkoutStep === "payment" && (
          <div className="checkoutCard">
            <div className="checkoutCardHead">
              <span style={{ fontSize: 20 }}>💳</span>
              <h3>Payment Method</h3>
            </div>
            <div className="checkoutCardBody">
              <div className="paymentOptions">
                {[
                  { value: "Card", icon: "💳", label: "Credit / Debit Card", sub: "Visa, Mastercard, etc." },
                  { value: "PayPal", icon: "🅿️", label: "PayPal", sub: "Pay with your PayPal balance" },
                  { value: "Others", icon: "💰", label: "Other Methods", sub: "Mobile money, bank transfer" },
                ].map(opt => (
                  <label key={opt.value} className={`paymentOption${paymentMethod === opt.value ? " selected" : ""}`}>
                    <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={e => setPaymentMethod(e.target.value)} />
                    <span className="paymentOptionIcon">{opt.icon}</span>
                    <div className="paymentOptionInfo">
                      <strong>{opt.label}</strong>
                      <span>{opt.sub}</span>
                    </div>
                  </label>
                ))}
              </div>

              {paymentMethod === "Card" && (
                <div className="cardDetailsForm">
                  <div className="cardDetailsTitle">🔒 Card Details</div>
                  <div className="formRow full">
                    <div className="formGroup">
                      <label>Card Number</label>
                      <input className="formInput" placeholder="1234 5678 9012 3456" value={cardDetails.cardNumber}
                        onChange={e => setCardDetails({ ...cardDetails, cardNumber: e.target.value.replace(/\s/g, "") })} />
                    </div>
                  </div>
                  <div className="formRow">
                    <div className="formGroup">
                      <label>Expiry Date</label>
                      <input className="formInput" placeholder="MM/YY" value={cardDetails.expiryDate}
                        onChange={e => setCardDetails({ ...cardDetails, expiryDate: e.target.value })} />
                    </div>
                    <div className="formGroup">
                      <label>CVV</label>
                      <input className="formInput" placeholder="123" type="password" value={cardDetails.cvv}
                        onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}

              <div className="checkoutActions">
                <button className="primaryBtn" onClick={() => setCheckoutStep("confirm")} disabled={!paymentMethod}>
                  Review Order →
                </button>
                <button className="ghostBtn" onClick={() => setCheckoutStep("address")}>← Back</button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Step */}
        {checkoutStep === "confirm" && (
          <div className="checkoutCard">
            <div className="checkoutCardHead">
              <span style={{ fontSize: 20 }}>📋</span>
              <h3>Order Review</h3>
            </div>
            <div className="checkoutCardBody">
              {/* Address summary */}
              {selectedAddressIndex !== null && savedAddresses[selectedAddressIndex] && (
                <div style={{ marginBottom: 16, padding: 14, background: "var(--border-light)", borderRadius: "var(--radius)" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4 }}>📍 Shipping To</p>
                  <p style={{ fontSize: 13, fontWeight: 700 }}>{savedAddresses[selectedAddressIndex].fullName}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {savedAddresses[selectedAddressIndex].streetName} {savedAddresses[selectedAddressIndex].buildingNumber},&nbsp;
                    {savedAddresses[selectedAddressIndex].city || savedAddresses[selectedAddressIndex].town || ""}, {userCountry}
                  </p>
                </div>
              )}

              {/* Items summary */}
              <div className="orderSummaryItems">
                {selectedItems.map(item => (
                  <div className="orderSummaryItem" key={item.productId}>
                    <div className="orderSummaryItemImg">
                      <ProductImage image={item.product.image} name={item.product.name} />
                    </div>
                    <div className="orderSummaryItemName">{item.product.name}</div>
                    <div className="orderSummaryItemQty">x{item.quantity}</div>
                    <div className="orderSummaryItemPrice">{formatCurrency(item.product.price * item.quantity, userCountry)}</div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="orderTotals">
                <div className="orderTotalRow"><span>Subtotal</span><span>{formatCurrency(selectedTotal, userCountry)}</span></div>
                <div className="orderTotalRow"><span>Shipping</span><span style={{ color: "var(--success)" }}>Free</span></div>
                <div className="orderTotalRow"><span>Payment Method</span><span>{paymentMethod}</span></div>
                <div className="orderTotalRow grand"><span>Total</span><span>{formatCurrency(selectedTotal, userCountry)}</span></div>
              </div>

              <div className="checkoutActions">
                <button className="primaryBtn" onClick={handlePlaceOrder} disabled={isPlacingOrder}>
                  {isPlacingOrder ? "Placing Order..." : `Place Order — ${formatCurrency(selectedTotal, userCountry)}`}
                </button>
                <button className="ghostBtn" onClick={() => setCheckoutStep("payment")}>← Back</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── ADDRESS BOOK ──────────────────────────────────────────
  const renderAddressPage = () => (
    <div className="pageAddress" style={{ paddingTop: 16 }}>
      <div className="surface">
        <div className="surfaceHead">
          <div>
            <div className="surfaceTitle">Address Book</div>
            <div className="surfaceSub">Manage your shipping addresses</div>
          </div>
        </div>
        <div className="surfaceBody">
          {savedAddresses.length > 0 && (
            <div className="addressList">
              {savedAddresses.map((addr, idx) => (
                <div key={idx} className={`addressOptionCard${selectedAddressIndex === idx ? " selected" : ""}`}
                  onClick={() => setSelectedAddressIndex(idx)}>
                  <input type="radio" name="addrPage" readOnly checked={selectedAddressIndex === idx} />
                  <div className="addressOptionBody">
                    <div className="addressOptionName">{addr.fullName}</div>
                    <div className="addressOptionDetail">
                      {addr.streetName} {addr.buildingNumber}, {addr.city || addr.town || addr.village}<br />
                      {addr.province ? `${addr.province}, ` : ""}{addr.country || userCountry}<br />
                      {addr.phoneNumber}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button className="addAddressBtn" onClick={() => setShowAddAddress(true)}>+ Add New Address</button>
          {showAddAddress && (
            <form onSubmit={handleSaveAddress}>
              <div className="formRow">
                <div className="formGroup">
                  <label>Full Name</label>
                  <input className="formInput" required placeholder="Full name" value={addressForm.fullName} onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })} />
                </div>
                <div className="formGroup">
                  <label>Phone Number</label>
                  <input className="formInput" required placeholder={`${countries[userCountry]?.code}xxxxxxxx`} value={addressForm.phoneNumber} onChange={e => setAddressForm({ ...addressForm, phoneNumber: e.target.value })} />
                </div>
              </div>
              <div className="formRow full">
                <div className="formGroup">
                  <label>ID Number</label>
                  <input className="formInput" required placeholder="National ID or foreigner ID" value={addressForm.identityNumber} onChange={e => setAddressForm({ ...addressForm, identityNumber: e.target.value })} />
                </div>
              </div>
              {countries[userCountry]?.addressFields.includes("province") && (
                <div className="formRow full"><div className="formGroup"><label>Province</label><input className="formInput" required placeholder="Province" value={addressForm.province} onChange={e => setAddressForm({ ...addressForm, province: e.target.value })} /></div></div>
              )}
              <div className="formRow">
                {countries[userCountry]?.addressFields.includes("town") && (
                  <div className="formGroup"><label>Town</label><input className="formInput" required placeholder="Town" value={addressForm.town} onChange={e => setAddressForm({ ...addressForm, town: e.target.value })} /></div>
                )}
                {countries[userCountry]?.addressFields.includes("city") && (
                  <div className="formGroup"><label>City</label><input className="formInput" required placeholder="City" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} /></div>
                )}
                {countries[userCountry]?.addressFields.includes("village") && (
                  <div className="formGroup"><label>Village</label><input className="formInput" placeholder="Village" value={addressForm.village} onChange={e => setAddressForm({ ...addressForm, village: e.target.value })} /></div>
                )}
              </div>
              <div className="formRow">
                <div className="formGroup"><label>Street Name</label><input className="formInput" required placeholder="Street name" value={addressForm.streetName} onChange={e => setAddressForm({ ...addressForm, streetName: e.target.value })} /></div>
                <div className="formGroup"><label>Building Number</label><input className="formInput" required placeholder="Building no." value={addressForm.buildingNumber} onChange={e => setAddressForm({ ...addressForm, buildingNumber: e.target.value })} /></div>
              </div>
              <div className="checkoutActions">
                <button type="submit" className="primaryBtn">Save Address</button>
                <button type="button" className="ghostBtn" onClick={() => setShowAddAddress(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  // ── ORDERS ────────────────────────────────────────────────
  const renderOrders = () => (
    <div className="pageOrders" style={{ paddingTop: 16 }}>
      {!session ? (
        <div className="authCard">
          <div style={{ padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Sign in to view orders</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>Your order history will appear here</p>
            <button className="primaryBtn" style={{ maxWidth: 200, margin: "0 auto" }} onClick={() => setActiveView("account")}>Sign In</button>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="noOrders">
          <div className="emptyIcon">📦</div>
          <h3>No orders yet</h3>
          <p>Your order history will appear here after you place an order</p>
        </div>
      ) : (
        orders.map(order => {
          const stepIdx = statusSteps.indexOf(order.status);
          return (
            <div className="orderCard" key={order.id}>
              <div className="orderCardHead">
                <div>
                  <div className="orderId">Order #{order.id}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <span className={`orderStatus ${order.status}`}>{order.status}</span>
              </div>
              <div className="orderCardBody">
                <div className="orderTotal">{formatCurrency(order.total, userCountry)}</div>
                <div className="orderDetail" style={{ marginTop: 8 }}>
                  {order.items?.length || "?"} items · {order.paymentMethod || "N/A"}
                </div>
                {/* Mini timeline */}
                <div style={{ display: "flex", gap: 4, marginTop: 12 }}>
                  {statusSteps.map((s, i) => (
                    <div key={s} title={s} style={{
                      flex: 1, height: 4, borderRadius: 4,
                      background: i <= stepIdx ? "var(--primary)" : "var(--border)",
                      transition: "background 0.3s",
                    }} />
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{order.status}</div>
              </div>
              <div className="orderCardFoot">
                <button className="orderBtnGhost" onClick={() => setViewingOrder(order)}>View Details</button>
                <button className="orderBtn" onClick={() => setTrackingOrder(order)}>Track Order</button>
              </div>
            </div>
          );
        })
      )}

      {/* Order Detail Modal */}
      {viewingOrder && (
        <div className="modalOverlay" onClick={e => { if (e.target === e.currentTarget) setViewingOrder(null); }}>
          <div className="orderDetailModal">
            <div className="orderDetailHead">
              <h3>Order Details</h3>
              <button className="closeBtn" onClick={() => setViewingOrder(null)}>✕</button>
            </div>
            <div className="orderDetailBody">
              <div style={{ padding: "8px 12px", background: "var(--primary-bg)", borderRadius: "var(--radius)", marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Order ID</p>
                <p style={{ fontSize: 14, fontWeight: 700 }}>{viewingOrder.id}</p>
              </div>
              <div className="orderSummaryItems">
                {viewingOrder.items?.map((item, i) => (
                  <div className="orderSummaryItem" key={i}>
                    <div className="orderSummaryItemImg">
                      <ProductImage image={item.product?.image} name={item.product?.name} />
                    </div>
                    <div className="orderSummaryItemName">{item.product?.name || "Product"}</div>
                    <div className="orderSummaryItemQty">x{item.quantity}</div>
                    <div className="orderSummaryItemPrice">{formatCurrency((item.product?.price || 0) * item.quantity, userCountry)}</div>
                  </div>
                ))}
              </div>
              <div className="orderTotals">
                <div className="orderTotalRow"><span>Subtotal</span><span>{formatCurrency(viewingOrder.total, userCountry)}</span></div>
                <div className="orderTotalRow"><span>Shipping</span><span style={{ color: "var(--success)" }}>Free</span></div>
                <div className="orderTotalRow"><span>Payment</span><span>{viewingOrder.paymentMethod || "N/A"}</span></div>
                <div className="orderTotalRow grand"><span>Total</span><span>{formatCurrency(viewingOrder.total, userCountry)}</span></div>
              </div>
              {viewingOrder.shippingAddress && (
                <div style={{ marginTop: 14, padding: 12, background: "var(--border-light)", borderRadius: "var(--radius)" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text-secondary)" }}>📍 Delivery Address</p>
                  <p style={{ fontSize: 13, fontWeight: 700 }}>{viewingOrder.shippingAddress.fullName}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {viewingOrder.shippingAddress.streetName} {viewingOrder.shippingAddress.buildingNumber},&nbsp;
                    {viewingOrder.shippingAddress.city || viewingOrder.shippingAddress.town || ""}, {viewingOrder.shippingAddress.country}
                  </p>
                </div>
              )}
              <button className="primaryBtn" style={{ marginTop: 16 }} onClick={() => { setViewingOrder(null); setTrackingOrder(viewingOrder); }}>
                📍 Track This Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Track Order Modal */}
      {trackingOrder && (
        <div className="modalOverlay" onClick={e => { if (e.target === e.currentTarget) setTrackingOrder(null); }}>
          <div className="orderDetailModal">
            <div className="orderDetailHead">
              <h3>Track Order</h3>
              <button className="closeBtn" onClick={() => setTrackingOrder(null)}>✕</button>
            </div>
            <div className="orderDetailBody">
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                Order #{trackingOrder.id} · {formatCurrency(trackingOrder.total, userCountry)}
              </p>
              <div className="timeline">
                {(trackingOrder.timeline || statusSteps.slice(0, statusSteps.indexOf(trackingOrder.status) + 1).map((s, i) => ({ status: s, at: new Date(Date.now() - (statusSteps.indexOf(trackingOrder.status) - i) * 86400000) }))).map((step, i, arr) => (
                  <div className="timelineStep" key={i}>
                    <div className={`timelineDot ${i < arr.length - 1 ? "done" : "active"}`}>
                      {i < arr.length - 1 ? "✓" : i + 1}
                    </div>
                    <div className="timelineContent">
                      <div className="timelineStepName">{step.status}</div>
                      <div className="timelineStepTime">{new Date(step.at).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
                {/* Pending steps (grayed out) */}
                {statusSteps.slice(statusSteps.indexOf(trackingOrder.status) + 1).map((s, i) => (
                  <div className="timelineStep" key={`pending-${i}`}>
                    <div className="timelineDot">{statusSteps.indexOf(trackingOrder.status) + 2 + i}</div>
                    <div className="timelineContent">
                      <div className="timelineStepName" style={{ color: "var(--text-muted)" }}>{s}</div>
                      <div className="timelineStepTime">Pending</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "12px 14px", background: "var(--primary-bg)", borderRadius: "var(--radius)", marginTop: 16, fontSize: 12, color: "var(--text-secondary)" }}>
                ℹ️ Tracking is updated by our team. You'll be notified when your order status changes.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── ADMIN ─────────────────────────────────────────────────
  const renderAdmin = () => (
    <div className="pageAdmin" style={{ padding: 12 }}>
      {!session || session.user.role !== "admin" ? (
        <div className="surface">
          <div className="adminLock">
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
            <h2>Admin Access Only</h2>
            <p>You need an administrator account to access this dashboard.</p>
            <button className="primaryBtn" style={{ maxWidth: 200, margin: "0 auto" }} onClick={() => setActiveView("account")}>Sign In</button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ padding: "16px 0", marginBottom: 12 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900 }}>Admin Dashboard</h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Welcome back, {session.user.name}</p>
          </div>
          {adminData && (
            <>
              <div className="adminMetrics">
                {[
                  { label: "Revenue", value: formatCurrency(adminData.metrics.revenue, userCountry), icon: "💰" },
                  { label: "Orders", value: adminData.metrics.orders, icon: "📦" },
                  { label: "Customers", value: adminData.metrics.users, icon: "👥" },
                  { label: "Products", value: adminData.metrics.products, icon: "📱" },
                ].map(m => (
                  <div className="metricCard" key={m.label}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{m.icon}</div>
                    <span>{m.label}</span>
                    <strong>{m.value}</strong>
                  </div>
                ))}
              </div>
              <div className="adminGrid">
                {/* Add product */}
                <div className="surface">
                  <div className="surfaceHead"><span className="surfaceTitle">Add Product</span></div>
                  <form className="surfaceBody" onSubmit={handleCreateProduct}>
                    {[
                      { key: "name", placeholder: "Product name", label: "Name" },
                      { key: "brand", placeholder: "Brand", label: "Brand" },
                      { key: "price", placeholder: "Price", label: "Price" },
                      { key: "stock", placeholder: "Stock quantity", label: "Stock" },
                    ].map(f => (
                      <div className="inputGroup" key={f.key}>
                        <label>{f.label}</label>
                        <input className="inputField" placeholder={f.placeholder} value={productForm[f.key]} onChange={e => setProductForm({ ...productForm, [f.key]: e.target.value })} />
                      </div>
                    ))}
                    <div className="inputGroup">
                      <label>Category</label>
                      <select className="inputSelect" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="inputGroup">
                      <label>Description</label>
                      <textarea className="inputField" rows={3} placeholder="Product description" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} />
                    </div>
                    <div className="inputGroup">
                      <label>Image Path</label>
                      <input className="inputField" placeholder="/assets/products/images/product.jpg" value={productForm.image} onChange={e => setProductForm({ ...productForm, image: e.target.value })} />
                    </div>
                    <button type="submit" className="primaryBtn">Create Product</button>
                  </form>
                </div>
                {/* Recent orders */}
                <div className="surface">
                  <div className="surfaceHead"><span className="surfaceTitle">Recent Orders</span><span style={{ fontSize: 12, color: "var(--text-muted)" }}>{adminData.recentOrders.length} orders</span></div>
                  <div className="surfaceBody">
                    {adminData.recentOrders.map(order => (
                      <div className="adminOrderRow" key={order.id}>
                        <div>
                          <strong>{order.id}</strong>
                          <span>{order.customerName}</span>
                          <span style={{ marginLeft: 6 }}>{formatCurrency(order.total, userCountry)}</span>
                        </div>
                        <div className="adminRowBtns">
                          <button className="adminBtn" onClick={() => handleAdvanceOrder(order.id, "Shipped")}>Ship</button>
                          <button className="adminBtnGhost" onClick={() => handleAdvanceOrder(order.id, "Delivered")}>Deliver</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );

  // ── ORDER SUCCESS MODAL ───────────────────────────────────
  const renderSuccessModal = () => (
    <div className="modalOverlay">
      <div className="successModal">
        <div className="successIcon">✅</div>
        <h2>Payment Successful!</h2>
        <p>Your order has been confirmed and is being processed. You'll receive updates as your order ships.</p>
        {placedOrder && (
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
            Order #{placedOrder.id} · {formatCurrency(placedOrder.total, userCountry)}
          </p>
        )}
        <div className="successBtns">
          <button className="primaryBtn" onClick={() => {
            setShowSuccess(false);
            setActiveView("orders");
          }}>
            📦 Track My Order
          </button>
          <button className="ghostBtn" style={{ width: "100%" }} onClick={() => {
            setShowSuccess(false);
            setActiveView("store");
          }}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="appShell">
      {renderHeader()}

      {activeView === "store"    && renderStore()}
      {activeView === "account"  && renderAccount()}
      {activeView === "cart"     && renderCart()}
      {activeView === "checkout" && renderCheckout()}
      {activeView === "address"  && renderAddressPage()}
      {activeView === "orders"   && renderOrders()}
      {activeView === "admin"    && renderAdmin()}

      {showSuccess && renderSuccessModal()}
      {showToast && <div className="statusToast">{statusMsg}</div>}
    </div>
  );
}

export default App;
