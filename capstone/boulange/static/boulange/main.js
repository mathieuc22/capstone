document.addEventListener('DOMContentLoaded', function() {

  // Récupération du nom de la page pour déclencher les bonnes fonctions
  const path = window.location.pathname;
  const page = path.split("/");

  // Sélection des fonctions à exécuter en fonction de la page courante
  if (page.includes("bakeries")) {
    // Prevent submit on form and call the add API
    document.querySelector('#pastry-form').addEventListener('submit', add_pastry);
    // Prevent submit on form and call the delete API
    document.querySelectorAll('.delete-pastry').forEach(form => { form.addEventListener('click', (event) => delete_pastry(event)) });
    document.querySelector('#id_price').addEventListener('change', (event) => { event.target.value = Number(event.target.value).toFixed(2) })
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
