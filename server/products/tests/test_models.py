from django.test import TestCase
from ..models import Product


class ProductModelTests(TestCase):
    def test_create_product_success(self):
        """Test creating a product successfully"""
        product = Product.objects.create(
            title="Test Product",
            description="Test Description",
            price=29.99,
            inventory_count=100,
            category="Electronics",
        )

        self.assertEqual(product.title, "Test Product")
        self.assertEqual(product.price, 29.99)
        self.assertEqual(product.inventory_count, 100)
        self.assertEqual(product.category, "Electronics")
        self.assertEqual(product.name, "Test Product")  # Test alias property

    def test_product_string_representation(self):
        """Test product string representation"""
        product = Product.objects.create(title="Test Product", price=29.99)
        self.assertEqual(str(product), "Test Product")

    def test_product_with_zero_inventory(self):
        """Test product with zero inventory"""
        product = Product.objects.create(
            title="Out of Stock Product", price=19.99, inventory_count=0
        )
        self.assertEqual(product.inventory_count, 0)
