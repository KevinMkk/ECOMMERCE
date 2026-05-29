export const productCategories = ["Smartphones", "Laptops", "Accessories", "Home Electronics", "Gaming", "Cameras"];

export const products = [
  // SMARTPHONES
  { id: "p-2001", name: "iPhone 15 Pro Max (256GB)", category: "Smartphones", brand: "Apple", price: 28999, stock: 15, rating: 4.8, description: "Premium flagship smartphone with advanced camera system.", image: "/assets/products/images/iPhone15ProMax.jpg" },
  { id: "p-2002", name: "Samsung Galaxy S24 Ultra", category: "Smartphones", brand: "Samsung", price: 26999, stock: 12, rating: 4.7, description: "Cutting-edge Android flagship with exceptional display.", image: "/assets/products/images/GalaxyS24Ultra.jpg" },
  { id: "p-2003", name: "Google Pixel 8 Pro", category: "Smartphones", brand: "Google", price: 21999, stock: 10, rating: 4.6, description: "AI-powered smartphone with computational photography.", image: "/assets/products/images/Pixel8Pro.jpg" },
  { id: "p-2004", name: "OnePlus 12", category: "Smartphones", brand: "OnePlus", price: 18999, stock: 20, rating: 4.5, description: "Fast and smooth performance with clean software.", image: "/assets/products/images/OnePlus12.jpg" },
  { id: "p-2005", name: "Xiaomi 14 Pro", category: "Smartphones", brand: "Xiaomi", price: 17999, stock: 18, rating: 4.5, description: "Flagship killer with excellent camera setup.", image: "/assets/products/images/Xiaomi14Pro.jpg" },
  { id: "p-2006", name: "Huawei P60 Pro", category: "Smartphones", brand: "Huawei", price: 19999, stock: 14, rating: 4.6, description: "Premium Chinese flagship with innovative features.", image: "/assets/products/images/HuaweiP60Pro.jpg" },
  { id: "p-2007", name: "Nothing Phone (2)", category: "Smartphones", brand: "Nothing", price: 15999, stock: 16, rating: 4.4, description: "Unique design with transparent back and glyph interface.", image: "/assets/products/images/NothingPhone2.jpg" },
  { id: "p-2008", name: "Samsung Galaxy A54", category: "Smartphones", brand: "Samsung", price: 9999, stock: 30, rating: 4.3, description: "Mid-range smartphone with good value for money.", image: "/assets/products/images/GalaxyA54.jpg" },
  { id: "p-2009", name: "iPhone SE (2023)", category: "Smartphones", brand: "Apple", price: 11999, stock: 25, rating: 4.4, description: "Affordable iPhone with classic design.", image: "/assets/products/images/iPhoneSE.jpg" },
  { id: "p-2010", name: "Redmi Note 13 Pro", category: "Smartphones", brand: "Xiaomi", price: 7999, stock: 35, rating: 4.2, description: "Budget-friendly smartphone with decent specs.", image: "/assets/products/images/RedmiNote13.jpg" },

  // LAPTOPS
  { id: "p-3001", name: "MacBook Pro M3 (14-inch)", category: "Laptops", brand: "Apple", price: 42999, stock: 8, rating: 4.9, description: "Professional laptop with powerful M3 chip.", image: "/assets/products/images/MacBookProM3.jpg" },
  { id: "p-3002", name: "Dell XPS 15", category: "Laptops", brand: "Dell", price: 38999, stock: 10, rating: 4.8, description: "Ultrabook with stunning InfinityEdge display.", image: "/assets/products/images/DellXPS15.jpg" },
  { id: "p-3003", name: "HP Spectre x360", category: "Laptops", brand: "HP", price: 34999, stock: 12, rating: 4.7, description: "Convertible laptop with premium build quality.", image: "/assets/products/images/HPSpectre.jpg" },
  { id: "p-3004", name: "Lenovo ThinkPad X1 Carbon", category: "Laptops", brand: "Lenovo", price: 36999, stock: 11, rating: 4.8, description: "Business laptop with legendary durability.", image: "/assets/products/images/ThinkPadX1.jpg" },
  { id: "p-3005", name: "Asus ROG Zephyrus G14", category: "Laptops", brand: "Asus", price: 31999, stock: 9, rating: 4.7, description: "Gaming laptop with RTX graphics and portability.", image: "/assets/products/images/ROGZephyrus.jpg" },
  { id: "p-3006", name: "Acer Predator Helios 300", category: "Laptops", brand: "Acer", price: 27999, stock: 13, rating: 4.6, description: "Gaming laptop with excellent cooling system.", image: "/assets/products/images/PredatorHelios.jpg" },
  { id: "p-3007", name: "MacBook Air M2", category: "Laptops", brand: "Apple", price: 28999, stock: 10, rating: 4.8, description: "Thin and light laptop with M2 power.", image: "/assets/products/images/MacBookAirM2.jpg" },
  { id: "p-3008", name: "Lenovo IdeaPad 5", category: "Laptops", brand: "Lenovo", price: 18999, stock: 20, rating: 4.4, description: "Affordable laptop for everyday computing.", image: "/assets/products/images/IdeaPad5.jpg" },
  { id: "p-3009", name: "HP Pavilion 15", category: "Laptops", brand: "HP", price: 15999, stock: 22, rating: 4.3, description: "Budget-friendly laptop with solid performance.", image: "/assets/products/images/HPPavilion.jpg" },
  { id: "p-3010", name: "Asus VivoBook 14", category: "Laptops", brand: "Asus", price: 13999, stock: 24, rating: 4.2, description: "Lightweight laptop perfect for students.", image: "/assets/products/images/VivoBook14.jpg" },

  // ACCESSORIES
  { id: "p-4001", name: "AirPods Pro (2nd Gen)", category: "Accessories", brand: "Apple", price: 5999, stock: 40, rating: 4.8, description: "Premium wireless earbuds with active noise cancellation.", image: "/assets/products/images/AirPodsPro.jpg" },
  { id: "p-4002", name: "Samsung Galaxy Buds2 Pro", category: "Accessories", brand: "Samsung", price: 4999, stock: 35, rating: 4.7, description: "Feature-rich wireless earbuds with great sound.", image: "/assets/products/images/GalaxyBuds2.jpg" },
  { id: "p-4003", name: "Sony WH-1000XM5 Headphones", category: "Accessories", brand: "Sony", price: 7999, stock: 20, rating: 4.9, description: "Industry-leading noise cancelling headphones.", image: "/assets/products/images/SonyXM5.jpg" },
  { id: "p-4004", name: "Anker Power Bank (20000mAh)", category: "Accessories", brand: "Anker", price: 1499, stock: 60, rating: 4.5, description: "High-capacity power bank for extended battery life.", image: "/assets/products/images/AnkerPowerBank.jpg" },
  { id: "p-4005", name: "Logitech MX Master 3 Mouse", category: "Accessories", brand: "Logitech", price: 2499, stock: 30, rating: 4.7, description: "Professional mouse with advanced features.", image: "/assets/products/images/MXMaster3.jpg" },
  { id: "p-4006", name: "Apple Magic Keyboard", category: "Accessories", brand: "Apple", price: 2999, stock: 25, rating: 4.6, description: "Premium wireless keyboard with rechargeable battery.", image: "/assets/products/images/MagicKeyboard.jpg" },
  { id: "p-4007", name: "USB-C Hub Multiport Adapter", category: "Accessories", brand: "Generic", price: 899, stock: 50, rating: 4.3, description: "Compact hub with multiple connectivity options.", image: "/assets/products/images/USBCAdapter.jpg" },
  { id: "p-4008", name: "Portable SSD (1TB)", category: "Accessories", brand: "Samsung", price: 1999, stock: 35, rating: 4.8, description: "Fast external storage with USB-C connection.", image: "/assets/products/images/PortableSSD.jpg" },
  { id: "p-4009", name: "Wireless Charger Pad", category: "Accessories", brand: "Generic", price: 799, stock: 55, rating: 4.4, description: "Fast wireless charging pad for compatible devices.", image: "/assets/products/images/WirelessCharger.jpg" },
  { id: "p-4010", name: "Phone Tripod Stand", category: "Accessories", brand: "Generic", price: 499, stock: 70, rating: 4.2, description: "Adjustable tripod stand for phones and cameras.", image: "/assets/products/images/TripodStand.jpg" },

  // HOME ELECTRONICS
  { id: "p-5001", name: "Samsung 55\" 4K Smart TV", category: "Home Electronics", brand: "Samsung", price: 14999, stock: 8, rating: 4.7, description: "55-inch 4K smart TV with excellent picture quality.", image: "/assets/products/images/SamsungTV55.jpg" },
  { id: "p-5002", name: "LG OLED 65\" TV", category: "Home Electronics", brand: "LG", price: 32999, stock: 5, rating: 4.9, description: "Premium 65-inch OLED TV with stunning colors.", image: "/assets/products/images/LGOLED65.jpg" },
  { id: "p-5003", name: "Sony Soundbar HT-S400", category: "Home Electronics", brand: "Sony", price: 6999, stock: 15, rating: 4.6, description: "Compact soundbar with Dolby Atmos support.", image: "/assets/products/images/SonySoundbar.jpg" },
  { id: "p-5004", name: "Hisense 43\" Smart TV", category: "Home Electronics", brand: "Hisense", price: 8999, stock: 12, rating: 4.5, description: "Budget-friendly 43-inch smart TV.", image: "/assets/products/images/Hisense43.jpg" },
  { id: "p-5005", name: "JBL PartyBox Speaker", category: "Home Electronics", brand: "JBL", price: 7999, stock: 10, rating: 4.6, description: "Powerful wireless speaker for parties.", image: "/assets/products/images/JBLPartyBox.jpg" },
  { id: "p-5006", name: "Amazon Echo Dot (5th Gen)", category: "Home Electronics", brand: "Amazon", price: 1499, stock: 50, rating: 4.4, description: "Smart speaker with Alexa assistant.", image: "/assets/products/images/EchoDot.jpg" },
  { id: "p-5007", name: "Google Nest Hub", category: "Home Electronics", brand: "Google", price: 2499, stock: 40, rating: 4.5, description: "Smart display with Google Assistant.", image: "/assets/products/images/NestHub.jpg" },
  { id: "p-5008", name: "Philips Air Fryer XL", category: "Home Electronics", brand: "Philips", price: 2999, stock: 20, rating: 4.7, description: "Large capacity air fryer for healthy cooking.", image: "/assets/products/images/AirFryer.jpg" },
  { id: "p-5009", name: "Dyson V11 Vacuum", category: "Home Electronics", brand: "Dyson", price: 9999, stock: 12, rating: 4.8, description: "Cordless vacuum with intelligent filtration.", image: "/assets/products/images/DysonV11.jpg" },
  { id: "p-5010", name: "Smart LED Light Kit", category: "Home Electronics", brand: "Generic", price: 999, stock: 60, rating: 4.3, description: "Smart lighting system with WiFi control.", image: "/assets/products/images/SmartLED.jpg" },

  // GAMING
  { id: "p-6001", name: "PlayStation 5 Console", category: "Gaming", brand: "Sony", price: 13999, stock: 7, rating: 4.9, description: "Next-gen gaming console with ultra-fast SSD.", image: "/assets/products/images/PS5.jpg" },
  { id: "p-6002", name: "Xbox Series X", category: "Gaming", brand: "Microsoft", price: 12999, stock: 8, rating: 4.8, description: "Powerful gaming console with Game Pass.", image: "/assets/products/images/XboxSeriesX.jpg" },
  { id: "p-6003", name: "Nintendo Switch OLED", category: "Gaming", brand: "Nintendo", price: 8999, stock: 15, rating: 4.6, description: "Hybrid gaming console with OLED screen.", image: "/assets/products/images/SwitchOLED.jpg" },
  { id: "p-6004", name: "DualSense Wireless Controller", category: "Gaming", brand: "Sony", price: 1999, stock: 25, rating: 4.7, description: "PS5 controller with haptic feedback.", image: "/assets/products/images/DualSense.jpg" },
  { id: "p-6005", name: "Xbox Wireless Controller", category: "Gaming", brand: "Microsoft", price: 1899, stock: 28, rating: 4.6, description: "Xbox Series X controller with quick resume.", image: "/assets/products/images/XboxController.jpg" },
  { id: "p-6006", name: "Gaming Headset RGB", category: "Gaming", brand: "Generic", price: 1499, stock: 30, rating: 4.5, description: "Comfortable headset with RGB lighting.", image: "/assets/products/images/GamingHeadset.jpg" },
  { id: "p-6007", name: "Mechanical Gaming Keyboard", category: "Gaming", brand: "Generic", price: 1799, stock: 22, rating: 4.6, description: "Mechanical keyboard with customizable switches.", image: "/assets/products/images/MechanicalKeyboard.jpg" },
  { id: "p-6008", name: "Gaming Mouse RGB", category: "Gaming", brand: "Generic", price: 999, stock: 35, rating: 4.4, description: "High-precision gaming mouse with RGB.", image: "/assets/products/images/GamingMouse.jpg" },
  { id: "p-6009", name: "4K Gaming Monitor (144Hz)", category: "Gaming", brand: "Generic", price: 8999, stock: 10, rating: 4.7, description: "Professional gaming monitor with 4K resolution.", image: "/assets/products/images/4KMonitor.jpg" },
  { id: "p-6010", name: "Racing Wheel Controller", category: "Gaming", brand: "Generic", price: 4999, stock: 12, rating: 4.6, description: "Realistic racing wheel for sim games.", image: "/assets/products/images/RacingWheel.jpg" },
  { id: "p-6011", name: "PlayStation 2 Console", category: "Gaming", brand: "Sony", price: 999, stock: 7, rating: 4.9, description: "Older generation gaming console.", image: "/assets/products/images/1a.jpg" },

  // CAMERAS
  { id: "p-7001", name: "Canon EOS R50 Mirrorless", category: "Cameras", brand: "Canon", price: 18999, stock: 10, rating: 4.7, description: "Entry-level mirrorless camera for photography.", image: "/assets/products/images/CanonR50.jpg" },
  { id: "p-7002", name: "Sony Alpha a7 III", category: "Cameras", brand: "Sony", price: 29999, stock: 8, rating: 4.8, description: "Professional mirrorless camera with excellent AF.", image: "/assets/products/images/SonyA7III.jpg" },
  { id: "p-7003", name: "Nikon Z6 II", category: "Cameras", brand: "Nikon", price: 27999, stock: 9, rating: 4.7, description: "Full-frame mirrorless camera for professionals.", image: "/assets/products/images/NikonZ6.jpg" },
  { id: "p-7004", name: "GoPro HERO12 Black", category: "Cameras", brand: "GoPro", price: 8999, stock: 20, rating: 4.6, description: "Action camera for extreme sports and adventures.", image: "/assets/products/images/GoPro12.jpg" },
  { id: "p-7005", name: "DJI Mini 3 Drone", category: "Cameras", brand: "DJI", price: 12999, stock: 12, rating: 4.8, description: "Compact drone with 4K camera and long flight time.", image: "/assets/products/images/DJIMini3.jpg" },
  { id: "p-7006", name: "Insta360 X3", category: "Cameras", brand: "Insta360", price: 9999, stock: 15, rating: 4.7, description: "360-degree action camera for immersive content.", image: "/assets/products/images/Insta360.jpg" },
  { id: "p-7007", name: "Canon EOS 250D DSLR", category: "Cameras", brand: "Canon", price: 13999, stock: 14, rating: 4.6, description: "Beginner-friendly DSLR camera.", image: "/assets/products/images/Canon250D.jpg" },
  { id: "p-7008", name: "Tripod Professional Stand", category: "Cameras", brand: "Generic", price: 1499, stock: 35, rating: 4.5, description: "Sturdy tripod for photography and videography.", image: "/assets/products/images/TripodPro.jpg" },
  { id: "p-7009", name: "Camera Lens 50mm f/1.8", category: "Cameras", brand: "Generic", price: 2999, stock: 25, rating: 4.7, description: "Prime lens for portrait and general photography.", image: "/assets/products/images/50mmLens.jpg" },
  { id: "p-7010", name: "External Camera Flash", category: "Cameras", brand: "Generic", price: 1999, stock: 30, rating: 4.5, description: "Professional external flash for cameras.", image: "/assets/products/images/CameraFlash.jpg" }
];

export const users = [
  {
    id: "u-1",
    name: "Admin User",
    email: "admin@datamak.test",
    password: "Admin123!",
    role: "admin"
  },
  {
    id: "u-2",
    name: "Alice Shopper",
    email: "alice@example.com",
    password: "Password123!",
    role: "customer"
  }
];
