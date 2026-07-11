const express = require("express");
const providerController = require("../controllers/provider.controller");
const authenticate = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticate, providerController.listProviders);

module.exports = router;
