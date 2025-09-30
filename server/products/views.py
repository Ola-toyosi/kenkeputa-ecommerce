from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Product
from .serializers import ProductSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.is_admin


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("-created_at")
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    search_fields = ["title", "description", "category"]
    filterset_fields = ["category"]
    pagination_class = PageNumberPagination

    @action(detail=False, methods=["get"], url_path="categories/list")
    def list_categories(self, request):
        categories = (
            Product.objects.values_list("category", flat=True)
            .distinct()
            .exclude(category="")  # don’t include empty categories
        )
        return Response({"categories": list(categories)})
