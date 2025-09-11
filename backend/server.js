require("dotenv").config();
const app = require("./src/app");
const ConnectToDB = require("./src/db/db");
const initSocketServer = require("./src/sockets/socket.server");
const {createServer} = require("http");

const httpServer = createServer(app);

ConnectToDB();
initSocketServer(httpServer);

httpServer.listen(3000, () => {
    console.log("server is running on port 3000");
})