from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Product
        fields = "__all__"

    def get_image_url(self, obj):
        """
        Return the full URL of the uploaded image if available,
        otherwise fall back to the saved `image_url` field.
        """
        request = self.context.get("request")

        # ✅ Uploaded file takes priority
        if obj.image:
            return (
                request.build_absolute_uri(obj.image.url) if request else obj.image.url
            )

        # ✅ Fallback to manually set URL
        return obj.image_url
