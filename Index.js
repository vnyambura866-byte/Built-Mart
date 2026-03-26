// 1. DATA & STORAGE
const hardcodedItems = [{ id: 1, category: "Building Materials", name: "Premium Cement", description: "Standard 50kg bag", price: 850, image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400" }]; 
let inventory = [];
let cart = [];

function loadDataFromStorage() {
    const saved = localStorage.getItem('buildmart_inventory');
    const parsedSaved = saved ? JSON.parse(saved) : [];
    const combined = [...hardcodedItems, ...parsedSaved];
    inventory = Array.from(new Map(combined.map(item => [item.name, item])).values());
}

function saveToPhone() {
    localStorage.setItem('buildmart_inventory', JSON.stringify(inventory.filter(item => item.id !== 1)));
}

// 2. LOAD PRODUCTS (With Filter Support)
function loadProducts(filter = 'All') {
    const shopContainer = document.getElementById('shop-container');
    if (!shopContainer) return;
    shopContainer.innerHTML = '';

    let itemsToDisplay = (filter === 'All') 
        ? inventory 
        : inventory.filter(item => item.category === filter);

    const categories = [...new Set(itemsToDisplay.map(item => item.category))].filter(Boolean);

    if (itemsToDisplay.length === 0) {
        shopContainer.innerHTML = `<p style="padding:20px; text-align:center;">No products found in ${filter}.</p>`;
        return;
    }

    categories.forEach(catName => {
        const safeId = "row-" + catName.replace(/[^a-zA-Z0-9]/g, '-');
        const section = document.createElement('section');
        section.className = 'product-row';
        section.innerHTML = `<h2>${catName}</h2><div id="${safeId}" class="slider-container"></div>`;
        shopContainer.appendChild(section);

        const row = document.getElementById(safeId);
        itemsToDisplay.filter(item => item.category === catName).forEach(item => {
            row.innerHTML += `
                <div class="product-card">
                    <img src="${item.image || ''}" onerror="this.src='https://via.placeholder.com/300x180?text=BuildMart'">
                    <div style="padding: 15px;">
                        <h3 style="font-size:1.1rem; margin-bottom:5px;">${item.name}</h3>
                        <p style="font-size:0.85rem; color:#666; margin-bottom:10px;">${item.description}</p>
                        <div style="font-weight:bold; font-size:1.2rem; color:#1a332a; margin-bottom:10px;">KSh ${Number(item.price).toLocaleString()}</div>
                        <button onclick="addToCart('${item.name}')" class="add-to-cart-btn">Add to Cart 🛒</button>
                    </div>
                </div>`;
        });
    });
    updateAdminList(categories);
}

// 3. CATEGORY FILTER & MENU
function filterByCategory(cat) {
    loadProducts(cat);
    toggleMenu(); // Closes sidebar after clicking
}

function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}

// 4. AUTH & USER UI
function openAuth() { document.getElementById('auth-modal').style.display = "block"; }
function closeAuth() { document.getElementById('auth-modal').style.display = "none"; }

function saveUser() {
    const name = document.getElementById('user-name-input').value;
    if (!name) return alert("Please enter your name");
    localStorage.setItem('buildmart_user', name);
    updateUserUI();
    closeAuth();
}

function signOut() {
    if (confirm("Are you sure you want to sign out?")) {
        localStorage.removeItem('buildmart_user');
        updateUserUI();
        location.reload(); 
    }
}

function updateUserUI() {
    const savedName = localStorage.getItem('buildmart_user');
    const display = document.getElementById('user-display');
    const sidebarAuth = document.getElementById('sidebar-auth-action');

    if (savedName) {
        if (display) {
            display.innerText = `Hi, ${savedName.split(' ')[0]}`;
            display.style.color = "#f1a100";
        }
        if (sidebarAuth) {
            sidebarAuth.innerHTML = `<li onclick="signOut()">🚪 Sign Out (${savedName.split(' ')[0]})</li>`;
        }
    } else {
        if (display) display.innerText = "Sign In";
        if (sidebarAuth) {
            sidebarAuth.innerHTML = `<li onclick="openAuth()">👤 Sign In / Register</li>`;
        }
    }
}

// 5. CART & WHATSAPP
function addToCart(name) {
    const product = inventory.find(item => item.name === name);
    const existing = cart.find(item => item.name === name);
    if (existing) existing.quantity++;
    else cart.push({ ...product, quantity: 1 });
    updateCartUI();
}

function updateCartUI() {
    document.getElementById('cart-count').innerText = cart.reduce((s, i) => s + i.quantity, 0);
}

function showCart() {
    const modal = document.getElementById('cart-modal');
    const list = document.getElementById('cart-items-list');
    const totalDisplay = document.getElementById('cart-total');
    modal.style.display = "block";
    list.innerHTML = "";
    let total = 0;
    cart.forEach((item, index) => {
        total += (item.price * item.quantity);
        list.innerHTML += `<div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;">
            <span>${item.name} (x${item.quantity})</span>
            <button onclick="removeFromCart(${index})" style="color:red; border:none; background:none;">Remove</button>
        </div>`;
    });
    totalDisplay.innerText = total.toLocaleString();
}

function closeCart() { document.getElementById('cart-modal').style.display = "none"; }
function removeFromCart(i) { cart.splice(i, 1); updateCartUI(); showCart(); }

function sendToWhatsApp() {
    if (cart.length === 0) return alert("Cart is empty!");
    const user = localStorage.getItem('buildmart_user') || "Guest";
    let msg = `*BuildMart Order from ${user}*%0A`;
    let total = 0;
    cart.forEach(i => { msg += `- ${i.name} (x${i.quantity})%0A`; total += (i.price * i.quantity); });
    msg += `%0A*Total: KSh ${total.toLocaleString()}*`;
    window.open(`https://wa.me/254708226531?text=${msg}`, '_blank');
}

// 6. ADMIN TOOLS
function toggleAdmin() { const p = document.getElementById('admin-panel'); p.style.display = (p.style.display === 'none') ? 'block' : 'none'; }
function checkAdminPassword() { if (prompt("Password:") === "1234") toggleAdmin(); else alert("Wrong!"); }

function addProductFromPrompt() {
    const name = document.getElementById('new-p-name').value;
    const price = document.getElementById('new-p-price').value;
    const cat = document.getElementById('new-p-cat').value;
    if (!name || !price || !cat) return alert("Fill all fields!");
    inventory.push({ id: Date.now(), name, price: parseFloat(price), category: cat, description: document.getElementById('new-p-desc').value, image: document.getElementById('new-p-img').value });
    saveToPhone(); loadProducts(); toggleAdmin();
}

function updateAdminList(cats) {
    const list = document.getElementById('admin-product-list');
    if (!list) return; // Safety check

    // Refresh the delete-able list
    list.innerHTML = inventory.map(i => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #ddd; background:white; margin-bottom:5px; border-radius:5px;">
            <span style="font-weight:bold;">${i.name}</span>
            <button onclick="deleteProduct(${i.id})" style="color:white; background:#ff4444; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">
                Delete
            </button>
        </div>`).join('');

    // Refresh the category suggestions for the "Add" form
    const suggest = document.getElementById('category-suggestions');
    if (suggest && cats) {
        suggest.innerHTML = cats.map(c => `<option value="${c}">`).join('');
    }
}

function deleteProduct(id) {
    // No password needed here if they are already inside the admin panel
    if (confirm("Permanently delete this product from BuildMart?")) {
        inventory = inventory.filter(item => item.id !== id);
        saveToPhone(); 
        loadProducts(); // This refreshes the shop and the admin list automatically
    }
}


// 7. STARTUP
window.onload = () => { 
    loadDataFromStorage(); 
    loadProducts(); 
    updateUserUI(); 
};
