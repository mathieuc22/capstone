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
from django.db.models import Sum
import uuid

from .models import Bakery, Pastry, Cart, Group
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
            if 'group' in request.POST:
                bakeryOwner = Group.objects.filter(name="Owner")
                if bakeryOwner:
                    user.groups.add(bakeryOwner.first())
                else:
                    user.groups.create(name="Owner")
            user.save()
        except IntegrityError:
            return render(request, "boulange/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "boulange/register.html")

@login_required
@csrf_exempt
def user(request):
    
    user = get_object_or_404(User, username=request.user)
    context = {'user': user}
    return render(request, "boulange/user.html", context)

@csrf_exempt
def index(request):

    # When user add a bakery handle the new
    if request.method == "POST":
        user = get_object_or_404(User, username=request.user)
        if user.groups.filter(name="Owner"):
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
                form = BakeryForm(request.POST, request.FILES)
                if form.is_valid():
                    # Create the bakery
                    bakery = form.save(commit=False)
                    bakery.creator = request.user
                    bakery.save()
        else:
            raise PermissionDenied

    # Query all the bakeries
    bakeries = Bakery.objects.all()
    if bakeries:
        context = {'bakeries': bakeries}
    else:
        context = {'message': 'No bakery yet'}
    return render(request, "boulange/index.html", context)

@csrf_exempt
def bakery(request, bakery_id):
    bakery = get_object_or_404(Bakery, pk=bakery_id)
    # Add item to the bakery
    if request.method == "PUT":
        # Get contents
        data = json.loads(request.body)
        # Query for the bakery
        if bakery.creator != request.user:
            return JsonResponse({"message": "Permission denied."})
        else:
            item = data.get("item")
            price = data.get("price")
            newItem = bakery.pastries.create(item=item, price=price)
            bakery.save()
            return JsonResponse({"item": f'{item} ', "price": f'{price} ', "id": f'{newItem.pastry_id}'})
    # Edit the bakery
    elif request.method == "POST":
        if bakery.creator == request.user:
            form = BakeryForm(request.POST, request.FILES, instance=bakery)
            if form.is_valid():
                # Update the bakery
                form.save()
        else:
            raise PermissionDenied
    # Query for the bakery
    form = PastryForm()
    context = {'bakery': bakery, 'form': form}
    return render(request, "boulange/bakery.html", context)

@login_required
def bakery_new(request):
    user = get_object_or_404(User, username=request.user)
    if user.groups.filter(name="Owner"):
        form = BakeryForm()
        return render(request, "boulange/bakery_new.html", {'form': form})
    else:
        raise PermissionDenied

@login_required
def bakery_edit(request, bakery_id):
    # Query for the bakery
    bakery = get_object_or_404(Bakery, pk=bakery_id)
    if bakery.creator != request.user:
        raise PermissionDenied
    form = BakeryForm(request.POST or None, instance=bakery)
    return render(request, "boulange/bakery_edit.html", {'form': form, 'bakery_id': bakery.id})

@csrf_exempt
@login_required
@require_http_methods(["PUT"])
def bakery_like(request, bakery_id):
    # Query for the bakery
    bakery = get_object_or_404(Bakery, pk=bakery_id)
    if request.user in bakery.likes.all():
        bakery.likes.remove(User.objects.get(username=request.user))
        return JsonResponse({"message": f'{request.user} removes his like to {bakery}', "like": False})
    else:
        bakery.likes.add(User.objects.get(username=request.user))
        bakery.save()
        return JsonResponse({"message": f'{request.user} adds a like {bakery}', "like": True})

@login_required
def bakery_delete(request, bakery_id):
    # Query for the bakery
    bakery = get_object_or_404(Bakery, pk=bakery_id)
    if bakery.creator != request.user:
        raise PermissionDenied
    else:
        if request.method == "GET":
            return render(request, "boulange/bakery_delete.html", {'bakery_id': bakery_id})
        elif request.method == "POST":
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

@login_required
@csrf_exempt
def cart(request):
    if request.method == "POST":
        # Get contents
        data = json.loads(request.body)
        pastryId = data.get("pastry")
        # Check if cart line already exist, if yes update quantity
        cart_item = Cart.objects.filter(user=request.user, pastry_id=pastryId).first()
        if cart_item:
            quantity = data.get("quantity")
            if quantity:
                cart_item.quantity = quantity
            else:
                cart_item.quantity = cart_item.quantity + 1
            cart_item.save()
            # Query all the lines
            cart_items = Cart.objects.filter(user=request.user)
            # Query cart quantity
            cart_qty = Cart.objects.filter(user=request.user).aggregate(Sum('quantity'))
            # Query cart price
            cart_total_price = 0
            for item in cart_items :
                cart_total_price += item.getPrice()
            return JsonResponse({"message": f'Quantity updated for {cart_item.pastry}', "cart_qty": cart_qty['quantity__sum'], "cart_total_price": cart_total_price})
        else:
            pastry = Pastry.objects.get(pk=pastryId)
            user = User.objects.get(username=request.user)
            newItem = Cart(
                user=user, 
                pastry=pastry, 
                quantity=1
            )
            newItem.save()
            # Query cart quantity
            cart_qty = Cart.objects.filter(user=request.user).aggregate(Sum('quantity'))
            return JsonResponse({"message": f'Added {newItem} to cart', "cart_qty": cart_qty['quantity__sum']})
    else:
        # Query all the lines
        cart_items = Cart.objects.filter(user=request.user)
        # Query cart quantity
        cart_qty = Cart.objects.filter(user=request.user).aggregate(Sum('quantity'))
        # Query cart price
        cart_total_price = 0
        for item in cart_items :
            cart_total_price += item.getPrice()
        if cart_items:
            context = {'cart_items': cart_items, 'cart_total_price': cart_total_price}
        else:
            context = {'message': 'Nothing in your cart'}
        if request.headers['Content-Type'] == 'application/json':
            return JsonResponse({"cart_qty": cart_qty['quantity__sum']})
        return render(request, "boulange/cart.html", context)

@login_required
@csrf_exempt
@require_http_methods(["DELETE"])
def line_delete(request, line_id):
    # Query for the cart item
    item = get_object_or_404(Cart, pk=line_id)
    item.delete()
    # Query all the lines
    cart_items = Cart.objects.filter(user=request.user)
    # Query cart quantity
    cart_qty = Cart.objects.filter(user=request.user).aggregate(Sum('quantity'))
    # Query cart price
    cart_total_price = 0
    for item in cart_items :
        cart_total_price += item.getPrice()
    return JsonResponse({"message": "Item deleted", "cart_qty": cart_qty['quantity__sum'], "cart_total_price": cart_total_price})

@login_required
@csrf_exempt
@require_http_methods(["POST"])
def place_order(request):
    
    # Query all the lines
    cart_items = Cart.objects.filter(user=request.user)
    if cart_items:
        cart_items.delete()
        order_id = uuid.uuid4()
        context = {'order_id': order_id}
    else:
        context = {'message': 'Nothing in your cart'}
    return render(request, "boulange/order.html", context)