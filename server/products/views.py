from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Product
from .serializers import ProductSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.is_staff


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("-created_at")
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    pagination_class = PageNumberPagination
    filterset_fields = ["category"]
    search_fields = ["title", "description", "category"]
    pagination_class = PageNumberPagination

    def get_queryset(self):
        """Override to ensure we're always using the base queryset"""
        if not self.request.user.is_staff:
            qs = qs.filter(is_active=True)
            return qs
        return Product.objects.all().order_by("-created_at")

    @action(detail=False, methods=["get"], url_path="categories/list")
    def list_categories(self, request):
        categories = (
            Product.objects.values_list("category", flat=True)
            .distinct()
            .exclude(category="")  # don’t include empty categories
        )
        return Response({"categories": list(categories)})

    def perform_destroy(self, instance):
        if instance.orderitem_set.exists():
            # Instead of deleting, mark inactive
            instance.is_active = False
            instance.save()
        else:
            instance.delete()
