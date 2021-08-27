document.addEventListener('DOMContentLoaded', function() {

  // Récupération du nom de la page pour déclencher les bonnes fonctions
  const path = window.location.pathname;
  const page = path.split("/");

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
    document.querySelectorAll('.delete-item').forEach(form => { form.addEventListener('click', (event) => delete_item(event)) });
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

  // Use the API to send the mail
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
      // Print result
      console.log(result);
      const listItem = document.createElement("li");
      const deleteItem = document.createElement("button");
      deleteItem.setAttribute("id",`delete-${result.id}`);
      deleteItem.setAttribute("class","delete-pastry");
      deleteItem.setAttribute("type","button");
      deleteItem.innerHTML = "Delete";
      listItem.innerHTML = result.message;
      document.querySelector("#pastry-list").appendChild(listItem);
      listItem.appendChild(deleteItem);

      const addToCartItem = document.createElement("button");
      addToCartItem.setAttribute("id",`addToCart-${result.id}`);
      addToCartItem.setAttribute("class","addToCart-pastry");
      addToCartItem.setAttribute("type","button");
      addToCartItem.innerHTML = "Add to cart";
      listItem.appendChild(addToCartItem);

      addToCartItem.addEventListener('click', (event) => addToCart_pastry(event));

      deleteItem.addEventListener('click', (event) => delete_pastry(event));
  });
}

function delete_pastry(event) {
  
  // prevent the refresh due to form submission
  event.preventDefault();
  const id = event.target.id.split('delete-')[1]
  const deleteItem = document.querySelector(`#${event.target.id}`)

  fetch(`/pastries/delete/${id}`, {
    method: 'POST',
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    }
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      deleteItem.parentElement.remove();
  });

}

function addToCart_pastry(event) {
  
  // prevent the refresh due to form submission
  event.preventDefault();
  const id = event.target.id.split('addToCart-')[1]
  console.log(id)

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
      // Print result
      console.log(result);
  });

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
  });

  const price = Number(document.querySelector(`#pastryPrice-${id}`).innerHTML.replace(" €",""));
  document.querySelector(`#linePrice-${id}`).innerHTML = `${ (value * price).toFixed(2) } €`;

}

function delete_item(event) {
  
  // prevent the refresh due to form submission
  event.preventDefault();
  const id = event.target.id.split('delete-')[1]
  const deleteItem = document.querySelector(`#${event.target.id}`)

  fetch(`/cart/delete/${id}`, {
    method: 'POST',
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    }
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      deleteItem.parentElement.remove();
  });

}

function like_bakery(event) {
  
  // prevent the refresh due to form submission
  event.preventDefault();
  // Récupération du nom de la page pour déclencher les bonnes fonctions
  const path = window.location.pathname;
  const page = path.split("/");

  let id
  // Sélection des fonctions à exécuter en fonction de la page courante
  if (page.includes("bakeries")) {
    id = window.location.pathname.split("/").pop()
  } else {
    id = event.target.id.split('like-')[1];
  }

  // Use the API to send the mail
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
      event.target.innerHTML = "Unlike"
      if (page.includes("bakeries")) {
        document.querySelector("#like").innerHTML++;
      }
    } else {
      event.target.innerHTML = "Like"
      if (page.includes("bakeries")) {
        document.querySelector("#like").innerHTML--;
      }
    }
  });
}