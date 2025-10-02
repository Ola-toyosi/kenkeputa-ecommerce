from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ErrorDetail
from ..serializers import RegisterSerializer, UserSerializer

User = get_user_model()


class RegisterSerializerTests(TestCase):
    def test_valid_registration_data(self):
        """Test serializer with valid registration data"""
        data = {
            "email": "test@example.com",
            "password": "StrongPass123!",
            "first_name": "John",
            "last_name": "Doe",
            "role": "customer",
        }
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_weak_password_validation(self):
        """Test password validation with weak password"""
        data = {
            "email": "test@example.com",
            "password": "123",  # Too weak
            "first_name": "John",
            "last_name": "Doe",
        }
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("password", serializer.errors)

    def test_create_customer_user(self):
        """Test creating a customer user via serializer"""
        data = {
            "email": "customer@example.com",
            "password": "StrongPass123!",
            "first_name": "John",
            "last_name": "Doe",
            "role": "customer",
        }
        serializer = RegisterSerializer(data=data)
        serializer.is_valid()
        user = serializer.save()

        self.assertEqual(user.email, "customer@example.com")
        self.assertFalse(user.is_staff)

    def test_create_vendor_user(self):
        """Test creating a vendor user via serializer"""
        data = {
            "email": "vendor@example.com",
            "password": "StrongPass123!",
            "first_name": "Jane",
            "last_name": "Smith",
            "role": "vendor",
        }
        serializer = RegisterSerializer(data=data)
        serializer.is_valid()
        user = serializer.save()

        self.assertEqual(user.email, "vendor@example.com")
        self.assertTrue(user.is_staff)
