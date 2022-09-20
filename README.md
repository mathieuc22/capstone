# Capstone

This is a solution to the [Capstone on CS50’s Web Programming with Python and JavaScript](https://cs50.harvard.edu/web/2020/projects/final/capstone/).

Designing and implementing a web application with Python and JavaScript.

## Table of contents

- [Overview](#overview)
  - [The application](#the-application)
  - [Distinctiveness and Complexity](#distinctiveness-and-complexity)
  - [Content](#content)
  - [Screenshot](#screenshot)
  - [Links](#links)
  - [File Contents](#file-contents)
- [Getting Started](#getting-started)
- [Technologies](#technologies)
- [License](#license)
- [Author](#author)

## Overview

### The application

Boulange web application is a Uber Eats like application for bakeries.

Users are able to:

- Register, sign in and out
- See all the available bakeries
- View the detail of a bakery

Registered users are able to:

- Add a like to their favorite bakeries
- From a bakery page, add pastries to a shopping cart
- Modify their shopping cart (update quantity, remove items) and review an order summary with total price of the cart
- Place an order and get an order id
- Review their user profile

Users belonging to the **Owner** group are able to:

- Register a new bakery (with name, description, city and an image) from their user profile
- From a bakery page:
  - Modify the bakery
  - Delete the bakery
  - Add a bakery with a name and a price

### Distinctiveness and Complexity

The site is an e-commerce site. Quite different from Project 2, it's a Deliveroo / Uber Eats like application, with the ability to add items to a shopping cart and then place an order to different shops. Each user has a profile with its favorite bakeries and users belonging to the Owner group have additional capabilities.

There are two groups of users, customers and bakeries owners:

- Owners are able to add/modify/delete a bakery and for that bakery add/delete items.
- Registered users are able to add items to a shopping cart, and from the cart they can modify quantities and remove items

The complexity of the application is related to group base access to some capabilities and the abilty to offer a consistent experience to the user. As a roadmap, I would next add user location management and UPDATE capabilities for the user profile. The model part of the application was a challenge because of the relations between each model and the operations done in the views (filter and aggregation to sum quantities for a specific user for example).

Main complexities of the app are:

- groups management, some functionnalities are only available for a specific group
- add/remove a like for a bakery and make a list of liked bakeries for the user
- bakery management with crud capabilities and items management
- illustrations uploaded from users
- shopping cart management
- dynamic user interface elements such as shopping cart badge, total price calculation, etc.

## Getting Started

You can run the application locally. First clone the repository from Github and switch to the new directory:

```bash
  git clone https://github.com/mathieuc22/capstone.git
  cd capstone
```

Create a virtualenv and activate it.

Install project dependencies:

```bash
pip install -r requirements.txt
```

Then simply apply the migrations:

```bash
python capstone/manage.py migrate
```

Start the server

```bash
python capstone/manage.py runserver
```

### Screenshot

[<img src="./Screenshot_desktop.png" height="450px"/>](./Screenshot_desktop.png)

[<img src="./Screenshot_mobile.png" height="450px"/>](./Screenshot_mobile.png)

### Links

- Solution URL: [GitHub repo](https://github.com/mathieuc22/capstone)
- Live Site URL: [PythonAnywhere](http://mathieuc22.pythonanywhere.com/)

### File Contents

```
.
├── capstone
│   ├── boulange                            Application folder
│   │   ├── admin.py                        Registration of Bakery and Pastry models
│   │   ├── apps.py
│   │   ├── forms.py                        Bakery and Pastry forms using Django Form class
│   │   ├── migrations                      Migrations folder
│   │   ├── models.py                       Contains Bakery, Pastry and Cart models, for user I use django.contrib.auth.models
│   │   ├── sass                            7-1 Sass Architecture, contains all app styles
│   │   ├── static                          Contains Static files for the app
│   │   │   ├── boulange
│   │   │   │   ├── main.js                 JS elements for the application, mainly fetch API for dynamic experience for the user
│   │   │   │   └── style.css               Generated css file from Sass
│   │   │   └── favicon-32x32.png           Application favicon
│   │   ├── templates
│   │   │   ├── 403.html                    Custom 403 page when DEBUG=false
│   │   │   ├── 404.html                    Custom 404 page when DEBUG=false
│   │   │   ├── boulange
│   │   │   │   ├── bakery_delete.html      HTML template for confirmation before balery DELETE
│   │   │   │   ├── bakery_edit.html        HTML template for the EDIT bakery form
│   │   │   │   ├── bakery.html             HTML template for bakery landing page
│   │   │   │   ├── bakery_new.html         HTML template for the CREATE bakery form
│   │   │   │   ├── cart.html               HTML template for the users shopping cart management
│   │   │   │   ├── index.html              HTML template for landing page
│   │   │   │   ├── layout.html             HTML template for header and footer
│   │   │   │   ├── login.html              HTML template for user login form
│   │   │   │   ├── order.html              HTML template for order confirmation
│   │   │   │   ├── register.html           HTML template for user registration form
│   │   │   │   └── user.html               HTML template for user profile
│   │   │   └── form_snippet.html           HTML template to style the pastry form
│   │   ├── tests.py
│   │   ├── urls.py                         Contains all the routes bakeries, pastries, cart and user management
│   │   └── views.py                        Contains all the views with a mix of HTML render and Json responses
│   ├── capstone
│   │   ├── asgi.py
│   │   ├── settings.py                     Current application settings
│   │   ├── urls.py                         Contains application routes and static MEDIA registration for bakeries custom illustrations uploaded by users
│   │   └── wsgi.py
│   └── manage.py
├── LICENSE                                 License file
├── README.md                               Current file
├── requirements.txt                        Dependencies
├── Screenshot_desktop.png                  Screenshot for README
└── Screenshot_mobile.png                   Screenshot for README
```

## Technologies

- [Python](https://www.python.org/)
- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Django](https://www.djangoproject.com) - The web framework for perfectionists with deadlines.
- [Pillow](https://pillow.readthedocs.io/en/stable/) - For image management
- [Google font](https://fonts.googleapis.com) - For fonts

## License

[MIT](LICENSE)

## Author

- [@mathieuc22](https://www.github.com/mathieuc22)
