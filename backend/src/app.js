const express = require("express");
const cookieParser = require("cookie-parser");

/* Calling Routes */
const userRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");

const app = express();

/* Using Middlewares */
app.use(express.json());
app.use(cookieParser());

/* Using Routes */
app.use("/api/auth",userRoutes);
app.use("/api/chat",chatRoutes);


module.exports = app;