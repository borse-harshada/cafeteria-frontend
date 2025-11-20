// =====================================
// GLOBAL FRONTEND → BACKEND CONNECTION
// =====================================

// your backend URL
const API_BASE = "https://cafeteria-backend-ddq8.onrender.com/api";


// ===============================
// CHECK LOGIN ON EACH PAGE
// ===============================
export function ensureLogin() {
    const name = localStorage.getItem("studentName");
    const phone = localStorage.getItem("studentPhone");

    if (!name || !phone) {
        window.location.href = "login.html";
        return false;
    }
    return { name, phone };
}


// ===============================
// FETCH MENU ITEMS FROM BACKEND
// ===============================
export async function loadMenuFromServer() {
    try {
        const res = await fetch(`${API_BASE}/menu`);
        const items = await res.json();

        return items;  // frontend can render these
    } catch (err) {
        console.error("Error loading menu:", err);
        return [];
    }
}


// ===============================
// PLACE ORDER TO BACKEND
// ===============================
export async function sendOrderToBackend(cart) {
    const user = ensureLogin();
    if (!user) return;

    const orderData = {
        customerName: user.name,
        phone: user.phone,
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        total: cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
    };

    try {
        const res = await fetch(`${API_BASE}/orders/place`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData)
        });

        return res.ok;

    } catch (err) {
        console.error("Error sending order:", err);
        return false;
    }
}


// ===============================
// LOAD ALL ORDERS FOR ADMIN
// ===============================
export async function loadAllOrders() {
    try {
        const res = await fetch(`${API_BASE}/orders`);
        return await res.json();
    } catch (err) {
        console.error("Failed to load orders:", err);
        return [];
    }
}


// ===============================
// DELETE ORDER (ADMIN – ORDER COMPLETED)
// ===============================
export async function deleteOrder(id) {
    try {
        const res = await fetch(`${API_BASE}/orders/delete/${id}`, {
            method: "DELETE"
        });

        return res.ok;

    } catch (err) {
        console.error("Failed to delete order:", err);
        return false;
    }
}
