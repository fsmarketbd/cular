/**
 * HOCO Semiconductor Cooler - Interactive Liquid Glass Experience
 * Includes Canvas Particle System, 3D Tilt, Web Audio Synth, and Real-Time Cooling Sim
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ===================================================================
     1. FROST & SNOW PARTICLE CANVAS SYSTEM
     =================================================================== */
  const canvas = document.getElementById('frost-canvas');
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const PARTICLE_COUNT = 65;

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class IceParticle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * -height;
      this.size = Math.random() * 3.5 + 1;
      this.speedY = Math.random() * 1.2 + 0.4;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.opacity = Math.random() * 0.7 + 0.2;
      this.pulse = Math.random() * Math.PI;
      this.pulseSpeed = Math.random() * 0.03 + 0.01;
      this.isCrystal = Math.random() > 0.6;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.pulse += this.pulseSpeed;

      if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
        this.reset();
        this.y = -10;
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      const currentOpacity = this.opacity * (0.8 + 0.2 * Math.sin(this.pulse));
      ctx.fillStyle = `rgba(200, 240, 255, ${currentOpacity})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(77, 225, 255, 0.8)';

      if (this.isCrystal) {
        // Draw 6-arm mini snowflake
        ctx.strokeStyle = `rgba(220, 248, 255, ${currentOpacity})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(-this.size * 1.6, 0);
          ctx.lineTo(this.size * 1.6, 0);
          ctx.stroke();
          ctx.rotate(Math.PI / 3);
        }
      } else {
        // Soft glowing particle orb
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = new IceParticle();
    p.y = Math.random() * height; // initial spread
    particles.push(p);
  }

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  /* ===================================================================
     2. WEB AUDIO API SYNTHESIZER (Ice Clicks & Cyber Hum)
     =================================================================== */
  let audioCtx = null;
  let audioEnabled = false;
  const audioToggle = document.getElementById('ambient-audio-toggle');

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  if (audioToggle) {
    audioToggle.addEventListener('change', (e) => {
      audioEnabled = e.target.checked;
      if (audioEnabled) {
        initAudio();
        playChime(880, 'sine', 0.15);
      }
    });
  }

  function playChime(freq = 600, type = 'sine', duration = 0.1) {
    if (!audioEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (err) {
      // Audio autoplay policy
    }
  }

  /* ===================================================================
     3. 3D LIQUID GLASS TILT EFFECT
     =================================================================== */
  const tiltCards = document.querySelectorAll('[data-tilt]');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

  /* ===================================================================
     4. REAL-TIME COOLING LEVEL SIMULATOR
     =================================================================== */
  const verticalSlider = document.getElementById('cooling-level-range');
  const sliderFill = document.getElementById('slider-fill');
  const levelDisplay = document.getElementById('level-display');
  const levelModeText = document.getElementById('level-mode-text');
  const sensorTemp = document.getElementById('sensor-temp');
  const tempDropDisplay = document.getElementById('temp-drop-display');
  const coolerAura = document.getElementById('cooler-aura');
  const benchSlider = document.getElementById('bench-speed-slider');
  const benchLevelVal = document.getElementById('bench-level-val');
  const benchTempVal = document.getElementById('bench-temp-val');
  const powerSwitch = document.getElementById('cooler-power-switch');
  const powerStatusLabel = document.getElementById('power-status-label');

  let isCoolingActive = true;

  function updateCoolingState(levelVal) {
    const val = parseInt(levelVal, 10);

    // Update visuals
    if (levelDisplay) levelDisplay.textContent = val;
    if (benchLevelVal) benchLevelVal.textContent = val + '%';
    if (verticalSlider) verticalSlider.value = val;
    if (benchSlider) benchSlider.value = val;

    // Update Slider track fill percentage
    if (sliderFill) {
      sliderFill.style.height = val + '%';
    }

    if (!isCoolingActive) {
      if (sensorTemp) sensorTemp.textContent = '38°C';
      if (tempDropDisplay) tempDropDisplay.textContent = '0°C';
      if (benchTempVal) benchTempVal.textContent = '38°C (কুলিং অফ)';
      if (coolerAura) coolerAura.style.opacity = '0.08';
      return;
    }

    // Calculate simulated core temperature
    // 100% -> ~8°C to 12°C
    // 10%  -> ~32°C
    const calculatedTemp = Math.round(38 - (val / 100) * 28);
    const dropAmount = 38 - calculatedTemp;

    if (sensorTemp) {
      sensorTemp.textContent = `${calculatedTemp}°C`;
      sensorTemp.style.color = calculatedTemp <= 14 ? '#38ef7d' : (calculatedTemp <= 22 ? '#4de1ff' : '#ff9900');
    }

    if (tempDropDisplay) {
      tempDropDisplay.textContent = `-${dropAmount}°C`;
    }

    if (benchTempVal) {
      const mode = calculatedTemp <= 12 ? '(আইসি ফ্রিজ - বরফ ঠান্ডা)' : (calculatedTemp <= 22 ? '(গেমিং মোড)' : '(নরমাল মোড)');
      benchTempVal.textContent = `${calculatedTemp}°C ${mode}`;
    }

    // Mode labels
    if (levelModeText) {
      if (val >= 85) {
        levelModeText.textContent = 'TURBO FREEZE';
        levelModeText.style.color = '#a3e8ff';
      } else if (val >= 50) {
        levelModeText.textContent = 'ARCTIC CHILL';
        levelModeText.style.color = '#4de1ff';
      } else {
        levelModeText.textContent = 'ECO BALANCE';
        levelModeText.style.color = '#94b8d7';
      }
    }

    // Aura speed & glow adjustment
    if (coolerAura) {
      const speed = Math.max(1.5, 12 - (val / 10));
      coolerAura.style.animationDuration = `${speed.toFixed(1)}s`;
      coolerAura.style.opacity = (0.3 + (val / 100) * 0.45).toFixed(2);
    }

    playChime(400 + val * 6, 'sine', 0.05);
  }

  // Bind vertical slider
  if (verticalSlider) {
    verticalSlider.addEventListener('input', (e) => {
      updateCoolingState(e.target.value);
    });
  }

  // Bind bench slider
  if (benchSlider) {
    benchSlider.addEventListener('input', (e) => {
      updateCoolingState(e.target.value);
    });
  }

  // Power Switch Toggle
  if (powerSwitch) {
    powerSwitch.addEventListener('change', (e) => {
      isCoolingActive = e.target.checked;
      if (powerStatusLabel) {
        powerStatusLabel.textContent = isCoolingActive ? 'COOLING ON' : 'STANDBY OFF';
        powerStatusLabel.style.color = isCoolingActive ? 'var(--cyan-frost)' : 'var(--text-muted)';
      }
      playChime(isCoolingActive ? 750 : 320, 'triangle', 0.2);
      updateCoolingState(verticalSlider ? verticalSlider.value : 100);
    });
  }

  // Init state
  updateCoolingState(100);

  /* ===================================================================
     5. RGB LIGHTING PRESETS
     =================================================================== */
  const rgbDots = document.querySelectorAll('.rgb-color-dots .dot');
  const rgbChips = document.querySelectorAll('.glass-chip-btn');

  function setRGBTheme(theme) {
    if (!coolerAura) return;

    if (theme === 'rainbow') {
      coolerAura.style.background = `conic-gradient(
        from 0deg,
        #ff0055, #ff9900, #ffee00, #00ff66, #00f2fe, #4facfe, #b176ff, #ff0055
      )`;
    } else if (theme === 'ice' || theme === 'cyan') {
      coolerAura.style.background = `conic-gradient(
        from 0deg,
        #00f2fe, #4facfe, #ffffff, #00aaff, #00f2fe
      )`;
    } else if (theme === 'fire' || theme === 'purple') {
      coolerAura.style.background = `conic-gradient(
        from 0deg,
        #c084fc, #ff007f, #8a2be2, #00f2fe, #c084fc
      )`;
    } else if (theme === 'emerald') {
      coolerAura.style.background = `conic-gradient(
        from 0deg,
        #00ff88, #00b0ff, #11998e, #38ef7d, #00ff88
      )`;
    }

    playChime(640, 'triangle', 0.12);
  }

  rgbDots.forEach(dot => {
    dot.addEventListener('click', () => {
      rgbDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      setRGBTheme(dot.dataset.color);
    });
  });

  rgbChips.forEach(chip => {
    chip.addEventListener('click', () => {
      rgbChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      setRGBTheme(chip.dataset.preset);
    });
  });

  /* ===================================================================
     6. ORDER MODAL & CHECKOUT CALCULATOR
     =================================================================== */
  const openModalBtn = document.getElementById('open-order-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const modal = document.getElementById('order-modal');
  const citySelect = document.getElementById('cust-city');
  const finalTotal = document.getElementById('final-total');
  const checkoutForm = document.getElementById('checkout-form');
  const orderToast = document.getElementById('order-toast');

  const PRODUCT_PRICE = 1280;

  function calculateTotal() {
    if (!citySelect || !finalTotal) return;
    const deliveryFee = citySelect.value === 'dhaka' ? 60 : 120;
    const total = PRODUCT_PRICE + deliveryFee;
    finalTotal.textContent = `${total} ৳`;
  }

  if (openModalBtn) {
    openModalBtn.addEventListener('click', () => {
      modal.classList.add('active');
      calculateTotal();
      playChime(520, 'sine', 0.15);
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
    }
  });

  if (citySelect) {
    citySelect.addEventListener('change', calculateTotal);
  }

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Collect customer information
      const custName = document.getElementById('cust-name').value.trim();
      const custPhone = document.getElementById('cust-phone').value.trim();
      const custCityVal = citySelect ? citySelect.value : 'dhaka';
      const custCityText = custCityVal === 'dhaka' ? 'ঢাকার ভিতরে (৬০ ৳)' : 'ঢাকার বাইরে (১২০ ৳)';
      const custAddress = document.getElementById('cust-address').value.trim();
      const deliveryFee = custCityVal === 'dhaka' ? 60 : 120;
      const totalAmount = PRODUCT_PRICE + deliveryFee;
      const orderId = 'HC-' + Math.floor(100000 + Math.random() * 900000);

      // Create structured order object
      const newOrder = {
        id: orderId,
        date: new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }),
        timestamp: Date.now(),
        customerName: custName,
        phone: custPhone,
        city: custCityText,
        address: custAddress,
        product: 'HOCO Semiconductor Phone Cooler (RGB Edition)',
        price: PRODUCT_PRICE,
        deliveryFee: deliveryFee,
        total: totalAmount,
        status: 'Pending'
      };

      // Save order to LocalStorage
      try {
        const STORAGE_KEY = 'hoco_cooler_orders';
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        existing.unshift(newOrder);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
        
        // Dispatch custom storage event for same-window updates
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error('Error saving order:', err);
      }

      // Generate structured WhatsApp message for store owner
      const OWNER_WHATSAPP = '8801880868680';
      const waMessageText = 
`❄️ *নতুন অর্ডার রিকোয়েস্ট (HOCO Cooler)* ❄️
━━━━━━━━━━━━━━━━━━
🆔 *অর্ডার আইডি:* #${orderId}
👤 *কাস্টমারের নাম:* ${custName}
📞 *ফোন নাম্বার:* ${custPhone}
📍 *এলাকা:* ${custCityText}
🏠 *সম্পূর্ণ ঠিকানা:* ${custAddress}
━━━━━━━━━━━━━━━━━━
📦 *প্রোডাক্ট:* HOCO Semiconductor Cooler (RGB)
💵 *প্রোডাক্ট মূল্য:* ${PRODUCT_PRICE} ৳
🚚 *ডেলিভারি চার্জ:* ${deliveryFee} ৳
💰 *সর্বমোট প্রদেয়:* ${totalAmount} ৳ (ক্যাশ অন ডেলিভারি)
━━━━━━━━━━━━━━━━━━
_আমি ওয়েবসাইট থেকে এই অর্ডারটি কনফার্ম করছি।_`;

      const waUrl = `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(waMessageText)}`;

      // Update toast WhatsApp button link
      const toastWaBtn = document.getElementById('toast-wa-btn');
      if (toastWaBtn) {
        toastWaBtn.href = waUrl;
      }

      modal.classList.remove('active');
      checkoutForm.reset();

      // Show success toast
      if (orderToast) {
        orderToast.classList.add('active');
        playChime(1040, 'triangle', 0.25);
        setTimeout(() => {
          orderToast.classList.remove('active');
        }, 7000);
      }

      // Automatically redirect/open WhatsApp with the order details
      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 600);
    });
  }

  /* ===================================================================
     7. SECRET ADMIN ACCESS (HIDDEN FROM CUSTOMERS)
     ===================================================================
     - Ordinary customers see NO admin links on the page.
     - Method 1: Press keyboard combination Ctrl + Shift + A
     - Method 2: Click 4 times quickly on the top "HOCO.GAMING" brand logo
     - Method 3: Direct URL: admin-portal.html (Protected by Security PIN)
  */
  
  // Method 1: Keyboard shortcut Ctrl + Shift + A
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      window.location.href = 'admin-portal.html';
    }
  });

  // Method 2: Secret 4 clicks on Logo
  const brandLogo = document.querySelector('.brand-badge');
  let clickCount = 0;
  let clickTimer = null;

  if (brandLogo) {
    brandLogo.style.cursor = 'pointer';
    brandLogo.addEventListener('click', () => {
      clickCount++;
      clearTimeout(clickTimer);

      if (clickCount >= 4) {
        clickCount = 0;
        window.location.href = 'admin-portal.html';
      } else {
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, 1200);
      }
    });
  }

});
