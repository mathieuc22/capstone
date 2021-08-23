document.addEventListener('DOMContentLoaded', function() {

  // Récupération du nom de la page pour déclencher les bonnes fonctions
  const path = window.location.pathname;
  const page = path.split("/");

  // Sélection des fonctions à exécuter en fonction de la page courante
  if (page.includes("bakeries")) {
    // Prevent submit on form and call the add API
    document.querySelector('#pastry-form').addEventListener('submit', add_pastry);
    // Prevent submit on form and call the delete API
    document.querySelectorAll('.delete-pastry').forEach(form => { form.addEventListener('submit', (event) => delete_pastry(event)) });
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
      listItem.innerHTML = result.message;
      document.querySelector("#pastry-list").appendChild(listItem);
  });
}

function delete_pastry(event) {
  
  // prevent the refresh due to form submission
  event.preventDefault();
  const id = event.target.id.split('delete-')[1]
  console.log(id);
  const deleteItem = document.querySelector(`#delete-${id}`)

  fetch(`/pastries/delete/${id}`, {
    method: 'POST',
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    }
  })
  .then(response => response.json())
  .then(post => {
      // Print result
      console.log(post);
      deleteItem.parentElement.remove();
  });


}
