const mongoose = require('mongoose')
const dotenv  = require('dotenv')

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Database')
    } catch (error) {
        console.log('Database Connection Error', error)
        process.exit(1);
    }
};

module.exports  = connectDB;