# cart/models.py
from django.db import models
from django.conf import settings
from products.models import Product
import uuid


class Cart(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="carts",
    )

    # For anonymous users (session-based)
    session_key = models.CharField(max_length=40, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [("user",), ("session_key",)]
        ordering = ["-created_at"]

    def __str__(self):
        if self.user:
            return f"Cart for {self.user.email}"
        return f"Anonymous Cart ({self.session_key})"

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def subtotal(self):
        return sum(item.subtotal for item in self.items.all())

    @property
    def total(self):
        return self.subtotal  # Add shipping/tax logic here if needed


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("cart", "product")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.quantity} x {self.product.title}"

    @property
    def subtotal(self):
        return self.quantity * self.product.price

    def clean(self):
        from django.core.exceptions import ValidationError

        if self.quantity > self.product.inventory_count:
            raise ValidationError("Quantity exceeds available stock")
