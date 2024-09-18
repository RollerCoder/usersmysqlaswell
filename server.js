const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from React app
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    console.error("Database connection details:", {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
    });
    return;
  }
  console.log("Connected to the MySQL database.");
});

// Create user
app.post("/users", (req, res) => {
  const { FirstName, LastName, EmailAddress } = req.body;
  const query =
    "INSERT INTO users (FirstName, LastName, EmailAddress) VALUES (?, ?, ?)";
  db.query(query, [FirstName, LastName, EmailAddress], (err, result) => {
    if (err) {
      console.error("Error inserting user:", err);
      res
        .status(500)
        .json({ error: "Error inserting user", details: err.message });
      return;
    }
    res
      .status(201)
      .json({ message: "User created successfully", userId: result.insertId });
  });
});

// Get users with pagination
app.get("/users", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;
  const offset = (page - 1) * perPage;

  const countQuery = "SELECT COUNT(*) as total FROM users";
  const dataQuery = "SELECT * FROM users LIMIT ? OFFSET ?";

  db.query(countQuery, (err, countResult) => {
    if (err) {
      console.error("Error counting users:", err);
      res
        .status(500)
        .json({ error: "Error fetching users", details: err.message });
      return;
    }

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / perPage);

    db.query(dataQuery, [perPage, offset], (err, users) => {
      if (err) {
        console.error("Error fetching users:", err);
        res
          .status(500)
          .json({ error: "Error fetching users", details: err.message });
        return;
      }

      res.json({
        users,
        currentPage: page,
        totalPages,
        totalUsers: total,
      });
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
