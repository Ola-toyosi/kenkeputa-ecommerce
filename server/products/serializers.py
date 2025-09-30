from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    price = serializers.FloatField()  # 🔥 force numbers, not strings

    class Meta:
        model = Product
        fields = "__all__"
