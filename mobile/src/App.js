import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { api, resolveImageUrl } from "./services/api";

const amount = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

const formatCurrency = (value) => `M${amount.format(Number(value) || 0)}`;

const serviceCards = [
  { id: "shipping", icon: "=>", label: "Free Shipping" },
  { id: "support", icon: "O", label: "24/7 Support" },
  { id: "payments", icon: "<>", label: "Secure Payments" }
];

const bottomTabs = [
  { id: "home", icon: "^", label: "Home" },
  { id: "shop", icon: "~", label: "Shop" },
  { id: "cart", icon: "U", label: "Cart" },
  { id: "profile", icon: "O", label: "Profile" }
];

function ProductCard({ product, onAddToCart }) {
  return (
    <View style={styles.productCard}>
      <Image source={{ uri: resolveImageUrl(product.image) }} style={styles.productImage} />
      <Text numberOfLines={2} style={styles.productName}>
        {product.name}
      </Text>
      <View style={styles.productMeta}>
        <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
        <Text numberOfLines={1} style={styles.productRating}>★★★★★ (128)</Text>
      </View>
      <Pressable style={styles.addToCartButton} onPress={() => onAddToCart(product.id)}>
        <Text style={styles.addToCartText}>Add to Cart</Text>
      </Pressable>
    </View>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [orders, setOrders] = useState([]);
  const [session, setSession] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Ready");

  const loadProducts = async () => {
    const data = await api(`/products?search=${encodeURIComponent(search)}`);
    setProducts(data.items);
  };

  const refreshSecureData = async (token) => {
    const [cartData, orderData] = await Promise.all([
      api("/cart", { headers: { "x-user-id": token } }),
      api("/orders", { headers: { "x-user-id": token } })
    ]);
    setCart(cartData);
    setOrders(orderData);
  };

  useEffect(() => {
    loadProducts().catch((error) => setStatus(error.message));
  }, [search]);

  const handleLogin = async () => {
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "alice@example.com", password: "Password123!" })
      });
      setSession(data);
      await refreshSecureData(data.token);
      setStatus(`Welcome ${data.user.name}`);
      return data;
    } catch (error) {
      setStatus(error.message);
      return null;
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const loginSession = session ?? (await handleLogin());
      if (!loginSession) {
        return;
      }

      await api("/cart", {
        method: "POST",
        headers: { "x-user-id": loginSession.token },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      await refreshSecureData(loginSession.token);
      setStatus("Added to cart");
    } catch (error) {
      setStatus(error.message);
    }
  };

  const topCategoryProducts = useMemo(() => products.slice(0, 4), [products]);
  const featuredProducts = useMemo(() => products.slice(0, 4), [products]);
  const heroProduct = featuredProducts[0];

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.topBar}>
            <Text style={styles.menuIcon}>|||</Text>
            <View style={styles.logoWrap}>
              <View style={styles.logoMarkBox}>
                <Text style={styles.logoMark}>D</Text>
              </View>
              <View>
                <Text style={styles.logoText}>DATAMAK</Text>
                <Text style={styles.logoSubtext}>IT SOLUTIONS</Text>
              </View>
            </View>
            <View style={styles.topIcons}>
              <View style={styles.cartBadgeWrap}>
                <Text style={styles.topIcon}>U</Text>
                <View style={styles.badge} />
              </View>
              <Text style={styles.topIcon}>O</Text>
            </View>
          </View>

          <View style={styles.searchRow}>
            <Text style={styles.menuIcon}>|||</Text>
            <View style={styles.searchBox}>
              <Text style={styles.searchHintIcon}>Q</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search products..."
                placeholderTextColor="#8a8e98"
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <Pressable style={styles.searchButton}>
              <Text style={styles.searchButtonIcon}>Q</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroLight} />
          <View style={styles.heroCircleLarge} />
          <View style={styles.heroCircleSmall} />
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Power Up Your World</Text>
            <Text numberOfLines={2} style={styles.heroText}>
              High performance computers, ICT products...
            </Text>
            <Pressable style={styles.heroButton}>
              <Text style={styles.heroButtonText}>Shop Now</Text>
            </Pressable>
          </View>
          {heroProduct ? <Image source={{ uri: resolveImageUrl(heroProduct.image) }} style={styles.heroImage} /> : null}
        </View>

        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Categories</Text>
            <Text style={styles.viewAll}>View All</Text>
          </View>
          <View style={styles.grid}>
            {topCategoryProducts.map((product) => (
              <ProductCard key={`top-${product.id}`} product={product} onAddToCart={handleAddToCart} />
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <Text style={styles.viewAll}>View All</Text>
          </View>
          <View style={styles.grid}>
            {featuredProducts.map((product) => (
              <ProductCard key={`featured-${product.id}`} product={product} onAddToCart={handleAddToCart} />
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Services</Text>
            <Text style={styles.viewAll}>View All</Text>
          </View>

          <View style={styles.servicePrimary}>
            <Text style={styles.serviceIcon}>{serviceCards[0].icon}</Text>
            <Text style={styles.serviceText}>{serviceCards[0].label}</Text>
          </View>

          <View style={styles.serviceRow}>
            <View style={styles.serviceHalf}>
              <Text style={styles.serviceIcon}>{serviceCards[1].icon}</Text>
              <Text style={styles.serviceText}>{serviceCards[1].label}</Text>
            </View>
            <View style={styles.serviceHalf}>
              <Text style={styles.serviceIcon}>{serviceCards[2].icon}</Text>
              <Text style={styles.serviceText}>{serviceCards[2].label}</Text>
            </View>
          </View>

          <View style={styles.statusStrip}>
            <Text numberOfLines={1} style={styles.statusText}>{status}</Text>
            <Text style={styles.statusMeta}>{cart.items.length} cart • {orders.length} orders</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        {bottomTabs.map((tab, index) => (
          <View key={tab.id} style={styles.bottomNavItem}>
            <Text style={[styles.bottomNavIcon, index === 0 ? styles.bottomNavIconActive : null]}>{tab.icon}</Text>
            <Text style={[styles.bottomNavText, index === 0 ? styles.bottomNavTextActive : null]}>{tab.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#4ba1ef"
  },
  scrollContent: {
    paddingBottom: 86
  },
  header: {
    backgroundColor: "#11233d"
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 46,
    paddingBottom: 13,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.12)"
  },
  menuIcon: {
    width: 24,
    color: "white",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -1
  },
  logoWrap: {
    flexDirection: "row",
    alignItems: "center"
  },
  logoMarkBox: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8
  },
  logoMark: {
    color: "white",
    fontSize: 22,
    fontWeight: "900"
  },
  logoText: {
    color: "white",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.4
  },
  logoSubtext: {
    color: "#d1dae5",
    fontSize: 10,
    letterSpacing: 2
  },
  topIcons: {
    flexDirection: "row",
    alignItems: "center"
  },
  cartBadgeWrap: {
    position: "relative",
    marginRight: 12
  },
  topIcon: {
    color: "white",
    fontSize: 21,
    fontWeight: "700"
  },
  badge: {
    position: "absolute",
    top: 1,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 99,
    backgroundColor: "#f34e4f"
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 13
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    marginHorizontal: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#f8f7f5"
  },
  searchHintIcon: {
    color: "#a1a5ac",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    color: "#28354a",
    fontSize: 14
  },
  searchButton: {
    width: 43,
    height: 43,
    borderRadius: 6,
    backgroundColor: "#3566ff",
    alignItems: "center",
    justifyContent: "center"
  },
  searchButtonIcon: {
    color: "white",
    fontSize: 17,
    fontWeight: "900"
  },
  hero: {
    position: "relative",
    flexDirection: "row",
    minHeight: 186,
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: "#388ff3",
    overflow: "hidden"
  },
  heroLight: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "52%",
    backgroundColor: "#49a5f7"
  },
  heroCircleLarge: {
    position: "absolute",
    right: 38,
    top: 22,
    width: 96,
    height: 96,
    borderRadius: 99,
    backgroundColor: "rgba(100, 158, 255, 0.35)"
  },
  heroCircleSmall: {
    position: "absolute",
    right: 16,
    bottom: 22,
    width: 118,
    height: 54,
    borderRadius: 99,
    backgroundColor: "rgba(73, 116, 255, 0.55)"
  },
  heroCopy: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 10
  },
  heroTitle: {
    color: "white",
    fontSize: 30,
    lineHeight: 35,
    fontWeight: "900",
    marginBottom: 8
  },
  heroText: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14
  },
  heroButton: {
    alignSelf: "flex-start",
    backgroundColor: "#4568ff",
    borderRadius: 5,
    paddingHorizontal: 14,
    paddingVertical: 9
  },
  heroButtonText: {
    color: "white",
    fontSize: 13,
    fontWeight: "900"
  },
  heroImage: {
    width: 150,
    height: 110,
    resizeMode: "contain",
    alignSelf: "center"
  },
  content: {
    backgroundColor: "#eef3f8",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 12
  },
  sectionTitle: {
    color: "#1d3050",
    fontSize: 22,
    fontWeight: "900"
  },
  viewAll: {
    color: "#2f63ff",
    fontSize: 12,
    textDecorationLine: "underline"
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2
  },
  productCard: {
    width: "23%",
    backgroundColor: "white",
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#9eb2ca",
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  productImage: {
    width: 52,
    height: 42,
    resizeMode: "contain",
    marginBottom: 10
  },
  productName: {
    minHeight: 27,
    alignSelf: "stretch",
    color: "#273a56",
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 7
  },
  productMeta: {
    alignSelf: "stretch",
    marginBottom: 9
  },
  productPrice: {
    color: "#ff5339",
    fontSize: 10,
    fontWeight: "900",
    marginBottom: 2
  },
  productRating: {
    color: "#7184a1",
    fontSize: 8
  },
  addToCartButton: {
    backgroundColor: "#4a76ff",
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 7
  },
  addToCartText: {
    color: "white",
    fontSize: 9,
    fontWeight: "800"
  },
  servicePrimary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3f88f4",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 12
  },
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  serviceHalf: {
    width: "48.8%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4269f6",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 13
  },
  serviceIcon: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
    marginRight: 11
  },
  serviceText: {
    color: "white",
    fontSize: 15,
    fontWeight: "900"
  },
  statusStrip: {
    marginTop: 12
  },
  statusText: {
    color: "#4f6585",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2
  },
  statusMeta: {
    color: "#7086a4",
    fontSize: 10
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#11233d",
    paddingTop: 8,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)"
  },
  bottomNavItem: {
    alignItems: "center"
  },
  bottomNavIcon: {
    color: "#edf2f8",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 3
  },
  bottomNavIconActive: {
    color: "white"
  },
  bottomNavText: {
    color: "#dbe3ec",
    fontSize: 11
  },
  bottomNavTextActive: {
    color: "white"
  }
});

export default App;
