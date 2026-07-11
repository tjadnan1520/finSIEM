const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const env = require("./config/env");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const allowedOrigins = new Set([
  env.frontendUrl,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5181",
  "http://127.0.0.1:5181"
]);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "finSIEM backend is healthy",
    data: {
      service: "backend",
      environment: env.nodeEnv,
      timestamp: new Date().toISOString()
    }
  });
});

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
