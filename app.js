// متغیرهای عمومی
let currentProducts = {};
let selectedProduct = null;

// توابع کمکی برای پاپ‌آپ‌ها با انیمیشن فد
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

function showAlert(title, message) {
  document.getElementById('alertTitle').innerText = title;
  document.getElementById('alertMsg').innerText = message;
  openModal('alertModal');
}

document.getElementById('closeAlertModal')?.addEventListener('click', () => {
  closeModal('alertModal');
});

// تشخیص صفحه فعلی
const isModeerPage = window.location.pathname.includes('modeer.html');

// --- منطق صفحه مدیریت (modeer.html) ---
if (isModeerPage) {
  // بررسی دسترسی مجاز لاگین
  if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
    window.location.href = 'index.html';
  }

  // جلوگیری از برگشت دکمه بک مرورگر/گوشی
  history.pushState(null, null, location.href);
  window.onpopstate = function () {
    history.go(1);
  };

  // خروج از حساب
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'index.html';
  });

  // پاپ‌آپ اطلاعات مدیر
  document.getElementById('adminInfoBtn')?.addEventListener('click', () => openModal('adminInfoModal'));
  document.getElementById('closeAdminInfoModal')?.addEventListener('click', () => closeModal('adminInfoModal'));

  // تغییر نام کاربری / رمز عبور
  document.getElementById('saveAdminInfo')?.addEventListener('click', async () => {
    const newUsername = document.getElementById('newAdminUser').value;
    const newPassword = document.getElementById('newAdminPass').value;

    if (!newUsername || !newPassword) {
      showAlert('خطا', 'لطفا تمامی فیلدها را پر کنید.');
      return;
    }

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', newUsername, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        closeModal('adminInfoModal');
        showAlert('موفقیت', 'اطلاعات مدیر با موفقیت تغییر یافت.');
      } else {
        showAlert('خطا', data.message);
      }
    } catch (e) {
      showAlert('خطا', 'ارتباط با سرور برقرار نشد.');
    }
  });

  // باز کردن فرم‌های افزودن محصول
  document.getElementById('addProductBtn')?.addEventListener('click', () => openModal('typeSelectModal'));
  document.getElementById('closeTypeModal')?.addEventListener('click', () => closeModal('typeSelectModal'));

  document.getElementById('addGameTypeBtn')?.addEventListener('click', () => {
    closeModal('typeSelectModal');
    openProductForm('game');
  });

  document.getElementById('addVirtualTypeBtn')?.addEventListener('click', () => {
    closeModal('typeSelectModal');
    openProductForm('virtual');
  });

  document.getElementById('closeFormModal')?.addEventListener('click', () => closeModal('productFormModal'));

  // افزودن یا ویرایش محصول
  document.getElementById('saveProductBtn')?.addEventListener('click', async () => {
    const editId = document.getElementById('editProductId').value;
    const type = document.getElementById('productType').value;

    const payload = {
      type,
      name: document.getElementById('pName').value,
      origPrice: document.getElementById('pOrigPrice').value,
      offerPrice: document.getElementById('pOfferPrice').value,
      desc: document.getElementById('pDesc').value,
      cardNum: document.getElementById('pCardNum').value,
      cardName: document.getElementById('pCardName').value,
      rubikaId: document.getElementById('pRubikaId').value,
      gameLevel: type === 'game' ? document.getElementById('pGameLevel').value : '',
      virtualCount: type === 'virtual' ? document.getElementById('pVirtualCount').value : ''
    };

    if (!payload.name || !payload.offerPrice) {
      showAlert('خطا', 'نام محصول و قیمت آفر الزامی هستند.');
      return;
    }

    try {
      let res;
      if (editId) {
        payload.id = editId;
        res = await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        closeModal('productFormModal');
        showAlert('موفقیت', editId ? 'محصول با موفقیت ویرایش شد.' : 'محصول جدید اضافه شد.');
        loadProducts();
      }
    } catch (e) {
      showAlert('خطا', 'ثبت محصول با خطا مواجه شد.');
    }
  });

  loadProducts();
}

// --- منطق صفحه اصلی (index.html) ---
if (!isModeerPage) {
  document.getElementById('adminLoginBtn')?.addEventListener('click', () => openModal('loginModal'));
  document.getElementById('closeLoginModal')?.addEventListener('click', () => closeModal('loginModal'));

  // بررسی ورود مدیر
  document.getElementById('submitLogin')?.addEventListener('click', async () => {
    const username = document.getElementById('loginUser').value;
    const password = document.getElementById('loginPass').value;

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password })
      });
      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        closeModal('loginModal');
        showAlert('ورود موفق', 'ورود با موفقیت انجام شد.');
        setTimeout(() => {
          window.location.href = 'modeer.html';
        }, 1000);
      } else {
        showAlert('خطا', data.message);
      }
    } catch (e) {
      showAlert('خطا', 'برقرار اتصال با سرور با خطا مواجه شد.');
    }
  });

  document.getElementById('closeProdModal')?.addEventListener('click', () => closeModal('productModal'));
  document.getElementById('closeBuyModal')?.addEventListener('click', () => closeModal('buyModal'));

  document.getElementById('buyBtn')?.addEventListener('click', () => {
    closeModal('productModal');
    if (!selectedProduct) return;

    const rubikaClean = selectedProduct.rubikaId ? selectedProduct.rubikaId.replace('@', '') : '';
    const buyText = `
      جهت ثبت سفارش، مبلغ <strong>${selectedProduct.offerPrice}</strong> را به مشخصات زیر واریز نمایید:<br><br>
      💳 <strong>شماره کارت:</strong> ${selectedProduct.cardNum || 'ثبت نشده'}<br>
      👤 <strong>به نام:</strong> ${selectedProduct.cardName || 'ثبت نشده'}<br><br>
      پس از واریز، تصویر رسید را به آیدی روبیکای زیر ارسال فرمایید:<br>
      💬 <strong>آیدی روبیکا:</strong> @${rubikaClean}<br><br>
      همچنین جهت دریافت اطلاعات بیشتر می‌توانید به آیدی فوق در پیام‌رسان روبیکا پیام دهید.
    `;
    
    document.getElementById('buyInstructions').innerHTML = buyText;
    openModal('buyModal');
  });

  loadProducts();
}

// تابع بارگذاری محصولات از API
async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    currentProducts = data || {};

    const container = document.getElementById(isModeerPage ? 'adminProductsList' : 'productsList');
    if (!container) return;

    container.innerHTML = '';

    const keys = Object.keys(currentProducts);
    if (keys.length === 0) {
      container.innerHTML = '<div style="text-align:center; padding: 20px; color: #a1a1aa;">هیچ محصولی یافت نشد.</div>';
      return;
    }

    keys.forEach(key => {
      const prod = currentProducts[key];
      const card = document.createElement('div');
      card.className = 'product-card';

      if (isModeerPage) {
        card.innerHTML = `
          <div class="product-info">
            <div class="product-name">${prod.name} (${prod.type === 'game' ? 'بازی' : 'مجازی'})</div>
            <div class="price-box">
              <span class="original-price">${prod.origPrice || ''}</span>
              <span class="offer-price">${prod.offerPrice}</span>
            </div>
          </div>
          <div class="admin-actions">
            <button class="btn btn-icon" onclick="editProduct('${key}')">✏️</button>
            <button class="btn btn-icon" onclick="deleteProduct('${key}')">🗑️</button>
          </div>
        `;
      } else {
        card.innerHTML = `
          <div class="product-info">
            <div class="product-name">${prod.name}</div>
            <div class="price-box">
              <span class="original-price">${prod.origPrice || ''}</span>
              <span class="offer-price">${prod.offerPrice}</span>
            </div>
          </div>
        `;
        card.addEventListener('click', () => showProductDetails(key));
      }

      container.appendChild(card);
    });
  } catch (e) {
    console.error('Error loading products:', e);
  }
}

// فرم محصول برای افزودن/ویرایش
function openProductForm(type, prodId = null) {
  document.getElementById('editProductId').value = prodId || '';
  document.getElementById('productType').value = type;

  const titleElem = document.getElementById('formModalTitle');
  const btnElem = document.getElementById('saveProductBtn');
  const gameGroup = document.getElementById('gameLevelGroup');
  const virtualGroup = document.getElementById('virtualCountGroup');

  if (type === 'game') {
    gameGroup.style.display = 'flex';
    virtualGroup.style.display = 'none';
  } else {
    gameGroup.style.display = 'none';
    virtualGroup.style.display = 'flex';
  }

  if (prodId && currentProducts[prodId]) {
    const p = currentProducts[prodId];
    titleElem.innerText = 'ویرایش محصول';
    btnElem.innerText = 'ذخیره تغییرات';

    document.getElementById('pName').value = p.name || '';
    document.getElementById('pOrigPrice').value = p.origPrice || '';
    document.getElementById('pOfferPrice').value = p.offerPrice || '';
    document.getElementById('pDesc').value = p.desc || '';
    document.getElementById('pCardNum').value = p.cardNum || '';
    document.getElementById('pCardName').value = p.cardName || '';
    document.getElementById('pRubikaId').value = p.rubikaId || '';
    document.getElementById('pGameLevel').value = p.gameLevel || '';
    document.getElementById('pVirtualCount').value = p.virtualCount || '';
  } else {
    titleElem.innerText = type === 'game' ? 'افزودن محصول بازی' : 'افزودن محصول مجازی';
    btnElem.innerText = 'افزودن محصول';

    document.getElementById('pName').value = '';
    document.getElementById('pOrigPrice').value = '';
    document.getElementById('pOfferPrice').value = '';
    document.getElementById('pDesc').value = '';
    document.getElementById('pCardNum').value = '';
    document.getElementById('pCardName').value = '';
    document.getElementById('pRubikaId').value = '';
    document.getElementById('pGameLevel').value = '';
    document.getElementById('pVirtualCount').value = '';
  }

  openModal('productFormModal');
}

window.editProduct = function (id) {
  const prod = currentProducts[id];
  if (prod) {
    openProductForm(prod.type, id);
  }
};

window.deleteProduct = async function (id) {
  if (confirm('آیا از حذف این محصول اطمینان دارید؟')) {
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showAlert('موفقیت', 'محصول با موفقیت حذف شد.');
        loadProducts();
      }
    } catch (e) {
      showAlert('خطا', 'حذف محصول انجام نشد.');
    }
  }
};

function showProductDetails(id) {
  selectedProduct = currentProducts[id];
  if (!selectedProduct) return;

  document.getElementById('modalProdTitle').innerText = selectedProduct.name;
  
  let detailsHtml = `
    <div class="details-row"><span class="details-label">قیمت قبل:</span><span class="details-value" style="text-decoration: line-through;">${selectedProduct.origPrice || '-'}</span></div>
    <div class="details-row"><span class="details-label">قیمت با تخفیف:</span><span class="details-value" style="color: #c084fc;">${selectedProduct.offerPrice}</span></div>
  `;

  if (selectedProduct.type === 'game' && selectedProduct.gameLevel) {
    detailsHtml += `<div class="details-row"><span class="details-label">لول اکانت:</span><span class="details-value">${selectedProduct.gameLevel}</span></div>`;
  }

  if (selectedProduct.type === 'virtual' && selectedProduct.virtualCount) {
    detailsHtml += `<div class="details-row"><span class="details-label">تعداد ممبر/فالوور:</span><span class="details-value">${selectedProduct.virtualCount}</span></div>`;
  }

  if (selectedProduct.desc) {
    detailsHtml += `<div class="details-row" style="flex-direction: column; gap: 5px;"><span class="details-label">توضیحات:</span><span class="details-value" style="font-weight: normal;">${selectedProduct.desc}</span></div>`;
  }

  document.getElementById('modalProdDetails').innerHTML = detailsHtml;
  openModal('productModal');
  }
      
