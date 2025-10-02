from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db import transaction
from .models import Order, OrderItem
from cart.models import Cart
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
        shipping_address = request.data.get("shipping_address", "")

        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            return Response(
                {"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST
            )

        if not cart.items.exists():
            return Response(
                {"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Create the order
        order = Order.objects.create(
            user=user,
            total_price=0,
            shipping_address=shipping_address,
        )

        total_price = 0

        for item in cart.items.all():
            product = item.product

            # Stock check
            if product.inventory_count < item.quantity:
                transaction.set_rollback(True)
                return Response(
                    {"error": f"Not enough stock for {product.title}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Deduct stock
            product.inventory_count -= item.quantity
            product.save()

            # Create order item
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item.quantity,
                price=product.price,
            )
            total_price += product.price * item.quantity

        # Update order total
        order.total_price = total_price
        order.save()

        # Clear cart
        cart.items.all().delete()

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)
