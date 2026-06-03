const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    imageUrl: { type: String, default: 'https://via.placeholder.com/150' },
    stock: { type: Number, default: 10 }
});

module.exports = mongoose.model('Product', productSchema);
