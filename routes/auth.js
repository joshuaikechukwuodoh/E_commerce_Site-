const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");


// Temporary OTP storage (use Redis/database in production)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Send OTP (placeholder - implement email/SMS service)
const sendOTP = async (email, otp) => {
    // In production, use an email/SMS service like Twilio or Nodemailer
    console.log(`OTP for ${email}: ${otp}`); // For testing
    return true;
};

// Register route
router.post("/register", async (req, res) => {
    try {
        // Generate new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create new user
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            isVerified: false, // Add verification status
        });


        // Save user
        const user = await newUser.save();

        // Generate and send OTP
        const otp = generateOTP();
        const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
        otpStore.set(user.email, { otp, expiry });
        await sendOTP(user.email, otp);

        res.status(200).json({
            message: "User registered. Please verify with OTP sent to your email.",
            userId: user._id
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// OTP Verification route
router.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;
        const stored = otpStore.get(email);

        if (!stored || stored.expiry < Date.now()) {
            return res.status(400).json({ message: "OTP expired or invalid" });
        }

        if (stored.otp === otp) {
            const user = await User.findOneAndUpdate(
                { email },
                { isVerified: true },
                { new: true }
            );
            otpStore.delete(email);
            return res.status(200).json({
                message: "Email verified successfully",
                user
            });
        }

        res.status(400).json({ message: "Invalid OTP" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login Router
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ message: "Wrong email or password!" });
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Wrong email or password!" });
        }

        if (!user.isVerified) {
            // Resend OTP if not verified
            const otp = generateOTP();
            const expiry = Date.now() + 10 * 60 * 1000;
            otpStore.set(user.email, { otp, expiry });
            await sendOTP(user.email, otp);
            return res.status(403).json({
                message: "Account not verified. New OTP sent to email.",
                userId: user._id
            });
        }

        res.status(200).json({
            message: "Login successful!",
            user
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

/*
router.post("/login", async (req, res) => {
    try {
        const checkUser = await User.findOne({ email: req.body.email });
        !checkUser && res.status(404).json("wrong credentials");

        const validPass = await bcrypt.compare(req.body.password, checkUser.password);
        !validPass && res.status(404).json("wrong credentials");

        res.status(200).json(checkUser);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
*/

