const Admin  = require('../models/adminModel')
const bcrypt  = require('bcrypt')
const jwt  = require('jsonwebtoken')


const registerAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password required" });
        }

        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already Exist" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new Admin({
            username,
            password: hashedPassword,
        });

        await newAdmin.save();

        res.status(201).json({ message: "Admin registered Successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Registering Admin" });
    }
};

const loginAdmin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(400).json({ message: "Admin Not Found" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Set token expiration to 20 days
        const token = jwt.sign(
            { id: admin._id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: '20d' } // Token expires in 20 days
        );

        res.status(200).json({
            message: "Login Successful",
            token,
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging in Admin" });
    }
};


module.exports = { registerAdmin , loginAdmin};