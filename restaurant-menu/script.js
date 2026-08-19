// ==========================================================================
// 1. إدارة سلة الطلبات (Cart System)
// ==========================================================================
let cart = [];

function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    updateCartUI();

    // إضافة تأثير إشعار خفيف على أيقونة السلة بدلاً من الـ Alert المزعج
    const cartBadge = document.getElementById('cart-badge');
    if (cartBadge) {
        cartBadge.style.transform = 'scale(1.4)';
        setTimeout(() => cartBadge.style.transform = 'scale(1)', 200);
    }
}

function updateCartUI() {
    const cartBadge = document.getElementById('cart-badge');
    const cartContainer = document.getElementById('cart-items-container');
    const modalTotal = document.getElementById('modal-total');

    let totalQuantity = 0;
    let totalPrice = 0;

    if (cartContainer) cartContainer.innerHTML = '';

    cart.forEach(item => {
        totalQuantity += item.quantity;
        totalPrice += item.price * item.quantity;

        if (cartContainer) {
            const itemElement = document.createElement('div');
            itemElement.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding:10px; background:#f9f9f9; border-radius:8px;';
            itemElement.innerHTML = `
                <div>
                    <strong>${item.name}</strong>
                    <div style="font-size:12px; color:#666;">${item.price.toLocaleString()} د.ع</div>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <button onclick="changeQuantity(${item.id}, -1)" style="padding:2px 8px;">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity(${item.id}, 1)" style="padding:2px 8px;">+</button>
                    <button onclick="removeFromCart(${item.id})" style="color:red; background:none; border:none; cursor:pointer; margin-right:5px;">حذف</button>
                </div>
            `;
            cartContainer.appendChild(itemElement);
        }
    });

    if (cartBadge) cartBadge.innerText = totalQuantity;
    if (modalTotal) modalTotal.innerText = totalPrice.toLocaleString();
}

function changeQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            updateCartUI();
        }
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

function openCartModal() {
    const modal = document.getElementById('cart-modal');
    if (modal) modal.style.display = 'flex';
}

function closeCartModal() {
    const modal = document.getElementById('cart-modal');
    if (modal) modal.style.display = 'none';
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================================================
// 2. إرسال الطلب عبر الواتساب (WhatsApp Order)
// ==========================================================================
function sendOrderToWhatsApp() {
    if (cart.length === 0) {
        alert("سلة الطلبات فارغة!");
        return;
    }

    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const note = document.getElementById('general-note').value.trim();

    if (!name || !phone) {
        alert("يرجى إدخال الاسم الكامل ورقم الهاتف!");
        return;
    }

    let message = `طلب جديد من المنيو\n\n`;
    message += `اسم الزبون: ${name}\n`;
    message += `رقم الهاتف: ${phone}\n`;
    if (note) message += `ملاحظات: ${note}\n`;
    message += `\nالطلبات:\n`;

    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        message += `- ${item.name} (${item.quantity}) = ${itemTotal.toLocaleString()} د.ع\n`;
    });

    message += `\nالمجموع الكلي: ${total.toLocaleString()} د.ع`;

    const whatsappNumber = "9647700000000"; 
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// ==========================================================================
// 3. لوحة التحكم والإدارة والتعديل (Admin & Edit Logic)
// ==========================================================================

// دالة تشفير SHA-256 لحماية كلمة السر
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function checkAdminPasswordPage() {
    const adminNameInput = document.getElementById('admin-name');
    const adminPassInput = document.getElementById('admin-pass');

    const adminName = adminNameInput ? adminNameInput.value.trim() : "";
    const passwordInput = adminPassInput ? adminPassInput.value : "";
    
    // التشفير المعتمد لكلمة السر
    // ملاحظة:كلمة السر مستخدمة هنا فقط لغرض التعلم
    const SECRET_HASH = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"; 

    if (adminName === "") {
        alert("يرجى إدخال اسم المدير أولاً!");
        return;
    }

    const inputHash = await hashPassword(passwordInput);

    if (inputHash === SECRET_HASH) {
        document.getElementById('admin-login-sec').style.display = 'none';
        document.getElementById('admin-panel-sec').style.display = 'block';
        
        const welcomeMsg = document.getElementById('admin-welcome-msg');
        if (welcomeMsg) welcomeMsg.innerText = `أهلاً بك يا ${adminName} 👋`;
        
        switchAdminTab('add');
        loadAdminManageList();
    } else {
        alert("كلمة السر غير صحيحة)");
    }
}

function logoutAdminPage() {
    document.getElementById('admin-login-sec').style.display = 'block';
    document.getElementById('admin-panel-sec').style.display = 'none';
}

function switchAdminTab(tabName) {
    const tabAdd = document.getElementById('tab-content-add');
    const tabManage = document.getElementById('tab-content-manage');
    const btnAdd = document.getElementById('btn-tab-add');
    const btnManage = document.getElementById('btn-tab-manage');

    if (!tabAdd || !tabManage) return;

    if (tabName === 'add') {
        tabAdd.style.display = 'block';
        tabManage.style.display = 'none';
        
        btnAdd.style.background = '#d63031';
        btnAdd.style.color = 'white';
        btnManage.style.background = '#eee';
        btnManage.style.color = '#333';
    } else {
        tabAdd.style.display = 'none';
        tabManage.style.display = 'block';
        
        btnManage.style.background = '#d63031';
        btnManage.style.color = 'white';
        btnAdd.style.background = '#eee';
        btnAdd.style.color = '#333';

        loadAdminManageList();
    }
}

function addNewItemFromAdminPage() {
    const nameInput = document.getElementById('item-name');
    const priceInput = document.getElementById('item-price');
    const categoryInput = document.getElementById('item-category');
    const fileInput = document.getElementById('item-file');
    const descInput = document.getElementById('item-desc');

    const name = nameInput ? nameInput.value.trim() : "";
    const price = priceInput ? parseFloat(priceInput.value) : NaN;
    const category = categoryInput ? categoryInput.value : "meals";
    const desc = descInput ? descInput.value.trim() : "";

    if (name === "" || isNaN(price)) {
        alert("يرجى كتابة اسم الوجبة والسعر بشكل صحيح!");
        return;
    }

    let defaultImg = 'Classic-Burger (1).png';

    if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            saveNewItemAndNotify(name, price, category, e.target.result, desc);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        saveNewItemAndNotify(name, price, category, defaultImg, desc);
    }
}

function saveNewItemAndNotify(name, price, category, imgSrc, desc) {
    const newItem = {
        id: Date.now(),
        name: name,
        price: price,
        category: category,
        img: imgSrc,
        desc: desc
    };

    saveCustomItem(newItem);
    alert("تمت إضافة الوجبة بنجاح");

    if(document.getElementById('item-name')) document.getElementById('item-name').value = '';
    if(document.getElementById('item-price')) document.getElementById('item-price').value = '';
    if(document.getElementById('item-file')) document.getElementById('item-file').value = '';
    if(document.getElementById('item-desc')) document.getElementById('item-desc').value = '';
    
    switchAdminTab('manage');
}

function renderMenuItem(item) {
    const targetSection = document.getElementById(item.category);
    if (!targetSection) return;

    const itemCard = document.createElement('div');
    itemCard.className = 'menu-item';
    itemCard.id = `menu-card-${item.id}`;
    itemCard.innerHTML = `
        <img src="${item.img}" alt="${item.name}">
        <h3>${item.name}</h3>
        ${item.desc ? `<p>${item.desc}</p>` : ''}
        <span class="price">السعر : ${item.price.toLocaleString()}</span>
        <button class="add-to-cart-btn" onclick="addToCart(${item.id}, '${item.name}', ${item.price})">إضافة للسلة</button>
    `;

    targetSection.appendChild(itemCard);
}

function saveCustomItem(item) {
    let customItems = JSON.parse(localStorage.getItem('customMenuItems')) || [];
    customItems.push(item);
    localStorage.setItem('customMenuItems', JSON.stringify(customItems));
}

function loadAdminManageList() {
    const container = document.getElementById('admin-items-list');
    if (!container) return;

    container.innerHTML = '';
    let customItems = JSON.parse(localStorage.getItem('customMenuItems')) || [];

    if (customItems.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#777; margin:15px 0;">لا توجد وجبات مضافة حتى الآن.</p>';
        return;
    }

    customItems.forEach(item => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:#f9f9f9; padding:10px; border-radius:8px; border:1px solid #eee;';
        
        row.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${item.img}" style="width:45px; height:45px; border-radius:6px; object-fit:cover;">
                <div>
                    <strong style="display:block; font-size:14px;">${item.name}</strong>
                    <span style="font-size:12px; color:#666;">${item.price.toLocaleString()} د.ع</span>
                </div>
            </div>
            <div style="display:flex; gap:6px;">
                <button onclick="openEditModal(${item.id})" style="background:#00b894; color:white; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:bold;">تعديل</button>
                <button onclick="deleteMenuItem(${item.id})" style="background:#d63031; color:white; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:bold;">حذف</button>
            </div>
        `;

        container.appendChild(row);
    });
}

function openEditModal(id) {
    let customItems = JSON.parse(localStorage.getItem('customMenuItems')) || [];
    const item = customItems.find(i => i.id === id);

    if (item) {
        document.getElementById('edit-item-id').value = item.id;
        document.getElementById('edit-item-name').value = item.name;
        document.getElementById('edit-item-price').value = item.price;
        document.getElementById('edit-item-desc').value = item.desc || '';
        document.getElementById('edit-item-modal').style.display = 'flex';
    }
}

function closeEditModal() {
    document.getElementById('edit-item-modal').style.display = 'none';
}

function saveItemEdits() {
    const id = parseInt(document.getElementById('edit-item-id').value);
    const newName = document.getElementById('edit-item-name').value.trim();
    const newPrice = parseFloat(document.getElementById('edit-item-price').value);
    const newDesc = document.getElementById('edit-item-desc').value.trim();

    if (!newName || isNaN(newPrice)) {
        alert("يرجى كتابة الاسم والسعر بشكل صحيح!");
        return;
    }

    let customItems = JSON.parse(localStorage.getItem('customMenuItems')) || [];
    const itemIndex = customItems.findIndex(i => i.id === id);

    if (itemIndex !== -1) {
        customItems[itemIndex].name = newName;
        customItems[itemIndex].price = newPrice;
        customItems[itemIndex].desc = newDesc;

        localStorage.setItem('customMenuItems', JSON.stringify(customItems));
        alert("تمت تحديث البيانات بنجاح! ✨");
        
        closeEditModal();
        loadAdminManageList();
    }
}

function deleteMenuItem(id) {
    if (!confirm("هل أنت تأكد من رغبتك في حذف هذه الوجبة؟")) return;

    let customItems = JSON.parse(localStorage.getItem('customMenuItems')) || [];
    customItems = customItems.filter(item => item.id !== id);
    localStorage.setItem('customMenuItems', JSON.stringify(customItems));

    const cardOnScreen = document.getElementById(`menu-card-${id}`);
    if (cardOnScreen) cardOnScreen.remove();

    loadAdminManageList();
}

// ==========================================================================
// 4. تحميل وعرض العناصر دون تكرار
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
    let customItems = JSON.parse(localStorage.getItem('customMenuItems'));

    const defaultItems = [
        { id: 1, name: 'بركر لحم كلاسيك', price: 7000, category: 'meals', img: 'Classic-Burger (1).png', desc: 'بركر لحم كلاسيك مع الجبن والخس والطماطم والصلصة الخاصة.' },
        { id: 2, name: 'بيتزا ببروني كبير', price: 12000, category: 'meals', img: 'pizze.png', desc: 'بيتزا ببروني كبير مع الجبن والخس والطماطم والصلصة الخاصة.' },
        { id: 3, name: 'وجبة كنتاكي 5 قطع', price: 10000, category: 'meals', img: 'KFC.png', desc: 'وجبة كنتاكي 5 قطع مع البطاطس المقلية والمشروب.' },
        { id: 4, name: 'كوكاكولا', price: 500, category: 'drinks', img: 'cocagola.png', desc: '' },
        { id: 5, name: 'عصير برتقال طبيعي', price: 5000, category: 'drinks', img: 'orange.png', desc: '' },
        { id: 6, name: 'ماء', price: 250, category: 'drinks', img: 'water.png', desc: '' },
        { id: 7, name: 'حمص', price: 6000, category: 'appetizers', img: 'hummus.png', desc: '' },
        { id: 8, name: 'بابا غنوج', price: 4500, category: 'appetizers', img: 'baba-ganoush.png', desc: '' },
        { id: 9, name: 'ورق عنب', price: 5000, category: 'appetizers', img: 'warak-enab.png', desc: '' }
    ];

    if (!customItems || customItems.length === 0) {
        localStorage.setItem('customMenuItems', JSON.stringify(defaultItems));
        customItems = defaultItems;
    }

    // تنظيف جميع الأقسام لمنع التكرار نهائياً
    const sections = ['meals', 'drinks', 'appetizers'];
    sections.forEach(secId => {
        const sec = document.getElementById(secId);
        if (sec) sec.innerHTML = '';
    });

    // رسم القائمة من التخزين فقط
    customItems.forEach(item => renderMenuItem(item));
});