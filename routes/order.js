const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');

// GET all orders (admin only)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'username email')
            .populate('items.productId', 'name price');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET user's orders
router.get('/my-orders', async (req, res) => {
    try {
        const userId = req.body.userId; // In production, get this from JWT token
        const orders = await Order.find({ userId })
            .populate('items.productId', 'name price');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET a single order by ID
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('userId', 'username email')
            .populate('items.productId', 'name price');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST a new order
router.post('/', async (req, res) => {
    try {
        const { userId, items, totalPrice } = req.body;

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const order = new Order({
            userId,
            items,
            totalPrice,
            status: 'pending'
        });

        const newOrder = await order.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT (update) an order by ID (admin only)
router.put('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (req.body.status) {
            order.status = req.body.status;
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE an order by ID (admin only)
router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        await order.deleteOne();
        res.json({ message: 'Order deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;