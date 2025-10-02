from django.test import TestCase
from django.urls import reverse
from decimal import Decimal
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from products.models import Product
from cart.models import Cart, CartItem
from ..models import Order

User = get_user_model()


class OrderViewsTests(APITestCase):
    def setUp(self):
        self.order_list_url = reverse("order-list-create")
        self.user = User.objects.create_user(
            email="test@example.com", password="test123"
        )
        self.product1 = Product.objects.create(
            title="Product 1", price=29.99, inventory_count=10
        )
        self.product2 = Product.objects.create(
            title="Product 2", price=15.00, inventory_count=5
        )

    def test_create_order_requires_authentication(self):
        """Test that creating order requires authentication"""
        response = self.client.post(self.order_list_url, {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_order_success(self):
        """Test successful order creation"""
        self.client.force_authenticate(user=self.user)

        # Create cart with items
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product1, quantity=2)
        CartItem.objects.create(cart=cart, product=self.product2, quantity=1)

        data = {"shipping_address": "123 Test Street, City, Country"}
        response = self.client.post(self.order_list_url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify order was created
        order = Order.objects.get(user=self.user)
        self.assertEqual(
            order.total_price, Decimal("74.98")
        )  # (2 * 29.99) + (1 * 15.00)
        self.assertEqual(order.status, "pending")

        # Verify cart was cleared
        self.assertEqual(cart.items.count(), 0)

        # Verify stock was updated
        self.product1.refresh_from_db()
        self.product2.refresh_from_db()
        self.assertEqual(self.product1.inventory_count, 8)  # 10 - 2
        self.assertEqual(self.product2.inventory_count, 4)  # 5 - 1

    def test_create_order_empty_cart(self):
        """Test creating order with empty cart fails"""
        self.client.force_authenticate(user=self.user)

        # Create empty cart
        Cart.objects.create(user=self.user)

        response = self.client.post(self.order_list_url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_create_order_insufficient_stock(self):
        """Test creating order with insufficient stock fails"""
        self.client.force_authenticate(user=self.user)

        # Create cart with more items than available stock
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(
            cart=cart, product=self.product2, quantity=10
        )  # Only 5 available

        response = self.client.post(self.order_list_url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_list_orders_authenticated(self):
        """Test user can only see their own orders"""
        self.client.force_authenticate(user=self.user)

        # Create order for this user
        order = Order.objects.create(
            user=self.user, total_price=29.99, status="pending"
        )

        # Create another user and order
        other_user = User.objects.create_user(
            email="other@example.com", password="test123"
        )
        Order.objects.create(user=other_user, total_price=49.99, status="pending")

        response = self.client.get(self.order_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Handle paginated response
        if "results" in response.data:
            # Paginated response
            orders_data = response.data["results"]
        else:
            # Non-paginated response
            orders_data = response.data

        self.assertEqual(len(orders_data), 1)  # Only user's order
        self.assertEqual(orders_data[0]["id"], order.id)

    def test_order_detail_own_order(self):
        """Test user can retrieve their own order details"""
        self.client.force_authenticate(user=self.user)

        order = Order.objects.create(
            user=self.user, total_price=29.99, status="pending"
        )

        detail_url = reverse("order-detail", args=[order.id])
        response = self.client.get(detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], order.id)

    def test_order_detail_other_user_order(self):
        """Test user cannot retrieve another user's order details"""
        self.client.force_authenticate(user=self.user)

        other_user = User.objects.create_user(
            email="other@example.com", password="test123"
        )
        order = Order.objects.create(
            user=other_user, total_price=29.99, status="pending"
        )

        detail_url = reverse("order-detail", args=[order.id])
        response = self.client.get(detail_url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
