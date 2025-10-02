from django.test import TestCase

# Create your tests here.
from cart.models import Cart, CartItem
from products.models import Product
from django.contrib.sessions.models import Session
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

# Create a session key (simulating anonymous user)
session_key = "test_session_key_12345"

# Create a session-based cart
anonymous_cart = Cart.objects.create(session_key=session_key)
print(f"Created anonymous cart: {anonymous_cart}")
print(f"Session key: {anonymous_cart.session_key}")

# Get or create products to add to cart
try:
    product1 = Product.objects.first()
    product2 = (
        Product.objects.all()[1]
        if Product.objects.count() > 1
        else Product.objects.first()
    )
    print(
        f"Products: {product1.title}, {product2.title if product2 else 'Only one product'}"
    )
except IndexError:
    print("Need at least 2 products for testing")
    # Create test products if none exist
    product1 = Product.objects.create(
        title="Test Product 1",
        price=29.99,
        inventory_count=10,
        description="Test product 1",
    )
    product2 = Product.objects.create(
        title="Test Product 2",
        price=49.99,
        inventory_count=5,
        description="Test product 2",
    )

# Add items to the session cart
cart_item1 = CartItem.objects.create(cart=anonymous_cart, product=product1, quantity=2)
cart_item2 = CartItem.objects.create(cart=anonymous_cart, product=product2, quantity=1)

print(f"Added items to cart:")
print(f"- {cart_item1.quantity} x {cart_item1.product.title} = ${cart_item1.subtotal}")
print(f"- {cart_item2.quantity} x {cart_item2.product.title} = ${cart_item2.subtotal}")

# Test cart properties
print(f"\nCart Summary:")
print(f"Total items: {anonymous_cart.total_items}")
print(f"Subtotal: ${anonymous_cart.subtotal:.2f}")
print(f"Total: ${anonymous_cart.total:.2f}")
print(f"Items in cart: {anonymous_cart.items.count()}")

# List all items in cart
print(f"\nAll items in cart:")
for item in anonymous_cart.items.all():
    print(
        f"- {item.quantity} x {item.product.title} (${item.product.price}) = ${item.subtotal:.2f}"
    )


# Get or create a test user
try:
    user = User.objects.first()
    if not user:
        user = User.objects.create_user(
            email="test@example.com", password="testpass123"
        )
    print(f"\nUsing user: {user.email}")
except:
    print("No user model available")
    user = None

if user:
    # Create a user-based cart
    user_cart = Cart.objects.create(user=user)
    print(f"Created user cart: {user_cart}")

    # Add items to user cart
    user_cart_item = CartItem.objects.create(
        cart=user_cart, product=product1, quantity=3
    )
    print(
        f"Added to user cart: {user_cart_item.quantity} x {user_cart_item.product.title}"
    )

    # Test user cart properties
    print(f"User cart total items: {user_cart.total_items}")
    print(f"User cart subtotal: ${user_cart.subtotal:.2f}")

    # Test the get_or_create_cart utility function
from cart.utils import get_or_create_cart
from django.http import HttpRequest


# Create a mock request object for testing
class MockRequest:
    def __init__(self, session_key=None, user=None):
        self.session = type("MockSession", (), {"session_key": session_key})()
        self.user = user


# Test with anonymous user
mock_anonymous_request = MockRequest(session_key="test_session_67890")
anonymous_cart = get_or_create_cart(mock_anonymous_request)
print(f"\nAnonymous cart created: {anonymous_cart}")

# Test with authenticated user
if user:
    mock_user_request = MockRequest(user=user)
    user_cart = get_or_create_cart(mock_user_request)
    print(f"User cart created: {user_cart}")


# Test that same product can't be added twice to same cart
try:
    duplicate_item = CartItem.objects.create(
        cart=anonymous_cart, product=product1, quantity=1
    )
    print("ERROR: Should not allow duplicate products in same cart!")
except Exception as e:
    print(f"Correctly prevented duplicate: {e}")

# Test that quantity update works instead
existing_item = CartItem.objects.get(cart=anonymous_cart, product=product1)
existing_item.quantity += 1
existing_item.save()
print(f"Updated quantity: {existing_item.quantity} x {existing_item.product.title}")

# Verify cart totals updated
anonymous_cart.refresh_from_db()
print(f"Updated cart total items: {anonymous_cart.total_items}")
print(f"Updated cart subtotal: ${anonymous_cart.subtotal:.2f}")


# Create multiple session carts with different keys
session_cart_1 = Cart.objects.create(session_key="session_11111")
session_cart_2 = Cart.objects.create(session_key="session_22222")

CartItem.objects.create(cart=session_cart_1, product=product1, quantity=1)
CartItem.objects.create(cart=session_cart_2, product=product2, quantity=2)

print(f"\nMultiple session carts:")
print(f"Session 1: {session_cart_1.session_key} - {session_cart_1.total_items} items")
print(f"Session 2: {session_cart_2.session_key} - {session_cart_2.total_items} items")

# Verify they are separate
print(
    f"Session 1 items: {[f'{item.quantity}x {item.product.title}' for item in session_cart_1.items.all()]}"
)
print(
    f"Session 2 items: {[f'{item.quantity}x {item.product.title}' for item in session_cart_2.items.all()]}"
)


# Test merging session cart into user cart
from cart.utils import merge_carts

if user:
    # Create a session cart with items
    session_cart_to_merge = Cart.objects.create(session_key="merge_session_99999")
    CartItem.objects.create(cart=session_cart_to_merge, product=product1, quantity=2)
    CartItem.objects.create(cart=session_cart_to_merge, product=product2, quantity=1)

    print(f"\nBefore merge:")
    print(f"Session cart items: {session_cart_to_merge.items.count()}")
    print(f"User cart items: {user_cart.items.count()}")

    # Merge carts
    merged_cart = merge_carts(
        MockRequest(session_key="merge_session_99999"), session_cart_to_merge, user_cart
    )

    print(f"After merge:")
    print(f"Merged cart items: {merged_cart.items.count()}")
    print(f"Merged cart total: {merged_cart.total_items} items")

    # Check if session cart was deleted
    session_carts_exists = Cart.objects.filter(
        session_key="merge_session_99999"
    ).exists()
    print(f"Session cart still exists: {session_carts_exists}")


# Clean up test data
print(f"\nCleaning up test data...")
Cart.objects.filter(session_key__startswith="test_").delete()
Cart.objects.filter(session_key__startswith="session_").delete()
Cart.objects.filter(session_key__startswith="merge_").delete()

print("Test completed successfully!")
