from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


class UserViewsTests(APITestCase):
    def setUp(self):
        self.register_url = reverse("signup")
        self.me_url = reverse("me")

    def test_user_registration_success(self):
        """Test successful user registration"""
        data = {
            "email": "test@example.com",
            "password": "StrongPass123!",
            "first_name": "John",
            "last_name": "Doe",
            "role": "customer",
        }
        response = self.client.post(self.register_url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertIn("user", response.data)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_user_registration_duplicate_email(self):
        """Test registration with duplicate email fails"""
        User.objects.create_user(email="test@example.com", password="test123")

        data = {
            "email": "test@example.com",
            "password": "StrongPass123!",
            "first_name": "John",
            "last_name": "Doe",
        }
        response = self.client.post(self.register_url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_me_endpoint_requires_authentication(self):
        """Test that /me endpoint requires authentication"""
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_endpoint_authenticated(self):
        """Test /me endpoint returns user data when authenticated"""
        user = User.objects.create_user(email="test@example.com", password="test123")
        self.client.force_authenticate(user=user)

        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "test@example.com")
