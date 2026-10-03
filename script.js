document.addEventListener("DOMContentLoaded", () => {
  // UI elemanları (sepetsiz sayfada da hata vermesin diye guard'lı)
  const cartItemsList = document.getElementById("cart-items");
  const cartTotalPrice = document.getElementById("cart-total-price");

  // Sepeti yükle
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  renderCart();

  // OLAY DELEGASYONU: .add-to-cart tıklamalarını yakalar
  document.addEventListener("click", (e) => {
    // Sepete ekle
    const addBtn = e.target.closest(".add-to-cart");
    if (addBtn) {
      const productCard = addBtn.closest(".product-card");
      if (!productCard) {
        console.warn("Ürün kartı (.product-card) bulunamadı.");
        return;
      }

      const nameEl = productCard.querySelector("h3, .product-name");
      const priceEl = productCard.querySelector(".price");
      const imgEl = productCard.querySelector("img");

      const name = nameEl ? nameEl.textContent.trim() : "Ürün";
      const priceText = priceEl ? priceEl.textContent : "0";
      const price = parsePrice(priceText);
      const image = imgEl ? imgEl.src : "";
      const category = productCard.dataset.category || "genel";

      // Aynı isim+kategori varsa miktarı artır
      const ix = cart.findIndex(
        (it) => it.name === name && it.category === category
      );
      if (ix > -1) cart[ix].quantity += 1;
      else cart.push({ name, category, price, image, quantity: 1 });

      saveAndRender();
    }

    // Sepetten sil
    const removeBtn = e.target.closest(".remove-item");
    if (removeBtn) {
      const index = Number(removeBtn.dataset.index);
      if (!Number.isNaN(index)) {
        cart.splice(index, 1);
        saveAndRender();
      }
    }

    // Miktar +/- (opsiyonel, varsa çalışır)
    const qtyBtn = e.target.closest("[data-qty]");
    if (qtyBtn) {
      const index = Number(qtyBtn.dataset.index);
      const delta = qtyBtn.dataset.qty === "inc" ? 1 : -1;
      if (!Number.isNaN(index) && cart[index]) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) cart.splice(index, 1);
        saveAndRender();
      }
    }
  });

  // --- Yardımcılar ---
  function parsePrice(text) {
    if (!text) return 0;
    // yazılardaki farklılıkları normalize eder
   let t = text.replace(/\s|TL|₺/gi, ""); 
    
  t = t.replace(/\.(?=\d{3}(\D|$))/g, "");
    
   t = t.replace(",", ".");
    const n = parseFloat(t);
    return Number.isFinite(n) ? n : 0;
  }

  function saveAndRender() {
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }

  function renderCart() {
    if (!cartItemsList || !cartTotalPrice) return; 

    cartItemsList.innerHTML = "";
    if (cart.length === 0) {
      cartItemsList.innerHTML = `<li class="empty">Sepetiniz boş.</li>`;
      cartTotalPrice.textContent = "0₺";
      return;
    }

    let total = 0;
    cart.forEach((item, index) => {
      const qty = item.quantity || 1;
      total += item.price * qty;

      const li = document.createElement("li");
      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.style.alignItems = "center";
      li.style.gap = "8px";
      li.style.padding = "8px 0";
      li.style.borderBottom = "1px solid #eee";

      li.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;">
          ${item.image ? `<img src="${item.image}" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:6px;">` : ""}
          <div>
            <div class="name" style="font-weight:600">${item.name}</div>
            <div class="meta" style="font-size:12px;color:#666">${item.category || ""}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <div class="qty" style="display:flex;align-items:center;gap:6px;">
            <button type="button" data-qty="dec" data-index="${index}" style="padding:2px 8px;">-</button>
            <span>${qty}</span>
            <button type="button" data-qty="inc" data-index="${index}" style="padding:2px 8px;">+</button>
          </div>
          <div class="price" style="min-width:80px;text-align:right;">${(item.price * qty).toFixed(2)}₺</div>
          <button class="remove-item" data-index="${index}" title="Kaldır">❌</button>
        </div>
      `;
      cartItemsList.appendChild(li);
    });

    cartTotalPrice.textContent = total.toFixed(2) + "₺";
  }
});
// --- Ürün arama kodu ---
document.getElementById("search-btn").addEventListener("click", () => {
    const query = document.getElementById("search-input").value.toLowerCase();
    const products = document.querySelectorAll(".product-card");

    products.forEach(product => {
        const name = product.querySelector("h3, h2").textContent.toLowerCase();
        if (name.includes(query) || query === "") {
            product.style.display = "block";
        } else {
            product.style.display = "none";
        }
    });
});