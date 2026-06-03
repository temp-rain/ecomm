const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import Models
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your_super_secret_key'; // In production, use a .env file!

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve frontend files

// Database Connection
mongoose.connect('mongodb://127.0.0.1:27017/ecommerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// ==========================
// AUTHENTICATION APIs
// ==========================
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, role });
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error registering user' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET);
        res.json({ token, role: user.role, name: user.name });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// ==========================
// PRODUCT APIs
// ==========================
app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// Admin only route to add products
app.post('/api/products', async (req, res) => {
    // Note: Add JWT middleware here to verify 'admin' role in production
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// ==========================
// ORDER APIs
// ==========================
app.post('/api/orders', async (req, res) => {
    try {
        // In production, extract user ID from JWT token
        const { userId, products, totalAmount } = req.body; 
        const order = new Order({ user: userId, products, totalAmount });
        await order.save();
        res.status(201).json({ message: 'Order placed successfully', orderId: order._id });
    } catch (error) {
        res.status(500).json({ error: 'Checkout failed' });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
