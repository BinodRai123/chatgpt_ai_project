const mongoose = require("mongoose");


async function ConnectToDB(){
    try {
        await mongoose.connect(process.env.DB_URL)
        console.log("DB is connected");
    } catch (error) {
        console.log("something went wrong", error);
    }
}


module.exports = ConnectToDB;