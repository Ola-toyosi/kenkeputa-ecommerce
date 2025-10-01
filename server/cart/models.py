from django.db import models
from django.conf import settings
from products.models import Product

# Create your models here.


class CartItem(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="cart_items"
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)  # ✅
    updated_at = models.DateTimeField(auto_now=True)  # ✅

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("user", "product")

    @property
    def subtotal(self):
        return self.quantity * self.product.price
