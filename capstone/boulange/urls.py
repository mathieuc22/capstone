from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("bakeries/<int:bakery_id>", views.bakery, name="bakery"),
    path("bakeries/new", views.bakery_new, name="bakery_new"),
    path("bakeries/delete/<int:bakery_id>", views.bakery_delete, name="bakery_delete"),
    path("pastries/delete/<uuid:pastry_id>", views.pastry_delete, name="pastry_delete"),
    path("bakeries/edit/<int:bakery_id>", views.bakery_edit, name="bakery_edit"),
    path("bakeries/like/<int:bakery_id>", views.bakery_like, name="bakery_like"),

    path("cart", views.cart, name="cart"),
    path("cart/delete/<uuid:line_id>", views.line_delete, name="line_delete"),
    path("place_order", views.place_order, name="place_order"),

    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("user", views.user, name="user"),
]
