from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from products.models import Product
from cart.models import Cart, CartItem

User = get_user_model()


class CartViewsTests(APITestCase):
    def setUp(self):
        self.cart_detail_url = reverse("cart-detail")
        self.add_to_cart_url = reverse("add-to-cart")
        self.user = User.objects.create_user(
            email="test@example.com", password="test123"
        )
        self.product = Product.objects.create(
            title="Test Product", price=29.99, inventory_count=100
        )
        self.low_stock_product = Product.objects.create(
            title="Low Stock Product", price=19.99, inventory_count=2
        )

    def test_get_cart_authenticated(self):
        """Test getting cart for authenticated user"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.cart_detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("items", response.data)
        self.assertEqual(response.data["total_items"], 0)

    def test_get_cart_anonymous(self):
        """Test getting cart for anonymous user with session key"""
        response = self.client.get(
            self.cart_detail_url, HTTP_X_SESSION_KEY="test-session"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_add_to_cart_authenticated(self):
        """Test adding item to cart for authenticated user"""
        self.client.force_authenticate(user=self.user)
        data = {"product": self.product.id, "quantity": 2}
        response = self.client.post(self.add_to_cart_url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["quantity"], 2)

        # Verify cart was created
        cart = Cart.objects.get(user=self.user)
        self.assertEqual(cart.total_items, 2)

    def test_add_to_cart_insufficient_stock(self):
        """Test adding more items than available stock"""
        self.client.force_authenticate(user=self.user)
        data = {
            "product": self.low_stock_product.id,
            "quantity": 5,  # More than available stock (2)
        }
        response = self.client.post(self.add_to_cart_url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_update_cart_item(self):
        """Test updating cart item quantity"""
        self.client.force_authenticate(user=self.user)

        # First add item to cart
        cart = Cart.objects.create(user=self.user)
        cart_item = CartItem.objects.create(cart=cart, product=self.product, quantity=1)

        # Update quantity
        update_url = reverse("update-cart-item", args=[cart_item.id])
        data = {"quantity": 3}
        response = self.client.patch(update_url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["quantity"], 3)

    def test_remove_cart_item(self):
        """Test removing item from cart"""
        self.client.force_authenticate(user=self.user)

        # First add item to cart
        cart = Cart.objects.create(user=self.user)
        cart_item = CartItem.objects.create(cart=cart, product=self.product, quantity=1)

        # Remove item
        remove_url = reverse("remove-cart-item", args=[cart_item.id])
        response = self.client.delete(remove_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(cart.items.count(), 0)

    def test_merge_carts_after_login(self):
        """Test merging anonymous cart with user cart after login"""
        # Create anonymous cart with session
        session_cart = Cart.objects.create(session_key="test-session")
        CartItem.objects.create(cart=session_cart, product=self.product, quantity=2)

        self.client.force_authenticate(user=self.user)
        merge_url = reverse("merge-carts")
        data = {"session_key": "test-session"}
        response = self.client.post(merge_url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Carts merged successfully", response.data["message"])

        # Verify items were merged
        user_cart = Cart.objects.get(user=self.user)
        self.assertEqual(user_cart.total_items, 2)
