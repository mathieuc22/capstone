from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("bakeries/<int:bakery_id>", views.bakery, name="bakery"),
    path("bakeries/new", views.bakery_new, name="bakery_new"),
    path("bakeries/delete/<int:bakery_id>", views.bakery_delete, name="bakery_delete"),
    path("bakeries/edit/<int:bakery_id>", views.bakery_edit, name="bakery_edit"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
]
