require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const runrouter = require("./routes/executeroute");
const aiRoutes = require('./routes/ai.routes');

const app = express();

// Enable CORS
app.use(cors({
  origin: "*",
  credentials: true
}));

// Middleware to parse JSON
app.use(express.json());

// API Routes
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/code', runrouter);

// Serve React build in production
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../client/build");
  app.use(express.static(buildPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Hello World (Development Mode)");
  });
}

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
