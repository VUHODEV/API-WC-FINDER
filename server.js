const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const sanitize = require("express-mongo-sanitize");
const cors = require("cors");
const app = express();

// Thêm middleware để parse JSON
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Thêm middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Thêm các middleware bảo mật
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api/", limiter);

// Sanitize input
app.use(sanitize());

// Add CORS middleware
app.use(cors());

// Kết nối database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "wc_database",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to the database");
});

// API lấy tất cả địa điểm
app.get("/api/wc-locations", (req, res) => {
  db.query("SELECT * FROM wc_locations", (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// API thêm địa điểm mới
app.post("/api/wc-locations", (req, res) => {
  const { name, latitude, longitude, address } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!name || !latitude || !longitude) {
    return res
      .status(400)
      .json({ error: "Name, latitude and longitude are required" });
  }

  // Validate latitude & longitude
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({ error: "Invalid latitude or longitude" });
  }

  const query = `
    INSERT INTO wc_locations 
    (name, latitude, longitude, address, description, is_free, has_disabled_access) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(
    query,
    [
      name,
      latitude,
      longitude,
      address,
      description,
      is_free,
      has_disabled_access,
    ],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res
        .status(201)
        .json({ id: result.insertId, message: "Location added successfully" });
    }
  );
});

// API cập nhật địa điểm
app.put("/api/wc-locations/:id", (req, res) => {
  const {
    name,
    latitude,
    longitude,
    address,
    description,
    is_free,
    has_disabled_access,
  } = req.body;
  const query = `
    UPDATE wc_locations 
    SET name=?, latitude=?, longitude=?, address=?, description=?, is_free=?, has_disabled_access=?
    WHERE id=?
  `;
  db.query(
    query,
    [
      name,
      latitude,
      longitude,
      address,
      description,
      is_free,
      has_disabled_access,
      req.params.id,
    ],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: "Location updated successfully" });
    }
  );
});

// API xóa địa điểm
app.delete("/api/wc-locations/:id", (req, res) => {
  db.query("DELETE FROM wc_locations WHERE id = ?", [req.params.id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "Location deleted successfully" });
  });
});

// API tìm địa điểm gần nhất
app.get("/api/wc-locations/nearby", async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    const query = `
      SELECT *, 
      (6371 * acos(
        cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) +
        sin(radians(?)) * sin(radians(latitude))
      )) AS distance
      FROM wc_locations
      HAVING distance < ?
      ORDER BY distance
      LIMIT 10
    `;

    const [results] = await db.promise().query(query, [lat, lng, lat, radius]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
