let cart = [];
let products = [];
let currentUser = { id: "60d5ecb54cb7c1a2f0b99211", name: "Guest User" }; // Mocked user ID for testing

// Elements
const productsContainer = document.getElementById('products-container');
const cartCountElement = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');

// Fetch products from backend
async function loadProducts() {
    try {
        const res = await fetch('/api/products');
        products = await res.json();
        renderProducts();
    } catch (error) {
        console.error("Error loading products", error);
    }
}

// Render to DOM
function renderProducts() {
    productsContainer.innerHTML = '';
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>$${product.price.toFixed(2)}</p>
            <button onclick="addToCart('${product._id}')">Add to Cart</button>
        `;
        productsContainer.appendChild(card);
    });
}

// Cart Logic
function addToCart(productId) {
    const product = products.find(p => p._id === productId);
    const existingItem = cart.find(item => item.product._id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ product, quantity: 1 });
    }
    updateCartUI();
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.innerText = totalItems;
    
    cartItemsContainer.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        total += item.product.price * item.quantity;
        const li = document.createElement('li');
        li.innerText = `${item.product.name} - ${item.quantity} x $${item.product.price}`;
        cartItemsContainer.appendChild(li);
    });
    cartTotalElement.innerText = total.toFixed(2);
}

// Checkout (Sends POST to backend)
async function checkout() {
    if (cart.length === 0) return alert('Cart is empty!');
    
    const orderData = {
        userId: currentUser.id, // In a real app, send JWT token in headers instead
        products: cart.map(item => ({ product: item.product._id, quantity: item.quantity })),
        totalAmount: cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    };

    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        
        if (res.ok) {
            alert('Order placed successfully!');
            cart = [];
            updateCartUI();
            cartModal.classList.add('hidden');
        }
    } catch (error) {
        alert('Checkout failed.');
    }
}

// Event Listeners
document.getElementById('cart-btn').addEventListener('click', () => cartModal.classList.remove('hidden'));
document.getElementById('close-cart').addEventListener('click', () => cartModal.classList.add('hidden'));
document.getElementById('checkout-btn').addEventListener('click', checkout);

// Initialization
loadProducts();
