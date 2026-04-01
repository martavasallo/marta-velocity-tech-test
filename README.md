<img src="./velocity-tech-test.png" alt="drawing" width="100%"/>

# Shopify Cart Drawer Implementation

A Shopify-based collection page experience with dynamic cart functionality built using the AJAX API.

## Overview
This project is a Shopify-based ecommerce implementation focused on the collection page experience. It allows users to browse products, adjust quantities, and add items to the cart directly from the collection page.

A custom cart drawer is implemented using Shopify’s AJAX API, enabling users to view and manage their cart dynamically, including updating item quantities and cart state, without requiring a page reload.

## Approach
The implementation was built progressively, focusing on getting a complete end-to-end flow working first, and then refining each part.

1. **Render product cards**
   Started by building the collection page and identifying key interactions such as quantity controls and add-to-cart actions. The structure was kept simple to ensure the core functionality was reliable.

2. **Implement quantity controls**
   Added plus and minus controls to allow users to update product quantities directly from the collection page. This helped separate UI behaviour from cart logic.

3. **Integrate Shopify AJAX API**
   Connected cart functionality using Shopify’s AJAX API, enabling products to be added and updated without a page reload. The focus here was on ensuring correct communication with the cart endpoints.

4. **Build cart drawer UI**
   Created the cart drawer interface to display cart contents in a dedicated panel, driven by the data returned from the API.

5. **Synchronise cart state**
   Implemented cart fetching and re-rendering after each interaction to keep item quantities, totals, points, and the cart counter consistent across the UI.

Throughout the process, I prioritised clarity and simplicity over premature optimisation. Some edge cases and enhancements were intentionally kept minimal to stay within scope and to allow for discussion during the interview.

## Features

- **Add to cart from collection page**
  Users can add products directly from the collection page without navigating to a product detail page.

- **Direct quantity updates from the collection page**
  Product quantities can be increased or decreased directly from the collection page using plus and minus controls, with each interaction updating the cart immediately.

- **Cart drawer with live updates**
  A custom cart drawer allows users to view and manage their cart without leaving the page. Cart data is updated dynamically after each interaction to reflect the current state.

- **Cart state synchronisation**
  Cart contents, totals, and item count are updated after each interaction to ensure consistency across the UI.

- **Clear cart functionality with confirmation**
  A clear action is available within the cart drawer, allowing users to remove all items at once. A confirmation prompt is shown before clearing the cart to prevent accidental actions. The cart is cleared via Shopify’s cart API and the UI is immediately re-synchronised, ensuring item quantities, totals, and the cart counter remain consistent.

- **"New" product badge**
  A "New" badge is displayed based on the product creation date (`product.created_at`). The logic compares the current date with the product’s creation date and shows the badge if the product falls within a defined time window.

  As all products in this project share the same creation date, the threshold was adjusted to ensure the badge is visible for demonstration purposes. In a production environment, this could also be driven by product tags or metafields to allow greater control.

- **Cart item count indicator**
  The header includes a live-updating cart counter reflecting the current number of items, which also serves as a trigger to open the cart drawer.

- **Points earned based on cart total**
  The cart includes a message showing points earned, calculated as 1 point per £10 of the cart total (rounded down). The value updates dynamically as items are added or removed.

## Tech Stack
- Shopify (Liquid)
- JavaScript (Vanilla)
- HTML / CSS
- Shopify AJAX API

## Setup
1. Clone the repository
2. Run `shopify theme serve`
3. Open the local development URL

## Future Improvements & Approach

The current implementation focuses on core functionality. The following improvements would enhance the overall user experience and scalability of the solution:

- **Wishlist functionality**
  The wishlist button is currently UI-only. To implement it fully, I would add a separate favourites section within the cart drawer, clearly separated from cart items and excluded from cart totals.

  Each saved item would include an Add to cart action to move it into the main cart flow, along with a Remove from favourites action for independent management.

- **Quantity controls inside the cart drawer**
  A further improvement would be to add plus and minus controls directly to each cart item within the cart drawer, allowing users to adjust quantities without returning to the collection page.

  My approach would be to connect these controls to Shopify’s cart update endpoints, then re-fetch and re-render the cart after each interaction so item quantities, totals, points earned, and the cart counter remain in sync across the interface.

- **Display product size (variant information)**
  The current implementation does not display size information. After checking Shopify’s documentation, it looks like size is not a direct field on the product and is instead handled through variants.

  To support this, I would display the size of each product on the product card based on its variant data, ensuring the information shown matches the version of the product being added to the cart.

- **Non-blocking cart feedback (toast message)**
  Currently, the cart drawer opens every time a product is added or removed, providing confirmation to the user. However, this interrupts the flow, especially when adding multiple items in quick succession.

  To improve this, I would replace the automatic cart drawer behaviour with a lightweight toast message (e.g. “Product added” / “Product removed”) that appears briefly without blocking the interface. The cart would still update in the background, including totals and item count.

  This approach allows users to continue browsing and adjusting quantities more efficiently, while still receiving clear feedback for their actions.

- **Sticky header with cart access**
  To support this interaction, I would make the header sticky so the cart icon and item count remain visible at all times. This ensures users can access the cart whenever needed without interrupting their browsing flow.


## Author

Marta Vasallo Perez
