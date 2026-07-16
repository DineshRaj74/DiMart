$(async function () {
  const $cartList = $("#cartList");
  const $emptyCart = $("#emptyCart");
  const $subtotalEl = $("#cartSubtotal");
  const $shippingEl = $("#cartShipping");
  const $taxEl = $("#cartTax");
  const $totalEl = $("#cartTotal");
  const $checkoutButton = $("#checkoutButton");

  const buyNowProduct = new URLSearchParams(window.location.search).get("buy");
  if (buyNowProduct) {
    await Dimart.addToCart(buyNowProduct);
    window.history.replaceState({}, "", "cart.html");
  }

  function totals(cart) {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal === 0 || subtotal >= 3999 ? 0 : 149;
    const tax = Math.round(subtotal * 0.05);
    return { subtotal, shipping, tax, total: subtotal + shipping + tax };
  }

  function cartLineTemplate(item) {
    return `
      <article class="cart-line" data-cart-id="${item.id}">
        <div class="cart-line-media">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-line-main">
          <div class="cart-line-top">
            <div>
              <span class="cart-category">${item.category}</span>
              <h2>${item.name}</h2>
              <p>${item.badge || "Dimart select"} / Standard fit</p>
            </div>
            <strong>${Dimart.formatPrice(item.price * item.quantity)}</strong>
          </div>
          <div class="cart-line-bottom">
            <div class="qty-control" aria-label="Quantity controls for ${item.name}">
              <button type="button" data-cart-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">-</button>
              <span>${item.quantity}</span>
              <button type="button" data-cart-action="increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
            </div>
            <button class="remove-item-btn" type="button" data-cart-action="remove" data-id="${item.id}">
              <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
                <path d="M7 21c-.6 0-1.1-.2-1.5-.6S5 19.6 5 19V7H4V5h5V4h6v1h5v2h-1v12c0 .6-.2 1.1-.6 1.5s-.9.5-1.5.5H7Zm2-4h2V9H9v8Zm4 0h2V9h-2v8Z"></path>
              </svg>
              Remove
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function render() {
    const cart = Dimart.getCart();
    if ($cartList.length === 0) {
      return;
    }

    $emptyCart.toggleClass("d-none", cart.length > 0);
    $cartList.html(cart.map(cartLineTemplate).join(""));

    const summary = totals(cart);
    $subtotalEl.text(Dimart.formatPrice(summary.subtotal));
    $shippingEl.text(summary.shipping === 0 ? "Free" : Dimart.formatPrice(summary.shipping));
    $taxEl.text(Dimart.formatPrice(summary.tax));
    $totalEl.text(Dimart.formatPrice(summary.total));
    $checkoutButton.prop("disabled", cart.length === 0);
    Dimart.updateCartCount();
  }

  $(document).on("click", "[data-cart-action]", function () {
    const $button = $(this);
    const id = Number($button.data("id"));
    const cart = Dimart.getCart();
    const item = cart.find((line) => Number(line.id) === id);
    const action = $button.data("cartAction");

    if (action === "remove") {
      Dimart.setCart(cart.filter((line) => Number(line.id) !== id));
      Dimart.toast("Item removed from cart.");
    }

    if (item && action === "increase") {
      item.quantity += 1;
      Dimart.setCart(cart);
    }

    if (item && action === "decrease") {
      item.quantity -= 1;
      Dimart.setCart(item.quantity < 1 ? cart.filter((line) => Number(line.id) !== id) : cart);
    }

    render();
  });

  $checkoutButton.on("click", () => {
    const cart = Dimart.getCart();
    if (!cart.length) {
      return;
    }
    localStorage.setItem("dimart_recent_order", JSON.stringify({ createdAt: new Date().toISOString(), items: cart }));
    Dimart.setCart([]);
    render();
    Dimart.toast("Order placed. Your Dimart package is being prepared.");
  });

  render();
});
