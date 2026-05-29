const API_URL = "http://10.0.2.2:4000/api";
const ASSET_URL = API_URL.replace("/api", "");

export function resolveImageUrl(image) {
  if (!image) {
    return "";
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${ASSET_URL}${image}`;
  }

  return `${ASSET_URL}/assets/products/${image}`;
}

export async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}
