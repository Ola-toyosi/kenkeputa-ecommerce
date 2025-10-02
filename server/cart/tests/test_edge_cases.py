from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from products.models import Product
from cart.models import Cart, CartItem

User = get_user_model()


class CartEdgeCasesTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com", password="test123"
        )
        self.zero_stock_product = Product.objects.create(
            title="Zero Stock Product", price=19.99, inventory_count=0
        )

    def test_add_zero_quantity_to_cart(self):
        """Test adding zero quantity to cart"""
        self.client.force_authenticate(user=self.user)
        product = Product.objects.create(
            title="Test Product", price=29.99, inventory_count=10
        )

        data = {"product": product.id, "quantity": 0}
        response = self.client.post(reverse("add-to-cart"), data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_add_to_cart_zero_stock_product(self):
        """Test adding product with zero inventory"""
        self.client.force_authenticate(user=self.user)

        data = {"product": self.zero_stock_product.id, "quantity": 1}
        response = self.client.post(reverse("add-to-cart"), data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_cart_item_to_zero_removes_it(self):
        """Test updating cart item quantity to zero removes it"""
        self.client.force_authenticate(user=self.user)

        product = Product.objects.create(
            title="Test Product", price=29.99, inventory_count=10
        )
        cart = Cart.objects.create(user=self.user)
        cart_item = CartItem.objects.create(cart=cart, product=product, quantity=2)

        # Update quantity to 0
        update_url = reverse("update-cart-item", args=[cart_item.id])
        data = {"quantity": 0}
        response = self.client.patch(update_url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("removed", response.data["message"])
        self.assertEqual(cart.items.count(), 0)
