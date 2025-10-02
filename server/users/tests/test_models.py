from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError

User = get_user_model()


class UserModelTests(TestCase):
    def test_create_user_success(self):
        """Test creating a regular user successfully"""
        user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="John",
            last_name="Doe",
        )
        self.assertEqual(user.email, "test@example.com")
        self.assertTrue(user.check_password("testpass123"))
        self.assertEqual(user.first_name, "John")
        self.assertEqual(user.last_name, "Doe")
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_admin)
        self.assertFalse(user.is_superuser)

    def test_create_user_without_email_raises_error(self):
        """Test creating user without email raises error"""
        with self.assertRaises(ValueError):
            User.objects.create_user(email=None, password="testpass123")

    def test_create_user_email_normalized(self):
        """Test email is normalized for new users"""
        email = "test@EXAMPLE.COM"
        user = User.objects.create_user(email, "test123")
        self.assertEqual(user.email, "test@example.com")

    def test_create_superuser(self):
        """Test creating a superuser"""
        user = User.objects.create_superuser(
            email="admin@example.com", password="admin123"
        )
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_active)

    def test_create_superuser_without_staff_raises_error(self):
        """Test creating superuser without is_staff=True raises error"""
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                email="admin@example.com", password="admin123", is_staff=False
            )

    def test_user_string_representation(self):
        """Test user string representation"""
        user = User.objects.create_user(email="test@example.com", password="test123")
        self.assertEqual(str(user), "test@example.com")

    def test_unique_email_enforcement(self):
        """Test that duplicate emails are not allowed"""
        User.objects.create_user(email="test@example.com", password="test123")
        with self.assertRaises(IntegrityError):
            User.objects.create_user(email="test@example.com", password="test123")
