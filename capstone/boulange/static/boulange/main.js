document.addEventListener("DOMContentLoaded", function () {
  // If user is logged in display cart quantity
  if (document.querySelector(".cart-quantity")) {
    fetch("/cart", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((result) => {
        updateCartQuantity(result.cart_qty);
      });
  }

  document.addEventListener("touchstart", function () {}, false);

  // For bakery owner, handle events
  const pastryForm = document.querySelector("#pastry-form");
  if (pastryForm) {
    pastryForm.addEventListener("submit", addPastry);
    // Format price on input elt
    document.querySelector("#id_price").addEventListener("change", (event) => {
      event.target.value = Number(event.target.value).toFixed(2);
    });
    // Call the delete item API
    document.querySelectorAll(".delete-pastry").forEach((form) => {
      form.addEventListener("click", (event) => deletePastry(event));
    });
  }
  // Call the add to cart API
  const addToCartButton = document.querySelectorAll(".addToCart-pastry");
  if (addToCartButton) {
    addToCartButton.forEach((form) => {
      form.addEventListener("click", (event) => addToCartPastry(event));
    });
  }

  // Call the change qty API and delete item API
  const changeQuantity = document.querySelectorAll(".pastryQuantity");
  if (changeQuantity) {
    changeQuantity.forEach((select) => {
      select.addEventListener("change", (event) => updateQuantity(event));
    });
    document.querySelectorAll(".cart-item__delete").forEach((form) => {
      form.addEventListener("click", (event) => deleteItem(event));
    });
  }

  // Call the like API
  const likeBakeries = document.querySelectorAll(".like-bakery");
  if (likeBakeries) {
    likeBakeries.forEach((select) => {
      select.addEventListener("click", (event) => likeBakery(event));
    });
  }
});

/**
 * Let the bakery owner create a pastry.
 */
function addPastry(event) {
  // prevent the refresh due to form submission
  event.preventDefault();

  // Call API to add the pastry in the db
  fetch(window.location.pathname, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      item: document.querySelector("#id_item").value,
      price: document.querySelector("#id_price").value,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      pastryFactory(result);
    });
}

/**
 * Let the bakery owner delete a pastry.
 */
function deletePastry(event) {
  // prevent the refresh due to form submission
  event.preventDefault();

  const id = event.currentTarget.id.split("delete-")[1];
  const deleteItem = document.querySelector(`#${event.currentTarget.id}`);

  // Call API to delete the pastry from the db
  fetch(`/pastries/delete/${id}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((result) => {
      // Create a message with the result
      displayMessage(result.message);
      deleteItem.parentElement.remove();
    });
}

/**
 * Let the user add a pastry to his shopping cart.
 */
function addToCartPastry(event) {
  // prevent the refresh due to form submission
  event.preventDefault();
  const id = event.currentTarget.id.split("addToCart-")[1];

  // Call API to add the pastry to the db
  fetch("/cart", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pastry: id,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      // Create a message with the result
      displayMessage(result.message);
      // Update cart quantity
      updateCartQuantity(result.cart_qty);
    });
}

/*
 * Update item quantity in the cart page.
 */
function updateQuantity(event) {
  // prevent the refresh due to form submission
  event.preventDefault();

  const id = event.target.id.split("pastryQuantity-")[1];
  const value = Number(event.target.value);

  // Call API to add the pastry to the cart
  fetch("/cart", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pastry: id,
      quantity: value,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      // Update cart quantity
      updateCartQuantity(result.cart_qty);
      // Update line price
      updateCartItemPrice(id, value);
      // Update total price
      updateCartTotalPrice(result.cart_total_price);
    });
}

/*
 * Remove an item from the shopping cart.
 */
function deleteItem(event) {
  // prevent the refresh due to form submission
  event.preventDefault();

  const id = event.currentTarget.id.split("delete-")[1];
  const deleteItem = document.querySelector(`#${event.currentTarget.id}`);
  const cart = document.querySelector(".cart-container");

  fetch(`/cart/delete/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((result) => {
      // Print result
      if (result.cart_qty) {
        deleteItem.parentElement.parentElement.parentElement.remove();
      } else {
        cart.remove();
      }
      updateCartQuantity(result.cart_qty);
      updateCartTotalPrice(result.cart_total_price);
    });
}

/*
 * Let the user add or remove a like for a bakery.
 */
function likeBakery(event) {
  // prevent the refresh due to form submission
  event.preventDefault();
  // Récupération du nom de la page pour déclencher les bonnes fonctions
  const path = window.location.pathname;
  const page = path.split("/");

  const icon = event.currentTarget.querySelector("i");
  let id;
  // Sélection des fonctions à exécuter en fonction de la page courante
  if (page.includes("bakeries")) {
    id = window.location.pathname.split("/").pop();
  } else {
    id = event.currentTarget.id.split("like-")[1];
  }

  // Use the API
  fetch(`/bakeries/like/${id}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.like) {
        icon.classList.remove("far");
        icon.classList.add("fas");
        icon.classList.add("card__like-btn--active");
        // increment like count
        if (page.includes("bakeries")) {
          document.querySelector("#likes").innerHTML++;
        } else {
          document.querySelector(`#likes-${id}`).innerHTML++;
        }
      } else {
        icon.classList.remove("fas");
        icon.classList.add("far");
        icon.classList.remove("card__like-btn--active");
        // decrement like count
        if (page.includes("bakeries")) {
          document.querySelector("#likes").innerHTML--;
        } else {
          document.querySelector(`#likes-${id}`).innerHTML--;
        }
      }
    });
}

/*
 * Utility HTML function to update cart quantity in the header.
 */
function updateCartQuantity(qty) {
  if (qty) {
    document.querySelector(".cart-quantity").style.visibility = "visible";
    document.querySelector(".cart-quantity").innerHTML = qty;
  } else {
    document.querySelector(".cart-quantity").style.visibility = "hidden";
  }
}

/*
 * Utility HTML function to update cart total price.
 */
function updateCartTotalPrice(total_price) {
  document.querySelector(".order-summary__price").innerHTML =
    formatPrice(total_price);
}

/*
 * Utility HTML function to update price of an item in the cart.
 */
function updateCartItemPrice(itemId, quantity) {
  // Item price
  const price = Number(
    document.querySelector(`#pastryPrice-${itemId}`).innerHTML.replace(" €", "")
  );
  document.querySelector(`#linePrice-${itemId}`).innerHTML = formatPrice(
    price * quantity
  );
}

/*
 * Utility function to display event message.
 */
function displayMessage(message) {
  const messageDiv = document.createElement("div");
  messageDiv.setAttribute("class", "alert");
  messageDiv.innerHTML = message;
  document.querySelector("main").appendChild(messageDiv);
  setTimeout(() => {
    document.querySelector("main").removeChild(messageDiv);
  }, 3000);
}

/*
 * Utility HTML function to add pastry card.
 */
function pastryFactory(pastry) {
  // Select the html list
  const pastriesList = document.querySelector("#pastry-list");

  // Build list element
  const listItem = document.createElement("li");
  listItem.setAttribute("class", "dishes-list__item");
  pastriesList.appendChild(listItem);

  // Build delete element
  const deleteItem = document.createElement("button");
  deleteItem.setAttribute("class", "dishes-list__delete-item delete-pastry");
  deleteItem.setAttribute("id", `delete-${pastry.id}`);
  deleteItem.innerHTML = `<i class="fas fa-trash"></i>`;
  listItem.appendChild(deleteItem);

  // Build pastry content
  const contentItem = document.createElement("div");
  contentItem.setAttribute("class", "dishes-list__content");
  listItem.appendChild(contentItem);
  const textItem = document.createElement("div");
  textItem.setAttribute("class", "dishes-list__text");
  textItem.innerHTML = pastry.item;
  contentItem.appendChild(textItem);
  const priceItem = document.createElement("div");
  priceItem.setAttribute("class", "dishes-list__price");
  priceItem.innerHTML = formatPrice(pastry.price);
  contentItem.appendChild(priceItem);

  // Build the add to cart button
  const addToCartItem = document.createElement("button");
  addToCartItem.setAttribute("class", "dishes-list__button addToCart-pastry");
  addToCartItem.setAttribute("id", `addToCart-${pastry.id}`);
  addToCartItem.innerHTML = `<i class="fas fa-shopping-cart"></i>`;
  listItem.appendChild(addToCartItem);

  // add event listeners on buttons
  addToCartItem.addEventListener("click", (event) => addToCartPastry(event));
  deleteItem.addEventListener("click", (event) => deletePastry(event));

  // clear the form
  document.querySelector("#id_item").value = "";
  document.querySelector("#id_price").value = "";
}

/*
 * Utility function to format price.
 */
function formatPrice(price) {
  return `${Number(price).toFixed(2)} €`;
}
