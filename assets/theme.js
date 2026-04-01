document.addEventListener("DOMContentLoaded", () => {
  console.log("JS loaded");

  // Main cart drawer elements
  const cartDrawer = document.querySelector(".cart-drawer");
  const cartOverlay = document.querySelector(".cart-overlay");

  // Opens the cart drawer and shows the overlay
  function openCartDrawer() {
    if (!cartDrawer || !cartOverlay) return;

    cartDrawer.classList.add("is-open");
    cartDrawer.setAttribute("aria-hidden", "false");
    cartOverlay.classList.add("is-visible");
  }

  // Closes the cart drawer and hides the overlay
  function closeCartDrawer() {
    if (!cartDrawer || !cartOverlay) return;

    cartDrawer.classList.remove("is-open");
    cartDrawer.setAttribute("aria-hidden", "true");
    cartOverlay.classList.remove("is-visible");
  }

  // Sends one product to the Shopify cart
  function addToCart(variantId) {
    return fetch("/cart/add.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        id: variantId,
        quantity: 1,
      }),
    }).then(async (response) => {
      // If Shopify returns an error, read the response text and throw it
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      return response.json();
    });
  }

  // Updates the quantity of an existing cart item
  function updateCartItem(key, quantity) {
    return fetch("/cart/change.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        id: key,
        quantity: quantity,
      }),
    }).then((response) => response.json());
  }

  // Gets the current cart from Shopify
  function getCart() {
    return fetch("/cart.js", {
      headers: {
        "Accept": "application/json",
      },
    }).then((response) => response.json());
  }

  // Clears the whole cart
  function clearCart() {
    return fetch("/cart/clear.js", {
      method: "POST",
      headers: {
        "Accept": "application/json",
      },
    }).then((response) => response.json());
  }

  // Updates the small counter in the header/cart link
  function updateCartCount(cart) {
    const cartCount = document.querySelector(".cart-count");

    if (!cartCount) return;

    cartCount.textContent = cart.item_count;
  }

  function syncProductCardQuantities(cart) {
    const selectors = document.querySelectorAll(".quantity-selector");

    selectors.forEach((selector) => {
      const variantId = selector.dataset.variantId;
      const valueElement = selector.querySelector(".quantity-selector__value");

      if (!variantId || !valueElement) return;

      let matchingItem = null;

      for (const item of cart.items) {
        if (String(item.variant_id) === String(variantId)) {
          matchingItem = item;
          break;
        }
      }

      if (matchingItem) {
        valueElement.textContent = matchingItem.quantity;
      } else {
        valueElement.textContent = 0;
      }
    });
  }


  // Formats money from pence to pounds
  function formatMoney(cents) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(cents / 100);
  }

  // Renders all drawer content using the current Shopify cart
  function renderCart(cart) {
    const cartItemsContainer = document.querySelector(".cart-drawer__items");
    const cartSubtotal = document.querySelector(".cart-drawer__subtotal-price");
    const cartItemsRow = document.querySelector(".cart-items-row");
    const cartTotalItems = document.querySelector(".cart-total-items");
    const checkoutButton = document.querySelector(".cart-checkout-button");
    const pointsMessage = document.querySelector(".cart-points-message");

    // Always update the header counter first
    updateCartCount(cart);
    syncProductCardQuantities(cart);

    // Stop if the main drawer elements do not exist
    if (!cartItemsContainer || !cartSubtotal) return;

    // Empty cart state
    // Show empty message, reset subtotal, and hide the extra footer elements
    if (cart.item_count === 0) {
      cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
      cartSubtotal.textContent = formatMoney(0);

      if (cartItemsRow) {
        cartItemsRow.style.display = "none";
      }

      if (pointsMessage) {
        pointsMessage.style.display = "none";
      }

      if (checkoutButton) {
        checkoutButton.style.display = "none";
      }

      return;
    }

    // Cart with items
    // Build the HTML for each item inside the drawer
    cartItemsContainer.innerHTML = cart.items
      .map((item) => {
        return `
          <div class="cart-drawer__item">
            <div class="cart-drawer__item-title">
              <p>${item.product_title}</p>
            </div>
            <div class="cart-drawer__item-price">
              <p>Quantity: ${item.quantity}</p>
              <p>${formatMoney(item.final_line_price)}</p>
            </div>
          </div>
        `;
      })
      .join("");

    // Update the subtotal amount
    cartSubtotal.textContent = formatMoney(cart.total_price);

    // Show the total number of items in the footer
    if (cartItemsRow && cartTotalItems) {
      cartTotalItems.textContent = `${cart.item_count} item${cart.item_count !== 1 ? "s" : ""}`;
      cartItemsRow.style.display = "block";
    }
    // Show points message. Rule: every full £10 gives 1 point, rounded down
    if (pointsMessage) {
      const poundsTotal = cart.total_price / 100;
      const earnedPoints = Math.floor(poundsTotal / 10);

      pointsMessage.textContent = `Earn ${earnedPoints} point${earnedPoints !== 1 ? "s" : ""} with this order`;
      pointsMessage.style.display = "block";
    }

    // Show checkout button only when there are items in the cart
    if (checkoutButton) {
      checkoutButton.style.display = "block";
    }
  }

  // Handles clicks anywhere on the page
  document.addEventListener("click", (event) => {
    const plusButton = event.target.closest(".quantity-selector__button--plus");
    const minusButton = event.target.closest(".quantity-selector__button--minus");
    const openCartButton = event.target.closest(".open-cart-button");
    const clearCartButton = event.target.closest(".cart-drawer__clear");
    const closeCartButton = event.target.closest(".cart-drawer__close");
    const overlay = event.target.closest(".cart-overlay");

    // PLUS BUTTON
    // Adds one unit of the product to the cart
    if (plusButton) {
      const selector = plusButton.closest(".quantity-selector");
      const variantId = selector?.dataset.variantId;
      const valueElement = selector?.querySelector(".quantity-selector__value");

      if (!valueElement || !variantId) return;

      // Update the product card quantity immediately in the UI
      let currentValue = parseInt(valueElement.textContent, 10) || 0;
      currentValue += 1;
      valueElement.textContent = currentValue;

      // Update Shopify, then refresh the drawer and open it
      addToCart(variantId)
        .then(() => getCart())
        .then((cart) => {
          renderCart(cart);
          openCartDrawer();
        })
        .catch((error) => {
          console.error("Error adding to cart:", error);
        });

      return;
    }

    // MINUS BUTTON. Reduces the quantity of a product already in the cart
    if (minusButton) {
      const selector = minusButton.closest(".quantity-selector");
      const variantId = selector?.dataset.variantId;
      const valueElement = selector?.querySelector(".quantity-selector__value");

      if (!variantId || !valueElement) return;

      getCart()
        .then((cart) => {
          // Find the matching cart item by variant ID
          const item = cart.items.find(
            (item) => String(item.variant_id) === String(variantId)
          );

          // If item is not in the cart, stop
          if (!item) return null;

          // Reduce quantity by 1
          return updateCartItem(item.key, item.quantity - 1);
        })
        .then(() => getCart())
        .then((cart) => {
          // Find the updated item after Shopify changed the cart
          const updatedItem = cart.items.find(
            (item) => String(item.variant_id) === String(variantId)
          );

          // Update the number shown on the product card
          if (updatedItem) {
            valueElement.textContent = updatedItem.quantity;
          } else {
            valueElement.textContent = 0;
          }

          // Refresh drawer and open it
          renderCart(cart);
          openCartDrawer();
        })
        .catch((error) => {
          console.error("Error removing from cart:", error);
        });

      return;
    }

    // OPEN CART BUTTON. Loads the latest cart and opens the drawer
    if (openCartButton) {
      getCart().then((cart) => {
        renderCart(cart);
        openCartDrawer();
      });
      return;
    }

    // CLEAR CART BUTTON
    if (clearCartButton) {
      const confirmClear = window.confirm("Are you sure you want to clear your cart?");

      if (!confirmClear) return;

      clearCart()
        .then((cart) => {
          renderCart(cart);
        })
        .catch((error) => {
          console.error("Error clearing cart:", error);
        });

      return;
    }

    // CLOSE CART DRAWER. Closes clicking the overlay
    if (closeCartButton || overlay) {
      closeCartDrawer();
    }
  });

  // On page load, close the drawer first
  closeCartDrawer();

  getCart().then((cart) => {
    renderCart(cart);
  });

});
