# cart/serializers.py
from rest_framework import serializers
from .models import Cart, CartItem
from products.models import Product
from products.serializers import ProductSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source="product", read_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product",
            "product_detail",
            "quantity",
            "subtotal",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "subtotal"]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    subtotal = serializers.ReadOnlyField()
    total = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = [
            "id",
            "user",
            "session_key",
            "items",
            "total_items",
            "subtotal",
            "total",
            "created_at",
        ]
        read_only_fields = ["id", "user", "session_key", "created_at"]
