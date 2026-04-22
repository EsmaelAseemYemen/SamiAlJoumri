// رقم هاتف المتجر (بدون + أو صفر البداية)
const STORE_PHONE = "967777279137";

let basketsData = []; // سيتم تعبئتها من JSON


// جلب البيانات من GitHub API مع معالجة الترميز العربي
async function loadBaskets() {
    try {
        // محاولة جلب البيانات من GitHub أولاً
        const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}?ref=${GITHUB_CONFIG.branch}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            // المعالجة الصحيحة للترميز العربي
            const binaryString = atob(data.content);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const decodedText = new TextDecoder('utf-8').decode(bytes);
            const jsonData = JSON.parse(decodedText);
            basketsData = jsonData.baskets;
        } else {
            // fallback للملف المحلي
            const localResponse = await fetch('baskets.json');
            const localData = await localResponse.json();
            basketsData = localData.baskets;
        }
        renderBaskets();
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        // محاولة تحميل من الملف المحلي كحل احتياطي
        try {
            const response = await fetch('baskets.json');
            const data = await response.json();
            basketsData = data.baskets;
            renderBaskets();
        } catch (e) {
            document.getElementById('basketsContainer').innerHTML = '<div class="loading">حدث خطأ في تحميل السلات</div>';
        }
    }
}
// عرض السلات في الصفحة
    function renderBaskets() {
    const container = document.getElementById('basketsContainer');
    if (!container) return;
    
    if (basketsData.length === 0) {
        container.innerHTML = '<div class="loading">لا توجد سلات حالياً</div>';
        return;
    }
    
    container.innerHTML = '';
    basketsData.forEach(basket => {
        const card = document.createElement('div');
        card.className = 'basket-card';
        card.innerHTML = `
            <div class="basket-img"><i class="fas ${basket.icon}"></i></div>
            <div class="basket-info">
                <h3>${basket.name}</h3>
                <p>${basket.desc}</p>
                <div class="price">${basket.price} <small>ريال</small></div>
                <button class="btn-order" data-name="${basket.name}"><i class="fas fa-shopping-cart"></i> اطلب السلة</button>
            </div>
        `;
        container.appendChild(card);
    });

    document.querySelectorAll('.btn-order').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const basketName = btn.getAttribute('data-name');
            openBasketModal(basketName);
        });
    });
}
/* ======================================================= */
/* ======================================================= */
/* ======================================================= */

// فتح نافذة طلب السلة
function openBasketModal(basketName) {
    const modal = document.getElementById('basketModal');
    const nameDisplay = document.getElementById('basketNameDisplay');
    if (nameDisplay) nameDisplay.innerText = `سلة: ${basketName}`;
    if (modal) modal.style.display = 'flex';
}
// فتح نافذة الطلب المباشر
function openDirectModal() {
    const modal = document.getElementById('directModal');
    const textarea = document.getElementById('directOrderDetails');
    if (textarea) textarea.value = '';
    if (modal) modal.style.display = 'flex';
}
// إرسال رسالة السلة عبر واتساب
function sendBasketWhatsapp() {
    const basketNameElem = document.getElementById('basketNameDisplay');
    const basketName = basketNameElem ? basketNameElem.innerText : 'سلة غير محددة';
    const message = `طلب سلة جديدة من تمونيات سامي:%0a%0a${encodeURIComponent(basketName)}%0a%0aالرجاء تأكيد الطلب.`;
    window.open(`https://wa.me/${STORE_PHONE}?text=${message}`, '_blank');
    closeModal('basketModal');
}
// إرسال رسالة السلة عبر SMS
function sendBasketSms() {
    const basketNameElem = document.getElementById('basketNameDisplay');
    const basketName = basketNameElem ? basketNameElem.innerText : 'سلة غير محددة';
    const message = `طلب سلة جديدة من تمونيات سامي:\n\n${basketName}`;
    window.location.href = `sms:${STORE_PHONE}?body=${encodeURIComponent(message)}`;
    closeModal('basketModal');
}
// إرسال الطلب المباشر عبر واتساب
function sendDirectWhatsapp() {
    const details = document.getElementById('directOrderDetails').value.trim();
    if (!details) {
        alert("الرجاء كتابة تفاصيل الطلب");
        return;
    }
    const message = `طلب مباشر جديد من تمونيات سامي:%0a%0a${encodeURIComponent(details)}%0a%0aالرجاء تأكيد الطلب.`;
    window.open(`https://wa.me/${STORE_PHONE}?text=${message}`, '_blank');
    closeModal('directModal');
}
// إرسال الطلب المباشر عبر SMS
function sendDirectSms() {
    const details = document.getElementById('directOrderDetails').value.trim();
    if (!details) {
        alert("الرجاء كتابة تفاصيل الطلب");
        return;
    }
    const message = `طلب مباشر جديد من تمونيات سامي:\n\n${details}`;
    window.location.href = `sms:${STORE_PHONE}?body=${encodeURIComponent(message)}`;
    closeModal('directModal');
}
// إغلاق أي نافذة
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}
// إغلاق جميع النوافذ عند الضغط على أي زر إغلاق
function setupCloseButtons() {
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = btn.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}
// ربط الأزرار الرئيسية
function bindMainButtons() {
    const directBtn = document.getElementById('directOrderBtn');
    if (directBtn) directBtn.onclick = openDirectModal;

    const basketWhatsapp = document.getElementById('basketWhatsappBtn');
    if (basketWhatsapp) basketWhatsapp.onclick = sendBasketWhatsapp;

    const basketSms = document.getElementById('basketSmsBtn');
    if (basketSms) basketSms.onclick = sendBasketSms;

    const directWhatsapp = document.getElementById('directWhatsappBtn');
    if (directWhatsapp) directWhatsapp.onclick = sendDirectWhatsapp;

    const directSms = document.getElementById('directSmsBtn');
    if (directSms) directSms.onclick = sendDirectSms;
}


/* ======================================================= */
/* ======================================================= */
/* ======================================================= */
// تشغيل كل شيء عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadBaskets();
    bindMainButtons();
    setupCloseButtons();
});