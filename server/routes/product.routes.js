const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET api/products
// @desc    Get all products (with optional category filter)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = {};

        if (category && category !== 'Todo') query.category = category;

        if (search) {
            const searchConditions = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];

            // If query already has properties (status), use $and for search
            query = {
                $and: [
                    query,
                    { $or: searchConditions }
                ]
            };
        }

        const products = await Product.find(query).populate('seller', 'name avatar').sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/products/my-products
// @desc    Get current user's products
// @access  Private
router.get('/my-products', auth, async (req, res) => {
    try {
        const products = await Product.find({ seller: req.user.id }).sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/products
// @desc    Create a product (Upload)
// @access  Private
router.post('/', [auth, upload.single('image')], async (req, res) => {
    const { title, description, price, category, tags, type, shippingCost } = req.body;
    let imageUrl = '';

    if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
    } else {
        return res.status(400).json({ msg: 'Please upload an image' });
    }

    try {
        const newProduct = new Product({
            title,
            description,
            imageUrl,
            price,
            category,
            tags,
            type,
            shippingCost: shippingCost || 0,
            seller: req.user.id
        });

        const product = await newProduct.save();
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
