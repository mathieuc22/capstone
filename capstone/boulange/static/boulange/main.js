document.addEventListener('DOMContentLoaded', function() {

  // If user is logged in display cart quantity
  if (document.querySelector('.cart-quantity')) {
    fetch('/cart', {
      method: 'GET',
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      }
    })
    .then(response => response.json())
    .then(result => {
        updateCartQuantity(result.cart_qty);
    });
  }

  // Récupération du nom de la page pour déclencher les bonnes fonctions
  const path = window.location.pathname;
  const page = path.split("/");
  document.addEventListener("touchstart", function() {},false);
  // Sélection des fonctions à exécuter en fonction de la page courante
  if (page.includes("bakeries")) {
    // Prevent submit on form and call the add API
    const pastryForm = document.querySelector('#pastry-form')
    if (pastryForm) {
      pastryForm.addEventListener('submit', add_pastry);
      document.querySelector('#id_price').addEventListener('change', (event) => { event.target.value = Number(event.target.value).toFixed(2) })
      // Call the delete API
      document.querySelectorAll('.delete-pastry').forEach(form => { form.addEventListener('click', (event) => delete_pastry(event)) });
    }
    // Call the add to cart API
    const addToCartButton = document.querySelectorAll('.addToCart-pastry')
    if (addToCartButton) {
      addToCartButton.forEach(form => { form.addEventListener('click', (event) => addToCart_pastry(event)) });
    }
  }
  // Call the add to cart API
  const changeQuantity = document.querySelectorAll('.pastryQuantity')
  if (changeQuantity) {
    changeQuantity.forEach(select => { select.addEventListener('change', (event) => updateQuantity(event)) });
    document.querySelectorAll('.cart__delete-item').forEach(form => { form.addEventListener('click', (event) => delete_item(event)) });
  }
  // Call the like API
  const likeBakeries = document.querySelectorAll('.like-bakery')
  if (likeBakeries) {
    likeBakeries.forEach(select => { select.addEventListener('click', (event) => like_bakery(event)) });
  }
  // Call the like API
  const likeBakery = document.querySelector('#like-bakery')
  if (likeBakery) {
    likeBakery.addEventListener('click', (event) => like_bakery(event));
  }
});

function add_pastry(event) {
  
  // prevent the refresh due to form submission
  event.preventDefault();

  // Use the API
  fetch(window.location.pathname, {
    method: 'PUT',
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
        item: document.querySelector('#id_item').value,
        price: document.querySelector('#id_price').value
    })
  })
  .then(response => response.json())
  .then(result => {

      const listItem = document.createElement("li");
      listItem.setAttribute("class","dishes-list__item");
      document.querySelector("#pastry-list").appendChild(listItem);

      const deleteItem = document.createElement("button");
      deleteItem.setAttribute("class","dishes-list__delete-item delete-pastry");
      deleteItem.setAttribute("id",`delete-${result.id}`);
      deleteItem.innerHTML = `<i class="fas fa-trash"></i>`;
      listItem.appendChild(deleteItem);
      
      const contentItem = document.createElement("div");
      contentItem.setAttribute("class","dishes-list__content");
      listItem.appendChild(contentItem);
 
      const textItem = document.createElement("div");
      textItem.setAttribute("class","dishes-list__text");
      textItem.innerHTML = result.message;
      contentItem.appendChild(textItem);
      const priceItem = document.createElement("div");
      priceItem.setAttribute("class","dishes-list__price");
      contentItem.appendChild(priceItem);

      const addToCartItem = document.createElement("button");
      addToCartItem.setAttribute("class","dishes-list__button addToCart-pastry");
      addToCartItem.setAttribute("id",`addToCart-${result.id}`);
      addToCartItem.innerHTML = `<i class="fas fa-shopping-cart"></i>`;
      listItem.appendChild(addToCartItem);

      addToCartItem.addEventListener('click', (event) => addToCart_pastry(event));
      deleteItem.addEventListener('click', (event) => delete_pastry(event));

      document.querySelector('#id_item').value = '';
      document.querySelector('#id_price').value = '';
  });
}

function delete_pastry(event) {
  
  // prevent the refresh due to form submission
  event.preventDefault();
  console.log('log' + event.currentTarget)
  const id = event.currentTarget.id.split('delete-')[1]
  const deleteItem = document.querySelector(`#${event.currentTarget.id}`)

  fetch(`/pastries/delete/${id}`, {
    method: 'POST',
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    }
  })
  .then(response => response.json())
  .then(result => {
    // Create a message with the result
    displayMessage(result.message);
    deleteItem.parentElement.remove();
  });

}

function addToCart_pastry(event) {
  
  // prevent the refresh due to form submission
  event.preventDefault();
  const id = event.currentTarget.id.split('addToCart-')[1]

  fetch('/cart', {
    method: 'POST',
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pastry: id
    })
  })
  .then(response => response.json())
  .then(result => {
      // Create a message with the result
      displayMessage(result.message);
      updateCartQuantity(result.cart_qty);
  });

}

/*
* Update cart quantity in the header
*/
function updateCartQuantity(qty) {
  if (qty) {
    document.querySelector('.cart-quantity').style.visibility = 'visible';
    document.querySelector('.cart-quantity').innerHTML = qty
  } else {
    document.querySelector('.cart-quantity').style.visibility = 'hidden';
  }

}

function updateQuantity(event) {
  
  // prevent the refresh due to form submission
  event.preventDefault();
  const id = event.target.id.split('pastryQuantity-')[1];
  const value = Number(event.target.value);

  fetch('/cart', {
    method: 'POST',
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pastry: id,
      quantity: value
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      updateCartQuantity(result.cart_qty);
  });

  const price = Number(document.querySelector(`#pastryPrice-${id}`).innerHTML.replace(" €",""));
  document.querySelector(`#linePrice-${id}`).innerHTML = `${ (value * price).toFixed(2) } €`;

}

function delete_item(event) {
  
  // prevent the refresh due to form submission
  event.preventDefault();
  const id = event.currentTarget.id.split('delete-')[1]
  const deleteItem = document.querySelector(`#${event.currentTarget.id}`)
  const placeOrder = document.querySelector('#order')

  fetch(`/cart/delete/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    }
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      if(result.cart_qty){
        deleteItem.parentElement.remove();
      }
      else {
        deleteItem.parentElement.parentElement.remove();
        placeOrder.remove();
      }
      updateCartQuantity(result.cart_qty);
  });

}

function like_bakery(event) {
  
  // prevent the refresh due to form submission
  event.preventDefault();
  // Récupération du nom de la page pour déclencher les bonnes fonctions
  const path = window.location.pathname;
  const page = path.split("/");

  const icon = event.currentTarget.querySelector('i')
  let id
  // Sélection des fonctions à exécuter en fonction de la page courante
  if (page.includes("bakeries")) {
    id = window.location.pathname.split("/").pop()
  } else {
    id = event.currentTarget.id.split('like-')[1];
  }

  // Use the API
  fetch(`/bakeries/like/${id}`, {
    method: 'PUT',
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.like) {
      icon.classList.remove('far');
      icon.classList.add('fas');
      icon.classList.add('card__like-btn--active');
      if (page.includes("bakeries")) {
        document.querySelector("#likes").innerHTML++;
      } else {
        document.querySelector(`#likes-${id}`).innerHTML++;
      }
    } else {
      icon.classList.remove('fas');
      icon.classList.add('far');
      icon.classList.remove('card__like-btn--active');
      if (page.includes("bakeries")) {
        document.querySelector("#likes").innerHTML--;
      } else {
        document.querySelector(`#likes-${id}`).innerHTML--;
      }
    }
  });
}

function displayMessage(message) {
  const messageDiv = document.createElement('div')
  messageDiv.setAttribute("class","alert");
  messageDiv.innerHTML = message;
  document.querySelector('main').appendChild(messageDiv);
  setTimeout(() => { document.querySelector('main').removeChild(messageDiv); }, 3000);
}
