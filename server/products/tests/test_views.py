from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from ..models import Product

User = get_user_model()


class ProductViewSetTests(APITestCase):
    def setUp(self):
        self.product_list_url = reverse("product-list")
        self.categories_url = reverse("product-list-categories")

        # Clear any existing products first
        Product.objects.all().delete()

        # Create distinct test products with unique attributes
        self.product1 = Product.objects.create(
            title="Gaming Laptop Pro",
            description="High performance gaming laptop for professionals",
            price=999.99,
            inventory_count=10,
            category="Electronics",
        )
        self.product2 = Product.objects.create(
            title="Cotton T-shirt Blue",
            description="Comfortable blue cotton t-shirt",
            price=19.99,
            inventory_count=50,
            category="Clothing",
        )
        self.product3 = Product.objects.create(
            title="Smartphone X",
            description="Latest smartphone with advanced features",
            price=699.99,
            inventory_count=15,
            category="Electronics",
        )

        # Create users
        self.user = User.objects.create_user(
            email="user@example.com", password="test123"
        )
        self.admin_user = User.objects.create_user(
            email="admin@example.com", password="admin123", is_staff=True
        )

    def test_list_products_unauthenticated(self):
        """Test that anyone can list products"""
        response = self.client.get(self.product_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return ALL products (3 total)
        self.assertEqual(len(response.data["results"]), 3)

    def test_search_products(self):
        """Test product search functionality"""
        # Search for a very specific term
        response = self.client.get(
            self.product_list_url, {"search": "Gaming Laptop Pro"}
        )
        print(f"Search results: {len(response.data['results'])}")  # Debug
        for product in response.data["results"]:
            print(f"Product: {product['title']}")  # Debug

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["title"], "Gaming Laptop Pro")

    def test_filter_products_by_category(self):
        """Test filtering products by category"""
        # Filter for Electronics - should return 2 products
        response = self.client.get(self.product_list_url, {"category": "Electronics"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 2)

        # Verify they are both in Electronics category
        for product in response.data["results"]:
            self.assertEqual(product["category"], "Electronics")

        # Filter for Clothing - should return 1 product
        response = self.client.get(self.product_list_url, {"category": "Clothing"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["category"], "Clothing")

    def test_list_categories(self):
        """Test listing all categories"""
        response = self.client.get(self.categories_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("categories", response.data)
        # Should have both categories
        self.assertIn("Electronics", response.data["categories"])
        self.assertIn("Clothing", response.data["categories"])
        self.assertEqual(len(response.data["categories"]), 2)

    def test_create_product_requires_admin(self):
        """Test that only admins can create products"""
        # Try as regular user
        self.client.force_authenticate(user=self.user)
        data = {"title": "New Product", "price": 49.99, "inventory_count": 25}
        response = self.client.post(self.product_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Try as admin
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(self.product_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_update_product_requires_admin(self):
        """Test that only admins can update products"""
        # Try as regular user
        self.client.force_authenticate(user=self.user)
        data = {"title": "Updated Title"}
        response = self.client.patch(
            reverse("product-detail", args=[self.product1.id]), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Try as admin
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.patch(
            reverse("product-detail", args=[self.product1.id]), data
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Updated Title")

    def test_debug_filter_configuration(self):
        """Debug test to check filter configuration"""
        from products.views import ProductViewSet

        print("\n=== DEBUG FILTER CONFIGURATION ===")

        # Check ViewSet configuration
        viewset = ProductViewSet()
        print(f"Filter backends: {viewset.filter_backends}")
        print(f"Search fields: {viewset.search_fields}")
        print(f"Filterset fields: {getattr(viewset, 'filterset_fields', 'Not set')}")

        # Test the actual API endpoints
        print("\n--- Testing Search ---")
        response = self.client.get(self.product_list_url, {"search": "Gaming"})
        print(f"Search URL: {self.product_list_url}?search=Gaming")
        print(f"Search Status: {response.status_code}")
        print(f"Search Results Count: {len(response.data.get('results', []))}")
        if response.data.get("results"):
            for product in response.data["results"]:
                print(f"  - {product['title']} (Category: {product['category']})")

        print("\n--- Testing Category Filter ---")
        response = self.client.get(self.product_list_url, {"category": "Electronics"})
        print(f"Filter URL: {self.product_list_url}?category=Electronics")
        print(f"Filter Status: {response.status_code}")
        print(f"Filter Results Count: {len(response.data.get('results', []))}")
        if response.data.get("results"):
            for product in response.data["results"]:
                print(f"  - {product['title']} (Category: {product['category']})")

        print("\n--- Testing All Products ---")
        response = self.client.get(self.product_list_url)
        print(f"All Products Count: {len(response.data.get('results', []))}")

        # This test should always pass since it's just for debugging
        self.assertTrue(True)
