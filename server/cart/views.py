from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from .utils import get_or_create_cart, add_to_cart, update_cart_item, merge_carts
from products.models import Product
from django.db import transaction


def get_cart_from_request(request):
    """
    Get or create cart based on user authentication or session key from header
    """
    if request.user.is_authenticated:
        return get_or_create_cart(request)
    else:
        # Get session key from header for mobile apps
        session_key = request.headers.get("X-Session-Key")
        if session_key:
            cart, created = Cart.objects.get_or_create(session_key=session_key)
            return cart
        else:
            # Fallback to regular session for web
            return get_or_create_cart(request)


class CartDetailView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):

        return get_or_create_cart(self.request)


class AddToCartView(generics.CreateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        product_id = request.data.get("product")
        quantity = int(request.data.get("quantity", 1))

        cart = get_or_create_cart(request)
        cart_item, error = add_to_cart(cart, product_id, quantity)

        if error:
            return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UpdateCartItemView(generics.UpdateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        cart = get_or_create_cart(self.request)
        return CartItem.objects.filter(cart=cart)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        quantity = request.data.get("quantity")

        if quantity is None:
            return Response(
                {"error": "Quantity is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {"error": "Quantity must be a number"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart = get_or_create_cart(request)
        cart_item, error = update_cart_item(cart, kwargs["pk"], quantity)

        if error:
            if "removed" in error:
                return Response({"message": error}, status=status.HTTP_200_OK)
            return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(cart_item)
        return Response(serializer.data)


class RemoveFromCartView(generics.DestroyAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        cart = get_or_create_cart(self.request)
        return CartItem.objects.filter(cart=cart)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"message": "Item removed from cart"}, status=status.HTTP_200_OK
        )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def merge_carts_view(request):
    """
    Merge anonymous cart into user cart after login
    """
    if not request.session.session_key:
        return Response({"message": "No session cart to merge"})

    try:
        session_cart = Cart.objects.get(session_key=request.session.session_key)
        user_cart = get_or_create_cart(request)

        merged_cart = merge_carts(request, session_cart, user_cart)

        serializer = CartSerializer(merged_cart)
        return Response(
            {"message": "Carts merged successfully", "cart": serializer.data}
        )
    except Cart.DoesNotExist:
        return Response({"message": "No session cart found"})
