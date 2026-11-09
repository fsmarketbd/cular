/**
 * HOCO Secret Admin Control Panel
 * Handles Security PIN, Orders Dashboard, Status Updates, CSV Export, and WhatsApp Integration
 */

document.addEventListener('DOMContentLoaded', () => {

  const STORAGE_KEY = 'hoco_cooler_orders';
  const PIN_KEY = 'hoco_admin_pin';
  const SESSION_AUTH_KEY = 'hoco_admin_logged_in';
  const DEFAULT_PIN = '1234';

  // State
  let currentFilter = 'all';
  let searchQuery = '';

  // DOM Elements
  const pinOverlay = document.getElementById('pin-overlay');
  const pinForm = document.getElementById('pin-form');
  const pinInput = document.getElementById('admin-pin-input');
  const pinErrorMsg = document.getElementById('pin-error-msg');
  const adminContent = document.getElementById('admin-content');
  const logoutBtn = document.getElementById('admin-logout-btn');

  // Change PIN elements
  const openChangePinBtn = document.getElementById('open-change-pin-btn');
  const changePinModal = document.getElementById('change-pin-modal');
  const closePinModal = document.getElementById('close-pin-modal');
  const changePinForm = document.getElementById('change-pin-form');
  const oldPinInput = document.getElementById('old-pin');
  const newPinInput = document.getElementById('new-pin');

  // Stats elements
  const statTotal = document.getElementById('stat-total-orders');
  const statPending = document.getElementById('stat-pending-orders');
  const statConfirmed = document.getElementById('stat-confirmed-orders');
  const statRevenue = document.getElementById('stat-total-revenue');

  // Filter count elements
  const countAll = document.getElementById('count-all');
  const countPending = document.getElementById('count-pending');
  const countConfirmed = document.getElementById('count-confirmed');
  const countShipped = document.getElementById('count-shipped');
  const countCancelled = document.getElementById('count-cancelled');

  // Controls elements
  const searchInput = document.getElementById('order-search-input');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const addSampleBtn = document.getElementById('add-sample-btn');
  const clearAllBtn = document.getElementById('clear-all-orders-btn');

  // Table & Empty State
  const tableBody = document.getElementById('orders-table-body');
  const tableContainer = document.getElementById('table-container');
  const emptyState = document.getElementById('empty-state');
  const toast = document.getElementById('admin-toast');
  const toastTitle = document.getElementById('toast-title');
  const toastDesc = document.getElementById('toast-desc');

  /* ===================================================================
     1. SECURITY PIN & AUTHENTICATION
     =================================================================== */
  function getSavedPIN() {
    return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
  }

  function checkSessionAuth() {
    const isAuth = sessionStorage.getItem(SESSION_AUTH_KEY) === 'true';
    if (isAuth) {
      pinOverlay.style.display = 'none';
      adminContent.style.display = 'block';
      renderDashboard();
    } else {
      pinOverlay.style.display = 'flex';
      adminContent.style.display = 'none';
      if (pinInput) pinInput.focus();
    }
  }

  if (pinForm) {
    pinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredPin = pinInput.value.trim();
      if (enteredPin === getSavedPIN()) {
        sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
        pinOverlay.style.display = 'none';
        adminContent.style.display = 'block';
        pinErrorMsg.style.display = 'none';
        pinInput.value = '';
        showToast('লগইন সফল!', 'এডমিন কন্ট্রোল প্যানেলে স্বাগতম।');
        renderDashboard();
      } else {
        pinErrorMsg.style.display = 'block';
        pinInput.value = '';
        pinInput.focus();
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
      pinOverlay.style.display = 'flex';
      adminContent.style.display = 'none';
      showToast('লগআউট সফল', 'আপনি নিরাপদে এডমিন প্যানেল থেকে বের হয়েছেন।');
    });
  }

  // Change PIN handlers
  if (openChangePinBtn) {
    openChangePinBtn.addEventListener('click', () => {
      changePinModal.classList.add('active');
    });
  }

  if (closePinModal) {
    closePinModal.addEventListener('click', () => {
      changePinModal.classList.remove('active');
    });
  }

  if (changePinModal) {
    changePinModal.addEventListener('click', (e) => {
      if (e.target === changePinModal) changePinModal.classList.remove('active');
    });
  }

  if (changePinForm) {
    changePinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const oldPin = oldPinInput.value.trim();
      const newPin = newPinInput.value.trim();

      if (oldPin !== getSavedPIN()) {
        alert('বর্তমান পিন কোডটি ভুল দেওয়া হয়েছে!');
        return;
      }
      if (newPin.length < 4) {
        alert('নতুন পিন কোড কমপক্ষে ৪ ডিজিটের হতে হবে!');
        return;
      }

      localStorage.setItem(PIN_KEY, newPin);
      changePinModal.classList.remove('active');
      changePinForm.reset();
      showToast('পিন পরিবর্তিত হয়েছে!', `আপনার নতুন এডমিন পিন কোড: ${newPin}`);
    });
  }

  /* ===================================================================
     2. ORDERS DATA & LOCAL STORAGE
     =================================================================== */
  function getOrders() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  function saveOrders(orders) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    renderDashboard();
  }

  /* ===================================================================
     3. RENDER DASHBOARD & STATS
     =================================================================== */
  function renderDashboard() {
    const orders = getOrders();

    // 1. Calculate Stats
    const totalCount = orders.length;
    const pendingCount = orders.filter(o => o.status === 'Pending').length;
    const confirmedCount = orders.filter(o => o.status === 'Confirmed' || o.status === 'Shipped').length;
    const shippedCount = orders.filter(o => o.status === 'Shipped').length;
    const cancelledCount = orders.filter(o => o.status === 'Cancelled').length;

    // Total Revenue (excluding cancelled)
    const revenueSum = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (parseInt(o.total, 10) || 0), 0);

    if (statTotal) statTotal.textContent = totalCount;
    if (statPending) statPending.textContent = pendingCount;
    if (statConfirmed) statConfirmed.textContent = confirmedCount;
    if (statRevenue) statRevenue.textContent = revenueSum.toLocaleString('bn-BD') + ' ৳';

    // Update filter counts
    if (countAll) countAll.textContent = totalCount;
    if (countPending) countPending.textContent = pendingCount;
    if (countConfirmed) countConfirmed.textContent = orders.filter(o => o.status === 'Confirmed').length;
    if (countShipped) countShipped.textContent = shippedCount;
    if (countCancelled) countCancelled.textContent = cancelledCount;

    // 2. Filter Orders
    let filtered = orders;

    if (currentFilter !== 'all') {
      filtered = filtered.filter(o => o.status === currentFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.phone && o.phone.includes(q)) ||
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.address && o.address.toLowerCase().includes(q))
      );
    }

    // 3. Render Table
    if (filtered.length === 0) {
      tableContainer.style.display = 'none';
      emptyState.style.display = 'block';
    } else {
      tableContainer.style.display = 'block';
      emptyState.style.display = 'none';

      tableBody.innerHTML = filtered.map(order => {
        const cleanPhone = (order.phone || '').replace(/[^0-9]/g, '');
        const waPhone = cleanPhone.startsWith('88') ? cleanPhone : (cleanPhone.startsWith('0') ? '88' + cleanPhone : cleanPhone);
        const waMessage = encodeURIComponent(`হ্যালো ${order.customerName}, আপনার HOCO Semiconductor Cooler-এর অর্ডারটি (${order.id}) কনফার্ম করতে যোগাযোগ করছি। ধন্যবাদ!`);

        return `
          <tr data-order-id="${order.id}">
            <td>
              <span class="order-id-badge">${order.id}</span>
              <span class="order-date-text">${order.date || 'আজ'}</span>
            </td>
            <td>
              <div class="customer-info">
                <strong>${escapeHtml(order.customerName)}</strong>
                <a href="tel:${cleanPhone}" class="customer-phone" title="সরাসরি কল দিন">
                  <i class="fa-solid fa-phone"></i> ${escapeHtml(order.phone)}
                </a>
              </div>
            </td>
            <td>
              <div class="address-cell">
                <span class="city-badge">${escapeHtml(order.city || 'ঢাকা')}</span>
                <div>${escapeHtml(order.address || 'ঠিকানা দেওয়া হয়নি')}</div>
              </div>
            </td>
            <td>
              <div><strong>${escapeHtml(order.product || 'HOCO Phone Cooler')}</strong></div>
              <span class="order-amount-text">${order.total} ৳</span>
            </td>
            <td>
              <select class="status-select" onchange="updateOrderStatus('${order.id}', this.value)">
                <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
                <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>✅ Confirmed</option>
                <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>🚚 Shipped</option>
                <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>❌ Cancelled</option>
              </select>
            </td>
            <td>
              <div class="action-btn-group">
                <a href="https://wa.me/${waPhone}?text=${waMessage}" target="_blank" class="row-btn row-btn-wa" title="হোয়াটসঅ্যাপে মেসেজ পাঠান">
                  <i class="fa-brands fa-whatsapp"></i>
                </a>
                <a href="tel:${cleanPhone}" class="row-btn row-btn-call" title="সরাসরি কল দিন">
                  <i class="fa-solid fa-phone"></i>
                </a>
                <button type="button" class="row-btn row-btn-del" onclick="deleteOrder('${order.id}')" title="অর্ডার মুছুন">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ===================================================================
     4. ORDER ACTIONS (UPDATE STATUS & DELETE)
     =================================================================== */
  window.updateOrderStatus = function(orderId, newStatus) {
    const orders = getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = newStatus;
      saveOrders(orders);
      showToast('স্ট্যাটাস আপডেট!', `অর্ডার ${orderId} এখন ${newStatus}`);
    }
  };

  window.deleteOrder = function(orderId) {
    if (confirm(`আপনি কি সত্যিই অর্ডারটি (${orderId}) মুছে ফেলতে চান?`)) {
      const orders = getOrders().filter(o => o.id !== orderId);
      saveOrders(orders);
      showToast('অর্ডার ডিলিট হয়েছে', `অর্ডার ${orderId} তালিকা থেকে মুছে দেওয়া হয়েছে।`);
    }
  };

  /* ===================================================================
     5. CONTROLS: SEARCH, FILTERS & CLEAR
     =================================================================== */
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderDashboard();
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderDashboard();
    });
  });

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (getOrders().length === 0) {
        alert('তালিকায় কোনো অর্ডার নেই!');
        return;
      }
      if (confirm('সতর্কতা: আপনি কি নিশ্চিত যে আপনি সমস্ত অর্ডার মুছে ফেলতে চান? এটি পুনরায় ফিরিয়ে আনা সম্ভব নয়।')) {
        saveOrders([]);
        showToast('অল ক্লিয়ার', 'সমস্ত অর্ডার সফলভাবে মুছে ফেলা হয়েছে।');
      }
    });
  }

  /* ===================================================================
     6. ADD SAMPLE / TEST ORDERS
     =================================================================== */
  if (addSampleBtn) {
    addSampleBtn.addEventListener('click', () => {
      const sampleNames = ['রাকিব হাসান', 'তানজিম আহমেদ', 'সাকিব আল হাসান', 'মাহমুদুর রহমান'];
      const sampleCities = ['ঢাকার ভিতরে (৬০ ৳)', 'ঢাকার বাইরে (১২০ ৳)'];
      const sampleAddresses = [
        'বাড়ি নং ১২, রোড নং ৫, ব্লক ডি, মিরপুর ১০, ঢাকা',
        'হাউজ ৪৫, জিইসি মোড়, নাসিরাবাদ, চট্টগ্রাম',
        'উপজেলা রোড, সদর, বগুড়া'
      ];

      const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const randomCity = sampleCities[Math.floor(Math.random() * sampleCities.length)];
      const randomAddr = sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)];
      const deliveryFee = randomCity.includes('৬০') ? 60 : 120;
      const randomPhone = '018' + Math.floor(10000000 + Math.random() * 90000000);

      const demoOrder = {
        id: 'HC-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleString('en-GB'),
        timestamp: Date.now(),
        customerName: randomName,
        phone: randomPhone,
        city: randomCity,
        address: randomAddr,
        product: 'HOCO Semiconductor Phone Cooler (RGB Edition)',
        price: 1280,
        deliveryFee: deliveryFee,
        total: 1280 + deliveryFee,
        status: 'Pending'
      };

      const orders = getOrders();
      orders.unshift(demoOrder);
      saveOrders(orders);
      showToast('টেস্ট অর্ডার যুক্ত হয়েছে!', `নতুন স্যাম্পল অর্ডার: ${demoOrder.id}`);
    });
  }

  /* ===================================================================
     7. EXPORT TO CSV / EXCEL
     =================================================================== */
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      const orders = getOrders();
      if (orders.length === 0) {
        alert('এক্সপোর্ট করার মতো কোনো অর্ডার পাওয়া যায়নি!');
        return;
      }

      // UTF-8 BOM so Excel displays Bengali fonts properly
      let csvContent = '\uFEFF';
      csvContent += 'Order ID,Date,Customer Name,Phone,City / Area,Address,Product,Price (BDT),Delivery (BDT),Total (BDT),Status\n';

      orders.forEach(o => {
        const row = [
          `"${o.id}"`,
          `"${o.date || ''}"`,
          `"${(o.customerName || '').replace(/"/g, '""')}"`,
          `"${o.phone || ''}"`,
          `"${(o.city || '').replace(/"/g, '""')}"`,
          `"${(o.address || '').replace(/"/g, '""')}"`,
          `"${(o.product || '').replace(/"/g, '""')}"`,
          o.price || 1280,
          o.deliveryFee || 60,
          o.total || 1340,
          `"${o.status || 'Pending'}"`
        ];
        csvContent += row.join(',') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute('href', url);
      link.setAttribute('download', `HOCO_Cooler_Orders_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('CSV ডাউনলোড সম্পন্ন!', 'অর্ডার ফাইলটি আপনার কম্পিউটারে সেভ হয়েছে।');
    });
  }

  /* ===================================================================
     8. REAL-TIME STORAGE EVENT SYNC
     =================================================================== */
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      renderDashboard();
      showToast('নতুন অর্ডার এসেছে!', 'কাস্টমার এইমাত্র ওয়েবসাইট থেকে একটি নতুন অর্ডার দিয়েছেন।');
    }
  });

  /* ===================================================================
     9. TOAST NOTIFICATION UTILITY
     =================================================================== */
  function showToast(title, desc) {
    if (!toast) return;
    if (toastTitle) toastTitle.textContent = title;
    if (toastDesc) toastDesc.textContent = desc;

    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
    }, 4500);
  }

  // Initialize
  checkSessionAuth();

});
