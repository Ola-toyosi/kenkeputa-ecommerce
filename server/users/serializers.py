from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "username", "is_admin", "is_staff", "is_superuser")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(
        choices=[("customer", "Customer"), ("vendor", "Vendor")],
        default="customer",
        write_only=True,
    )

    class Meta:
        model = User
        fields = ("email", "username", "password", "role")

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        role = validated_data.pop("role", "customer")

        user = User.objects.create_user(
            email=validated_data["email"],
            username=validated_data.get("username", ""),
            password=validated_data["password"],
        )

        # Assign role
        if role == "vendor":
            user.is_staff = True
        user.save()

        return user
