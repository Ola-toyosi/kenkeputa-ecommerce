from django.db.models.signals import post_save
from django.contrib.auth import user_logged_in
from django.dispatch import receiver
from .utils import get_or_create_cart, merge_carts
from .models import Cart


@receiver(user_logged_in)
def merge_carts_on_login(sender, request, user, **kwargs):
    """
    Automatically merge carts when user logs in
    """
    if request.session.session_key:
        try:
            session_cart = Cart.objects.get(session_key=request.session.session_key)
            user_cart = get_or_create_cart(request)
            merge_carts(request, session_cart, user_cart)
        except Cart.DoesNotExist:
            pass
