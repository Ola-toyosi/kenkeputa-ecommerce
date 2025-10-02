from django.test import TestCase
from django.contrib.auth import get_user_model
from products.models import Product
from ..models import Order, OrderItem

User = get_user_model()


class OrderModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com", password="test123"
        )
        self.product = Product.objects.create(
            title="Test Product", price=29.99, inventory_count=100
        )

    def test_create_order(self):
        """Test creating an order"""
        order = Order.objects.create(
            user=self.user,
            total_price=59.98,
            status="pending",
            shipping_address="123 Test St",
        )

        self.assertEqual(order.user, self.user)
        self.assertEqual(order.total_price, 59.98)
        self.assertEqual(order.status, "pending")
        self.assertEqual(str(order), f"Order {order.id} - {self.user.email}")

    def test_create_order_item(self):
        """Test creating order item"""
        order = Order.objects.create(user=self.user, total_price=29.99)
        order_item = OrderItem.objects.create(
            order=order, product=self.product, quantity=1, price=29.99
        )

        self.assertEqual(order_item.quantity, 1)
        self.assertEqual(order_item.price, 29.99)
        self.assertEqual(order_item.subtotal, 29.99)
        self.assertEqual(str(order_item), f"1 x {self.product.title}")

    def test_order_ordering(self):
        """Test that orders are ordered by creation date descending"""
        order1 = Order.objects.create(user=self.user, total_price=10.00)
        order2 = Order.objects.create(user=self.user, total_price=20.00)

        orders = Order.objects.all()
        self.assertEqual(orders[0], order2)  # Most recent first
        self.assertEqual(orders[1], order1)
