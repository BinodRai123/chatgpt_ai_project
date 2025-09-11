const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");

/* generate ai response func */
const generateResponse = require("../services/ai.service");

/* Requiring Models */
const userModel = require("../models/user.model");
const messageModel = require("../models/message.model");


function initSocketServer(httpServer){
    const io = new Server(httpServer,{});

    /* using Middleware */
    io.use(async (socket, next) => {
        //use or operator to avoid error
        const cookies = cookie.parse(socket.handshake.headers.cookie || "");

        if(!cookies.token){
            next(new Error("Authentication Error: No Token Provided")) 
        }

        try {
            
            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET_KEY);
            const user = await userModel.findById(decoded.id).select("-password -__v");
            socket.user = user;
            next();

        } catch (error) {
            next(new Error("Authentication Error: Invalid Token"));
        }
        
    })

    io.on("connection",(socket) => {
        console.log("user is connected");

        socket.on("ai-message",async (message) => {
           const response = await generateResponse(message.title);

           //send message to frontend
           socket.emit("ai-message-response",{reponse:response});
        })
    })
}


module.exports = initSocketServer;