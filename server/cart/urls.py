from django.urls import path
from .views import (
    CartDetailView,
    AddToCartView,
    UpdateCartItemView,
    RemoveFromCartView,
    merge_carts_view,
)

urlpatterns = [
    path("", CartDetailView.as_view(), name="cart-detail"),
    path("add/", AddToCartView.as_view(), name="add-to-cart"),
    path(
        "items/<int:pk>/update/",
        UpdateCartItemView.as_view(),
        name="update-cart-item",
    ),
    path(
        "items/<int:pk>/remove/",
        RemoveFromCartView.as_view(),
        name="remove-cart-item",
    ),
    path("merge/", merge_carts_view, name="merge-carts"),
]
