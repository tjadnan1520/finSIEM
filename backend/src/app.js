const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const env = require("./config/env");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(cors({ origin: env.frontendUrl, credentials: true }));
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
