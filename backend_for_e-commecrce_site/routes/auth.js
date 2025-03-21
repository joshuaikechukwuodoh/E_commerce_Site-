const router = require("express").Router();
const User = require("../models/AuthUser");
const bcrypt = require("bcrypt");

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
        });

        // Save user and respond
        const user = await newUser.save();
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

//Login Router

router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).json({ message: "Wrong email or password!" });
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json({ message: "Wrong email or password!" });
        res.status(200).json({ message: "Login successful!", user });
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

