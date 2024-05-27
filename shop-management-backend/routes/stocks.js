const express = require('express');
const auth = require('../middleware/auth');
const Stock = require('../models/Stock');
const router = express.Router();

// Add new stock
router.post('/', auth(['admin']), async (req, res) => {
    const { product, size, quantity, price, shop } = req.body; // Make sure size is included
    try {
        const stock = new Stock({ product, size, quantity, price, shop });
        await stock.save();
        res.json(stock);
    } catch (err) {
        console.error('Error adding new stock:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get all stock items
router.get('/', auth(['admin', 'employee']), async (req, res) => {
    try {
        const { shop } = req.query;
        const stocks = await Stock.find({ shop });
        res.json(stocks);
    } catch (err) {
        console.error('Error getting stocks:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Update stock quantity and calculate sales
router.put('/:id', auth(['admin', 'employee']), async (req, res) => {
    const { quantity } = req.body;
    try {
        let stock = await Stock.findById(req.params.id);
        if (!stock) {
            return res.status(404).json({ msg: 'Stock not found' });
        }
        const sold = stock.quantity - quantity;
        const totalSale = sold * stock.price;

        stock.quantity = quantity;
        stock.lastUpdated = Date.now();
        await stock.save();

        res.json(stock);
    } catch (err) {
        console.error('Error updating stock:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});
// Delete a stock item// Delete a stock item
router.delete('/:id', auth(['admin']), async (req, res) => {
    try {
        const stock = await Stock.findByIdAndDelete(req.params.id);
        if (!stock) {
            return res.status(404).json({ msg: 'Stock not found' });
        }
        res.json({ msg: 'Stock deleted successfully' });
    } catch (err) {
        console.error('Error deleting stock:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Transfer stock from one shop to another
router.post('/transfer', auth(['admin']), async (req, res) => {
    const { stockId, fromShop, toShop, transferQuantity } = req.body;
    try {
        const stock = await Stock.findOne({ _id: stockId, shop: fromShop });
        if (!stock) {
            return res.status(404).json({ msg: 'Stock not found in the specified shop' });
        }
        if (stock.quantity < transferQuantity) {
            return res.status(400).json({ msg: 'Not enough stock to transfer' });
        }

        // Reduce quantity from the source shop
        stock.quantity -= transferQuantity;
        await stock.save();

        // Check if the stock already exists in the target shop
        let targetStock = await Stock.findOne({ product: stock.product, size: stock.size, shop: toShop });
        if (targetStock) {
            // If it exists, just update the quantity
            targetStock.quantity += transferQuantity;
            await targetStock.save();
        } else {
            // If not, create a new stock entry
            targetStock = new Stock({
                product: stock.product,
                size: stock.size,
                quantity: transferQuantity,
                price: stock.price,
                shop: toShop,
            });
            await targetStock.save();
        }

        res.json({ msg: 'Stock transferred successfully' });
    } catch (err) {
        console.error('Error transferring stock:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
