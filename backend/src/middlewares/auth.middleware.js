const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

async function authUser(req, res, next) {
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({
            message:"unauthorized"
        })
    }

    try {
        
    const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);

    const user = await userModel.findOne({_id: decoded.id}).select("-password");

    req.user = user;

    next();

    } catch (error) {
        res.status(401).json({
            message:"invalid token"
        })
    }

}

module.exports = authUser;