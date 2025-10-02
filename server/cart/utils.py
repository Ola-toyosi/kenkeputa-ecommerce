from .models import Cart, CartItem
from products.models import Product
from django.db import transaction


def get_or_create_cart(request):
    """
    Get or create cart for authenticated user or anonymous user
    """
    # print("=== CART DEBUG INFO ===")
    # print(f"User authenticated: {request.user.is_authenticated}")
    # print(f"User: {request.user}")
    # print(f"Headers: {dict(request.headers)}")
    # print(f"X-Session-Key header: {request.headers.get('X-Session-Key')}")
    # print(f"Session key: {getattr(request.session, 'session_key', 'None')}")

    if request.user.is_authenticated:
        # print("Creating/Getting cart for authenticated user")
        cart, created = Cart.objects.get_or_create(user=request.user)
        # print(f"Cart: {cart}, Created: {created}")
    else:
        # Try to get session key from header
        session_key = request.headers.get("X-Session-Key")
        # print(f"Session key from header: {session_key}")

        if not session_key:
            # Fallback to web session
            if not request.session.session_key:
                request.session.create()
                # print("Created new session")
            session_key = request.session.session_key
            # print(f"Using session key: {session_key}")

        # print(f"Creating/Getting cart with session key: {session_key}")
        cart, created = Cart.objects.get_or_create(session_key=session_key)
        # print(f"Cart: {cart}, Created: {created}")

    # print("=== END DEBUG ===")
    return cart


def merge_carts(request, session_cart, user_cart):
    """
    Merge anonymous cart into user cart after login
    """
    if session_cart and user_cart and session_cart != user_cart:
        for session_item in session_cart.items.all():
            user_item, created = CartItem.objects.get_or_create(
                cart=user_cart,
                product=session_item.product,
                defaults={"quantity": session_item.quantity},
            )
            if not created:
                # If item already exists in user cart, add quantities
                user_item.quantity += session_item.quantity
                user_item.save()

        # Delete the session cart after merging
        session_cart.delete()

    return user_cart


def add_to_cart(cart, product_id, quantity=1):
    """
    Add product to cart with stock validation
    """
    if quantity <= 0:
        return None, "Quantity must be greater than zero"
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return None, "Product not found"

    if product.inventory_count < quantity:
        return None, "Not enough stock available"

    # Check if item already exists in cart
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart, product=product, defaults={"quantity": quantity}
    )

    if not created:
        new_quantity = cart_item.quantity + quantity
        if product.inventory_count < new_quantity:
            return None, "Exceeds available stock"
        cart_item.quantity = new_quantity
        cart_item.save()

    return cart_item, None


def update_cart_item(cart, item_id, quantity):
    """
    Update cart item quantity
    """
    try:
        cart_item = CartItem.objects.get(id=item_id, cart=cart)
    except CartItem.DoesNotExist:
        return None, "Item not found in cart"

    if quantity <= 0:
        cart_item.delete()
        return None, "Item removed from cart"

    if cart_item.product.inventory_count < quantity:
        return None, "Not enough stock available"

    cart_item.quantity = quantity
    cart_item.save()
    return cart_item, None
