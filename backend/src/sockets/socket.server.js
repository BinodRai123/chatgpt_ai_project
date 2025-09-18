const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");

/* services */
const {generateResponse, generateVector} = require("../services/ai.service");
const {createMemory, queryMemory } = require("../services/vector.service");

/* Requiring Models */
const userModel = require("../models/user.model");
const messageModel = require("../models/message.model");


function initSocketServer(httpServer){
    const io = new Server(httpServer,{});
    io.removeAllListeners();


    /* USING MIDDLEWARE */
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

        socket.on("ai-message",async (payLoad) => {

            const [message, vector] = await Promise.all([
                messageModel.create({
                    chat:payLoad.chat,
                    user:socket.user._id,
                    content:payLoad.content,
                    role:"user"
                }),
                generateVector(payLoad.content)
            ])

            const [memory, chatHistory] = await Promise.all([
                queryMemory({
                    queryVector: vector,
                    limit: 3,
                    metadata: {}
                }),
                (await messageModel.find({
                    chat: payLoad.chat
                }).sort({createdAt: -1}).limit(20).lean()).reverse(),
                createMemory({
                    messageId: message._id,
                    vector: vector,
                    metadata: {
                        chat: payLoad.chat,
                        user: socket.user._id,
                        text: payLoad.content
                    }
                })
            ])
            
            const stm = chatHistory.map(item => {
                return {
                    role:item.role,
                    parts:[{text: item.content}]
                }
            })

            const ltm = [
                {
                    role: "user",
                    parts: [{
                        text: `
                            these are the previous chat messages use them to generate response.

                            ${memory.map(item => item.metadata.text).join("\n")}
                        `
                    }]
                }
            ]

           const response = await generateResponse([...ltm, ...stm]);
           
           socket.emit("ai-message-response",{reponse:response});
           
            const [responseMessage, responseVector] = await Promise.all([
                await messageModel.create({
                    chat:payLoad.chat,
                    user:socket.user._id,
                    content:response,
                    role:"model"
                }),
                generateVector(response)
            ])

            await createMemory({
                messageId: responseMessage._id,
                vector: responseVector,
                metadata: {
                    chat: payLoad.chat,
                    user: responseMessage._id,
                    text: response
                }
            })

        })
    })
}


module.exports = initSocketServer;