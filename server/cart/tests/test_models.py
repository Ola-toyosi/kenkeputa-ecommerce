from django.test import TestCase
from django.contrib.auth import get_user_model
from products.models import Product
from cart.models import Cart, CartItem
from decimal import Decimal

User = get_user_model()


class CartModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com", password="test123"
        )
        self.product = Product.objects.create(
            title="Test Product", price=29.99, inventory_count=100
        )

    def test_create_user_cart(self):
        """Test creating cart for authenticated user"""
        cart = Cart.objects.create(user=self.user)
        self.assertEqual(cart.user, self.user)
        self.assertIsNone(cart.session_key)
        self.assertEqual(str(cart), f"Cart for {self.user.email}")

    def test_create_anonymous_cart(self):
        """Test creating cart for anonymous user"""
        cart = Cart.objects.create(session_key="test-session-key")
        self.assertIsNone(cart.user)
        self.assertEqual(cart.session_key, "test-session-key")
        self.assertEqual(str(cart), "Anonymous Cart (test-session-key)")

    def test_cart_total_items_empty(self):
        """Test total_items for empty cart"""
        cart = Cart.objects.create(user=self.user)
        self.assertEqual(cart.total_items, 0)

    def test_cart_subtotal_empty(self):
        """Test subtotal for empty cart"""
        cart = Cart.objects.create(user=self.user)
        self.assertEqual(cart.subtotal, 0)

    def test_cart_item_creation(self):
        """Test creating cart item"""
        cart = Cart.objects.create(user=self.user)
        cart_item = CartItem.objects.create(cart=cart, product=self.product, quantity=2)

        self.assertEqual(cart_item.quantity, 2)
        self.assertEqual(cart_item.subtotal, 59.98)
        self.assertEqual(str(cart_item), f"2 x {self.product.title}")

    def test_cart_totals_with_items(self):
        """Test cart totals with items"""
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=2)

        # Create another product
        product2 = Product.objects.create(
            title="Another Product", price=15.00, inventory_count=50
        )
        CartItem.objects.create(cart=cart, product=product2, quantity=1)

        self.assertEqual(cart.total_items, 3)
        self.assertEqual(cart.subtotal, Decimal("74.98"))  # (2 * 29.99) + (1 * 15.00)
        self.assertEqual(cart.total, Decimal("74.98"))

    def test_cart_item_unique_together(self):
        """Test that same product can't be added twice to same cart"""
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=1)

        # Try to create another item with same product
        with self.assertRaises(Exception):  # IntegrityError or ValidationError
            CartItem.objects.create(cart=cart, product=self.product, quantity=2)
