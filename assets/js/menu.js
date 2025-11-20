// =========================================
// SIMPLE CART + BACKEND ORDER SYSTEM (FINAL)
// =========================================

// Cart Data
let cart = [];

// DOM Elements
const cartIcon = document.querySelector(".cart-icon");
const cartModal = document.querySelector(".cart-modal");
const cartItems = document.querySelector(".cart-items");
const cartTotalPrice = document.querySelector(".cart-total-price");
const closeCartBtn = document.querySelector(".cart-close");

const orderNowBtn = document.querySelector("#orderNowBtn");


// ===============================
// NAVBAR (Mobile)
// ===============================
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

if (hamburger) {
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    });
}

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        hamburger.classList.remove("active");
    });
});

// ===============================
// CART FUNCTIONS
// ===============================
function addToCart(id, name, price) {
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            id,
            name,
            price: Number(price),
            quantity: 1
        });
    }

    updateCart();
    openCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
}

function changeQty(id, amount) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) removeFromCart(id);

    updateCart();
}

function updateCart() {
    cartItems.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = `<p>Your cart is empty.</p>`;
        cartTotalPrice.textContent = "0 Rs";
        return;
    }

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const div = document.createElement("div");
        div.classList.add("cart-item");

        div.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <p>${item.price} Rs each</p>
            </div>

            <div style="display:flex;align-items:center;gap:8px;">
                <button class="quantity-btn minus" data-id="${item.id}">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn plus" data-id="${item.id}">+</button>
            </div>

            <div>${itemTotal} Rs</div>

            <button class="cart-item-remove" data-id="${item.id}">&times;</button>
        `;

        cartItems.appendChild(div);
    });

    cartTotalPrice.textContent = `${total} Rs`;

    document.querySelectorAll(".minus").forEach(btn =>
        btn.onclick = () => changeQty(btn.dataset.id, -1)
    );

    document.querySelectorAll(".plus").forEach(btn =>
        btn.onclick = () => changeQty(btn.dataset.id, 1)
    );

    document.querySelectorAll(".cart-item-remove").forEach(btn =>
        btn.onclick = () => removeFromCart(btn.dataset.id)
    );
}

function openCart() { cartModal.style.display = "flex"; }
function closeCart() { cartModal.style.display = "none"; }

cartIcon.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);

window.addEventListener("click", e => {
    if (e.target === cartModal) closeCart();
});

// ===============================
// ATTACH EVENTS TO MENU BUTTONS
// ===============================
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-add")) {
        addToCart(e.target.dataset.id, e.target.dataset.name, e.target.dataset.price);
    }

    if (e.target.classList.contains("btn-buy")) {
        addToCart(e.target.dataset.id, e.target.dataset.name, e.target.dataset.price);
        openCart();
    }
});


// ===============================
// LOAD MENU FROM BACKEND
// ===============================
async function loadMenuItems() {
    try {
        const res = await fetch("https://cafeteria-backend-ddq8.onrender.com/api/menu");
        const items = await res.json();

        items.forEach(item => {
            const section = document.querySelector(`#${item.category} .menu-grid`);
            if (!section) return;

            const card = document.createElement("div");
            card.classList.add("menu-item");

            card.innerHTML = `
                <div class="item-image"><img src="${item.image}"></div>
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <div class="item-meta">
                        <span class="item-price">${item.price}Rs</span>
                        <div class="item-actions">
                            <button class="btn-add" data-id="${item._id}" data-name="${item.name}" data-price="${item.price}">Add</button>
                            <button class="btn-buy" data-id="${item._id}" data-name="${item.name}" data-price="${item.price}">Buy</button>
                        </div>
                    </div>
                </div>
            `;

            section.appendChild(card);
        });

        attachMenuEvents();

    } catch (err) {
        console.error("Menu loading failed:", err);
    }
}

document.addEventListener("DOMContentLoaded", loadMenuItems);

// ===============================
// ORDER NOW → SEND TO BACKEND
// ===============================
orderNowBtn.addEventListener("click", async () => {
    if (cart.length === 0) {
        alert("Cart is empty!");
        return;
    }

    // Get stored login user info
    const customerName = localStorage.getItem("studentName");
    const phone = localStorage.getItem("studentPhone");

    if (!customerName || !phone) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    const orderData = {
        customerName,
        phone,
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        total: cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
    };

    try {
        const res = await fetch("https://cafeteria-backend-ddq8.onrender.com/api/orders/place", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData)
        });

        if (res.ok) {
            alert("Order placed successfully!");
            cart = [];
            updateCart();
            closeCart();
        } else {
            alert("Order failed!");
        }

    } catch (err) {
        console.error(err);
        alert("Server error!");
    }
});
