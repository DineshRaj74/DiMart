document.addEventListener("DOMContentLoaded", async () => {
  const productsTable = document.getElementById("adminProductsTable");
  const productForm = document.getElementById("productForm");
  const modalEl = document.getElementById("productModal");
  const modal = modalEl && typeof bootstrap !== "undefined" ? new bootstrap.Modal(modalEl) : null;
  let products = await Dimart.getProducts();

  function syncMetrics() {
    document.getElementById("metricProducts").textContent = products.length;
    document.getElementById("metricOrders").textContent = JSON.parse(localStorage.getItem("dimart_admin_orders") || "[]").length || 18;
    document.getElementById("metricUsers").textContent = "1,248";
    document.getElementById("metricRevenue").textContent = "Rs. 8.7L";
  }

  function renderProducts() {
    productsTable.innerHTML = products.map((product) => `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-3">
            <img src="${product.image}" alt="${product.name}" width="54" height="68" style="object-fit:cover;border-radius:8px;">
            <div>
              <strong>${product.name}</strong>
              <div class="text-muted-dm small">${product.badge}</div>
            </div>
          </div>
        </td>
        <td>${product.category}</td>
        <td>${Dimart.formatPrice(product.price)}</td>
        <td>${product.discount}%</td>
        <td>${product.rating}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary" type="button" data-admin-action="edit" data-id="${product.id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger" type="button" data-admin-action="delete" data-id="${product.id}">Delete</button>
        </td>
      </tr>
    `).join("");
    syncMetrics();
  }

  function openProductForm(product = null) {
    productForm.reset();
    document.getElementById("productId").value = product?.id || "";
    document.getElementById("productName").value = product?.name || "";
    document.getElementById("productCategory").value = product?.category || "Fashion";
    document.getElementById("productPrice").value = product?.price || "";
    document.getElementById("productComparePrice").value = product?.compareAtPrice || "";
    document.getElementById("productDiscount").value = product?.discount || "";
    document.getElementById("productRating").value = product?.rating || "";
    document.getElementById("productBadge").value = product?.badge || "";
    document.getElementById("productImage").value = product?.image || "";
    document.getElementById("productDescription").value = product?.description || "";
    document.getElementById("productModalLabel").textContent = product ? "Edit product" : "Add product";
    if (modal) {
      modal.show();
    } else {
      modalEl.classList.add("show");
      modalEl.style.display = "block";
    }
  }

  document.getElementById("addProductButton")?.addEventListener("click", () => openProductForm());
  document.getElementById("addProductButtonSecondary")?.addEventListener("click", () => openProductForm());

  productsTable?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-admin-action]");
    if (!button) {
      return;
    }
    const id = Number(button.dataset.id);

    if (button.dataset.adminAction === "edit") {
      openProductForm(products.find((product) => Number(product.id) === id));
    }

    if (button.dataset.adminAction === "delete") {
      products = products.filter((product) => Number(product.id) !== id);
      Dimart.setProducts(products);
      renderProducts();
      Dimart.toast("Product deleted.");
    }
  });

  productForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    productForm.classList.add("was-validated");

    if (!productForm.checkValidity()) {
      return;
    }

    const id = Number(document.getElementById("productId").value);
    const product = {
      id: id || Math.max(...products.map((item) => Number(item.id)), 0) + 1,
      name: document.getElementById("productName").value.trim(),
      category: document.getElementById("productCategory").value,
      price: Number(document.getElementById("productPrice").value),
      compareAtPrice: Number(document.getElementById("productComparePrice").value),
      discount: Number(document.getElementById("productDiscount").value),
      rating: Number(document.getElementById("productRating").value),
      badge: document.getElementById("productBadge").value.trim(),
      image: document.getElementById("productImage").value.trim(),
      description: document.getElementById("productDescription").value.trim()
    };

    products = id
      ? products.map((item) => Number(item.id) === id ? product : item)
      : [...products, product];

    Dimart.setProducts(products);
    renderProducts();
    productForm.classList.remove("was-validated");
    if (modal) {
      modal.hide();
    } else {
      modalEl.classList.remove("show");
      modalEl.style.display = "none";
    }
    Dimart.toast(id ? "Product updated." : "Product added.");
  });

  renderProducts();
});
