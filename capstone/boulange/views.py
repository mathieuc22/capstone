from django import forms
from django.shortcuts import get_object_or_404, render
from django.views.decorators.http import require_http_methods
from django.http import HttpResponseRedirect, JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.urls import reverse
from django.db import IntegrityError
from django.core.exceptions import PermissionDenied
from django.views.decorators.csrf import csrf_exempt

from .models import Bakery, Pastry
from .forms import BakeryForm, PastryForm

import json

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            next_url = request.POST["next"]
            if next_url:
                return HttpResponseRedirect(next_url)
            else:
                return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "boulange/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "boulange/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "boulange/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "boulange/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "boulange/register.html")

@csrf_exempt
def index(request):

    # When user add a bakery handle the new
    if request.method == "POST":
        # Check wether it's a fetch or a form request
        if request.headers.get("Content-Type") == 'application/json':
            body = json.loads(request.body)
            bakery = Bakery(
                name = body.get("name"),
                description = body.get("description"),
                city = body.get("city"),
                creator = get_object_or_404(User, username=body.get("creator"))
            )
            bakery.save()
        else:
            form = BakeryForm(request.POST)
            if form.is_valid():
                # Create the bakery
                bakery = form.save(commit=False)
                bakery.creator = request.user
                bakery.save()

    # Query all the bakeries
    bakeries = Bakery.objects.all()
    context = {'bakeries': bakeries}
    return render(request, "boulange/index.html", context)

@csrf_exempt
def bakery(request, bakery_id):
    if request.method == "PUT":
        # Get contents
        data = json.loads(request.body)
        # Query for the bakery
        bakery = get_object_or_404(Bakery, pk=bakery_id)
        if bakery.creator != request.user:
            return JsonResponse({"message": "Permission denied."})
        else:
            item = data.get("item")
            price = data.get("price")
            newItem = bakery.pastries.create(item=item, price=price)
            bakery.save()
            return JsonResponse({"message": f'{newItem}'})
    # When user add a bakery handle the new
    elif request.method == "POST":
        bakery = get_object_or_404(Bakery, pk=bakery_id)
        form = BakeryForm(request.POST or None, instance=bakery)
        if form.is_valid():
            # Update the bakery
            form.save()
    # Query for the bakery
    bakery = get_object_or_404(Bakery, pk=bakery_id)
    form = PastryForm()
    context = {'bakery': bakery, 'form': form}
    return render(request, "boulange/bakery.html", context)

@login_required
def bakery_new(request):
    form = BakeryForm()
    return render(request, "boulange/bakery_new.html", {'form': form})

@login_required
def bakery_edit(request, bakery_id):
    # Query for the bakery
    bakery = get_object_or_404(Bakery, pk=bakery_id)
    if bakery.creator != request.user:
        raise PermissionDenied
    form = BakeryForm(request.POST or None, instance=bakery)
    return render(request, "boulange/bakery_edit.html", {'form': form, 'bakery_id': bakery.id})

@login_required
@require_http_methods(["POST"])
def bakery_delete(request, bakery_id):
    # Query for the bakery
    bakery = get_object_or_404(Bakery, pk=bakery_id)
    if bakery.creator != request.user:
        raise PermissionDenied
    else:
        bakery.delete()
        return HttpResponseRedirect(reverse("index"))

@login_required
@csrf_exempt
@require_http_methods(["POST"])
def pastry_delete(request, pastry_id):
    # Query for the bakery
    pastry = get_object_or_404(Pastry, pk=pastry_id)
    pastry.delete()
    return JsonResponse({"message": "Item deleted"})