const chatModel = require("../models/chat.model");


async function createChat(req, res){
    const {title} = req.body;
    const user = req.user;

    const chat = await chatModel.create({
        user: user._id,
        title
    })

    res.status(201).json({
        message:"chat created sucessfully",
        chat:{
            id:chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity
        }
    })
}

module.exports = {
    createChat
}