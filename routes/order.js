const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Adjust the path to your Order model

// GET all orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().populate('products.product'); // Populate product details if referenced
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET a single order by ID
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('products.product');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST a new order
router.post('/', async (req, res) => {
    const order = new Order({
        customerName: req.body.customerName,
        products: req.body.products, // Array of { product: productId, quantity: number }
        totalAmount: req.body.totalAmount,
        status: req.body.status || 'Pending',
    });

    try {
        const newOrder = await order.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT (update) an order by ID
router.put('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.customerName = req.body.customerName || order.customerName;
        order.products = req.body.products || order.products;
        order.totalAmount = req.body.totalAmount || order.totalAmount;
        order.status = req.body.status || order.status;

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE an order by ID
router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        await order.remove();
        res.json({ message: 'Order deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;