const UserRegisterModel = require('../../Models/Web/register.user');
const bcrypt = require('bcryptjs');

let registerUserInsert = async (req, res) => {
    console.log("Received data:", req.body);

    let { fullName, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await UserRegisterModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                status: 0, 
                message: "User already exists with this email" 
            });
        }

        // Only pass the plain password, let the model hash it
        let userRegister = new UserRegisterModel({
            fullName,
            email,
            password // plain password, will be hashed by pre-save hook
        });

        await userRegister.save();
        res.status(201).json({ 
            status: 1, 
            message: "User Registered Successfully" 
        });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ 
            status: 0, 
            message: "Error While Registering User", 
            error: err.message 
        });
    }
};

module.exports = { registerUserInsert };