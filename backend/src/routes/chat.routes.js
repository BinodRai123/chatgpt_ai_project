const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {createChat} = require("../controllers/chat.controller");

const router = express.Router();

router.post("/", authMiddleware, createChat);

module.exports = router;