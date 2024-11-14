let map;
let markers = [];
let favoriteLocations = JSON.parse(localStorage.getItem("favoriteWC") || "[]");

function initMap() {
  if (map) {
    map.remove();
  }

  try {
    const saigon = [10.8459, 106.7921];

    map = L.map("map").setView(saigon, 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    L.control
      .locate({
        position: "topleft",
        strings: {
          title: "Vị trí của tôi",
        },
        locateOptions: {
          enableHighAccuracy: true,
        },
      })
      .addTo(map);

    loadWCLocations();
  } catch (error) {
    console.error("Error initializing map:", error);
    showError("Không thể khởi tạo bản đồ: " + error.message);
  }
}

const mockLocations = [
  {
    name: "Nhà vệ sinh Trường ĐH HUTECH",
    latitude: 10.8459,
    longitude: 106.7921,
    address: "475A Điện Biên Phủ, P.25, Q.Bình Thạnh",
    is_free: true,
    rating: 4.3,
  },
  {
    name: "WC Công cộng Vincom Thủ Đức",
    latitude: 10.8505,
    longitude: 106.7559,
    address: "216 Võ Văn Ngân, Bình Thọ, Thủ Đức",
    is_free: false,
    rating: 4.5,
  },
  {
    name: "Nhà vệ sinh Chợ Thủ Đức",
    latitude: 10.8519,
    longitude: 106.7542,
    address: "141 Võ Văn Ngân, Linh Chiểu, Thủ Đức",
    is_free: false,
    rating: 3.8,
  },
  {
    name: "WC Công viên Phần mềm Quang Trung",
    latitude: 10.8533,
    longitude: 106.7575,
    address: "Công viên phần mềm Quang Trung, Thủ Đức",
    is_free: true,
    rating: 4.2,
  },
  {
    name: "Nhà vệ sinh AEON Mall Thủ Đức",
    latitude: 10.8469,
    longitude: 106.7556,
    address: "30 Đ. Bờ Bao Tân Thắng, Sơn Kỳ, Thủ Đức",
    is_free: false,
    rating: 4.6,
  },
  {
    name: "WC Công cộng Bến xe Miền Đông mới",
    latitude: 10.8445,
    longitude: 106.7789,
    address: "292 Đinh Bộ Lĩnh, P.26, Bình Thạnh",
    is_free: false,
    rating: 4.0,
  },
  {
    name: "Nhà vệ sinh Trường ĐH Sư phạm Kỹ thuật",
    latitude: 10.8507,
    longitude: 106.7719,
    address: "1 Võ Văn Ngân, Linh Chiểu, Thủ Đức",
    is_free: true,
    rating: 4.1,
  },
  {
    name: "WC Công cộng Ga Metro Số 1",
    latitude: 10.8477,
    longitude: 106.7592,
    address: "Đ. Võ Văn Ngân, Linh Chiểu, Thủ Đức",
    is_free: true,
    rating: 4.4,
  },
  {
    name: "Nhà vệ sinh Lotte Mart Thủ Đức",
    latitude: 10.8491,
    longitude: 106.7668,
    address: "984 Kha Vạn Cân, Thủ Đức",
    is_free: false,
    rating: 4.3,
  },
  {
    name: "WC Công viên Linh Đàm",
    latitude: 10.8422,
    longitude: 106.7812,
    address: "Phường Linh Chiểu, Thủ Đức",
    is_free: true,
    rating: 3.9,
  },
];

function loadWCLocations() {
  displayLocations(mockLocations);
}

function clearMarkers() {
  markers.forEach((marker) => marker.remove());
  markers = [];
}

function showLoading(show) {
  const loadingElement = document.getElementById("loading");
  if (loadingElement) {
    loadingElement.style.display = show ? "block" : "none";
  }

  const searchButton = document.getElementById("search-button");
  if (searchButton) {
    searchButton.disabled = show;
  }
}

function showError(message) {
  const errorElement = document.getElementById("error-message");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
    setTimeout(() => {
      errorElement.style.display = "none";
    }, 5000);
  }
}

function addMarker(position, title, type) {
  const marker = L.marker([position.lat, position.lng])
    .addTo(map)
    .bindPopup(title);
  markers.push(marker);
}

async function findNearbyWC() {
  try {
    showLoading(true);
    const searchInput = document
      .getElementById("search-input")
      .value.toLowerCase();
    const center = map.getCenter();

    const nearbyLocations = mockLocations.filter((location) => {
      const distance = calculateDistance(
        center.lat,
        center.lng,
        location.latitude,
        location.longitude
      );

      return (
        distance <= 2 && // 2km
        (location.name.toLowerCase().includes(searchInput) ||
          location.address.toLowerCase().includes(searchInput))
      );
    });

    clearMarkers();
    displayLocations(nearbyLocations);
  } catch (error) {
    showError("Lỗi tìm kiếm: " + error.message);
  } finally {
    showLoading(false);
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function displayLocationDetails(location) {
  const infoWindow = new google.maps.InfoWindow({
    content: `
      <div>
        <h3>${location.name}</h3>
        <p>${location.address}</p>
        <p>Phí: ${location.is_free ? "Miễn phí" : "Có phí"}</p>
        <p>Đánh giá: ${location.rating}/5</p>
      </div>
    `,
  });
  // Show info window when marker is clicked
}

function handleError(error) {
  const errorElement = document.getElementById("error-message");
  errorElement.textContent = error.message;
  errorElement.style.display = "block";
  setTimeout(() => {
    errorElement.style.display = "none";
  }, 3000);
}

function displayLocations(locations) {
  const wcList = document.getElementById("wc-list");
  wcList.innerHTML = `
    <div class="wc-filters">
      <button onclick="showAllLocations()" class="filter-btn active">Tất cả</button>
      <button onclick="showFavorites()" class="filter-btn">Yêu thích</button>
    </div>
  `;

  if (locations.length === 0) {
    wcList.innerHTML += `
      <div class="no-results">
        <p>Không tìm thấy nhà vệ sinh công cộng trong khu vực này</p>
      </div>
    `;
    return;
  }

  locations.forEach((location) => {
    const isFav = isFavorite(location);
    const marker = L.marker([location.latitude, location.longitude]).addTo(map)
      .bindPopup(`
        <div class="info-window">
          <h3>${location.name}</h3>
          <p>${location.address}</p>
          <p>
            <span class="wc-fee-status ${
              location.is_free ? "wc-free" : "wc-paid"
            }">
              ${location.is_free ? "Miễn phí" : "Có phí"}
            </span>
            <span class="wc-rating">⭐ ${location.rating}/5</span>
          </p>
          <button onclick="toggleFavorite(${JSON.stringify(
            location
          )})" class="favorite-btn ${isFav ? "active" : ""}">
            ${isFav ? "❤️" : "🤍"} 
          </button>
        </div>
      `);

    markers.push(marker);

    const wcItem = document.createElement("div");
    wcItem.className = "wc-item";
    wcItem.innerHTML = `
      <div class="wc-info">
        <div class="wc-name">
          ${location.name}
          <button onclick="toggleFavorite(${JSON.stringify(
            location
          )})" class="favorite-btn ${isFav ? "active" : ""}">
            ${isFav ? "❤️" : "🤍"}
          </button>
        </div>
        <div class="wc-address">${location.address}</div>
        <div>
          <span class="wc-fee-status ${
            location.is_free ? "wc-free" : "wc-paid"
          }">
            ${location.is_free ? "Miễn phí" : "Có phí"}
          </span>
          <span class="wc-rating">⭐ ${location.rating}/5</span>
        </div>
      </div>
    `;

    wcItem.addEventListener("click", () => {
      map.setView([location.latitude, location.longitude], 16);
      marker.openPopup();
    });

    wcList.appendChild(wcItem);
  });
}

function isFavorite(location) {
  return favoriteLocations.some(
    (fav) =>
      fav.latitude === location.latitude && fav.longitude === location.longitude
  );
}

function toggleFavorite(location) {
  const index = favoriteLocations.findIndex(
    (fav) =>
      fav.latitude === location.latitude && fav.longitude === location.longitude
  );

  if (index === -1) {
    favoriteLocations.push(location);
    showNotification("Đã thêm vào danh sách yêu thích");
  } else {
    favoriteLocations.splice(index, 1);
    showNotification("Đã xóa khỏi danh sách yêu thích");
  }

  localStorage.setItem("favoriteWC", JSON.stringify(favoriteLocations));
  displayLocations(mockLocations); // Cập nhật lại hiển thị
}

function showFavorites() {
  clearMarkers();
  displayLocations(favoriteLocations);
  document
    .querySelectorAll(".filter-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document.querySelector(".filter-btn:nth-child(2)").classList.add("active");
}

function showAllLocations() {
  clearMarkers();
  displayLocations(mockLocations);
  document
    .querySelectorAll(".filter-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document.querySelector(".filter-btn:nth-child(1)").classList.add("active");
}

window.addEventListener("offline", () => {
  showError("Mất kết nối internet. Vui lòng kiểm tra lại.");
});

window.addEventListener("online", () => {
  loadWCLocations();
});

function addBouncingMarker(location) {
  const marker = L.marker([location.latitude, location.longitude], {
    icon: L.divIcon({
      className: "custom-marker",
      html: `<div class="marker-pin"></div>`,
      iconSize: [30, 42],
      iconAnchor: [15, 42],
    }),
  }).addTo(map);

  marker.on("click", function () {
    const markerElement = marker.getElement();
    markerElement.classList.add("bounce");
    setTimeout(() => markerElement.classList.remove("bounce"), 1000);
  });

  return marker;
}

function addRatingFeature(location, popupContent) {
  const ratingDiv = document.createElement("div");
  ratingDiv.className = "rating-container";
  ratingDiv.innerHTML = `
    <div class="stars">
      ${Array(5)
        .fill()
        .map(
          (_, i) => `
        <span class="star ${i < location.rating ? "active" : ""}" 
              data-rating="${i + 1}">★</span>
      `
        )
        .join("")}
    </div>
    <div class="rating-count">(${location.ratingCount || 0} đánh giá)</div>
    <button class="rate-button">Đánh giá</button>
  `;

  popupContent.appendChild(ratingDiv);
}

function addShareFeature(location) {
  const shareButton = document.createElement("button");
  shareButton.className = "share-button";
  shareButton.innerHTML = '<i class="fas fa-share-alt"></i> Chia sẻ';

  shareButton.addEventListener("click", () => {
    const url = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    if (navigator.share) {
      navigator.share({
        title: location.name,
        text: `Nhà vệ sinh công cộng tại: ${location.address}`,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      showNotification("Đã sao chép link vị trí!");
    }
  });

  return shareButton;
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }, 100);
}
