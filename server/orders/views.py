from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db import transaction
from .models import Order, OrderItem
from cart.models import CartItem
from products.models import Product
from .serializers import OrderSerializer


# Create your views here.


class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        user = request.user
        cart_items = CartItem.objects.filter(user=user)

        if not cart_items.exists():
            return Response(
                {"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST
            )

        total_price = 0
        order = Order.objects.create(user=user, total_price=0)

        for item in cart_items:
            product = item.product
            if product.stock < item.quantity:
                transaction.set_rollback(True)
                return Response(
                    {"error": f"Not enough stock for {product.name}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            product.stock -= item.quantity
            product.save()

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item.quantity,
                price=product.price,
            )
            total_price += product.price * item.quantity

        order.total_price = total_price
        order.save()

        cart_items.delete()

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)
