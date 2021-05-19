const mongoose = require("mongoose");

const uri = process.env.mongoURI

const connectDB = async () => {
    try {
        await new mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected');
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

module.exports = connectDB;