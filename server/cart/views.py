from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import CartItem
from .serializers import CartItemSerializer
from products.models import Product
from django.db import transaction


class CartListCreateView(generics.ListCreateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Each user only sees their own cart
        return CartItem.objects.filter(user=self.request.user)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        product_id = request.data.get("product")
        quantity = int(request.data.get("quantity", 1))

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if product.inventory_count < quantity:
            return Response(
                {"error": "Not enough stock available"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # If user already has this product in cart → update quantity
        cart_item, created = CartItem.objects.get_or_create(
            user=request.user, product=product, defaults={"quantity": quantity}
        )

        if not created:
            new_quantity = cart_item.quantity + quantity
            if product.inventory_count < new_quantity:
                return Response(
                    {"error": "Exceeds available stock"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            cart_item.quantity = new_quantity
            cart_item.save()

        serializer = self.get_serializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CartDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)
