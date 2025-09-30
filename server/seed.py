import os
import django
import random
from decimal import Decimal

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model
from products.models import Product
from cart.models import CartItem
from orders.models import Order, OrderItem

User = get_user_model()


def run():
    print("Seeding database with demo data...")

    # 1️⃣ Create demo users
    if not User.objects.filter(email="admin@kenkeputa.com").exists():
        admin_user = User.objects.create_superuser(
            email="admin@kenkeputa.com",
            password="admin123",
            username="admin1",
            is_admin=True,
        )
        print("✅ Created admin user: admin@kenkeputa.com / admin123")
    else:
        admin_user = User.objects.get(email="admin@kenkeputa.com")

    if not User.objects.filter(email="customer@kenkeputa.com").exists():
        customer_user = User.objects.create_user(
            email="customer@kenkeputa.com",
            password="customer123",
            username="customer",
            is_admin=False,
        )
        print("✅ Created customer user: customer@kenkeputa.com / customer123")
    else:
        customer_user = User.objects.get(email="customer@kenkeputa.com")

    # 2️⃣ Create demo products
    Product.objects.all().delete()

    product_data = [
        {
            "title": "Wireless Bluetooth Headphones",
            "description": "Premium noise-cancelling over-ear headphones with 30-hour battery life. Perfect for music lovers and professionals.",
            "price": Decimal("149.99"),
            "inventory_count": 25,
            "category": "Electronics",
            "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
        },
        {
            "title": "Smartphone Pro Max",
            "description": "Latest smartphone with triple camera system, 5G connectivity, and all-day battery life.",
            "price": Decimal("899.99"),
            "inventory_count": 15,
            "category": "Electronics",
            "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop",
        },
        {
            "title": "Ultra-Thin Laptop",
            "description": "Lightweight laptop with 16GB RAM, 512GB SSD, and 14-inch retina display. Perfect for work and creativity.",
            "price": Decimal("1299.99"),
            "inventory_count": 10,
            "category": "Electronics",
            "image_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop",
        },
        {
            "title": "Gaming Mechanical Keyboard",
            "description": "RGB mechanical keyboard with customizable lighting and responsive switches for gaming enthusiasts.",
            "price": Decimal("79.99"),
            "inventory_count": 30,
            "category": "Electronics",
            "image_url": "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500&h=500&fit=crop",
        },
        {
            "title": "Smart Coffee Maker",
            "description": "Programmable coffee maker with Wi-Fi connectivity and built-in grinder. Start your day perfectly.",
            "price": Decimal("199.99"),
            "inventory_count": 20,
            "category": "Home Appliances",
            "image_url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=500&fit=crop",
        },
        {
            "title": "Fitness Tracker Watch",
            "description": "Advanced fitness tracker with heart rate monitoring, GPS, and 7-day battery life.",
            "price": Decimal("129.99"),
            "inventory_count": 35,
            "category": "Wearables",
            "image_url": "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=500&h=500&fit=crop",
        },
        {
            "title": "Wireless Earbuds",
            "description": "True wireless earbuds with active noise cancellation and 24-hour total battery life.",
            "price": Decimal("179.99"),
            "inventory_count": 40,
            "category": "Electronics",
            "image_url": "https://images.unsplash.com/photo-1590658165737-15a047b8b5e3?w=500&h=500&fit=crop",
        },
        {
            "title": "4K Ultra HD TV",
            "description": "55-inch 4K Smart TV with HDR support and built-in streaming apps for immersive entertainment.",
            "price": Decimal("699.99"),
            "inventory_count": 8,
            "category": "Electronics",
            "image_url": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&h=500&fit=crop",
        },
        {
            "title": "Professional Camera",
            "description": "Mirrorless camera with 24MP sensor, 4K video recording, and interchangeable lenses.",
            "price": Decimal("1199.99"),
            "inventory_count": 12,
            "category": "Electronics",
            "image_url": "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&h=500&fit=crop",
        },
        {
            "title": "Ergonomic Office Chair",
            "description": "Premium ergonomic office chair with lumbar support and adjustable height for all-day comfort.",
            "price": Decimal("299.99"),
            "inventory_count": 18,
            "category": "Furniture",
            "image_url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop",
        },
        {
            "title": "Portable Bluetooth Speaker",
            "description": "Waterproof Bluetooth speaker with 360-degree sound and 12-hour battery life.",
            "price": Decimal("89.99"),
            "inventory_count": 50,
            "category": "Electronics",
            "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop",
        },
        {
            "title": "Electric Standing Desk",
            "description": "Height-adjustable electric standing desk with memory presets and spacious work surface.",
            "price": Decimal("449.99"),
            "inventory_count": 7,
            "category": "Furniture",
            "image_url": "https://images.unsplash.com/photo-1533090368676-1fd25485db88?w=500&h=500&fit=crop",
        },
    ]

    products = []
    for data in product_data:
        product = Product.objects.create(**data)
        products.append(product)
        print(f"✅ Created product: {product.title} - ${product.price}")

    print(f"🎉 Created {len(products)} demo products")

    # 3️⃣ Add items to cart for demo user
    CartItem.objects.filter(user=customer_user).delete()

    cart_products = random.sample(products, 3)
    for product in cart_products:
        CartItem.objects.create(
            user=customer_user, product=product, quantity=random.randint(1, 3)
        )
        print(f"🛒 Added {product.title} to customer's cart")

    # 4️⃣ Create sample orders
    Order.objects.filter(user=customer_user).delete()
    OrderItem.objects.all().delete()

    # Create a completed order
    completed_order = Order.objects.create(
        user=customer_user,
        total_price=Decimal("0.00"),  # Will calculate below
        status="shipped",
    )

    # Add items to completed order
    order_products = random.sample(products, 2)
    order_total = Decimal("0.00")

    for product in order_products:
        quantity = random.randint(1, 2)
        item_total = product.price * quantity
        order_total += item_total

        OrderItem.objects.create(
            order=completed_order,
            product=product,
            quantity=quantity,
            price=product.price,
        )
        print(f"📦 Added {quantity}x {product.title} to completed order")

    # Update order total
    completed_order.total_price = order_total
    completed_order.save()

    # Create a pending order
    pending_order = Order.objects.create(
        user=customer_user, total_price=Decimal("0.00"), status="pending"
    )

    pending_products = random.sample(
        [p for p in products if p not in order_products], 2
    )
    pending_total = Decimal("0.00")

    for product in pending_products:
        quantity = random.randint(1, 3)
        item_total = product.price * quantity
        pending_total += item_total

        OrderItem.objects.create(
            order=pending_order, product=product, quantity=quantity, price=product.price
        )
        print(f"📦 Added {quantity}x {product.title} to pending order")

    # Update pending order total
    pending_order.total_price = pending_total
    pending_order.save()

    print(f"✅ Created 2 demo orders for {customer_user.email}")
    print(f"   - Order #{completed_order.id}: ${completed_order.total_price} (Shipped)")
    print(f"   - Order #{pending_order.id}: ${pending_order.total_price} (Pending)")

    # 5️⃣ Create some admin products
    admin_products_data = [
        {
            "title": "Limited Edition Smartwatch",
            "description": "Exclusive limited edition smartwatch with premium materials and advanced health tracking.",
            "price": Decimal("499.99"),
            "inventory_count": 5,
            "category": "Wearables",
            "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
        },
        {
            "title": "Professional Drone",
            "description": "4K professional drone with obstacle avoidance and 30-minute flight time.",
            "price": Decimal("1299.99"),
            "inventory_count": 3,
            "category": "Electronics",
            "image_url": "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500&h=500&fit=crop",
        },
    ]

    for data in admin_products_data:
        product = Product.objects.create(**data)
        products.append(product)
        print(f"⭐ Created premium product: {product.title} - ${product.price}")

    print("\n🎊 Seeding complete!")
    print("\n📊 Summary:")
    print(
        f"   👥 Users: {User.objects.count()} (admin@kenkeputa.com / customer@kenkeputa.com)"
    )
    print(f"   📦 Products: {Product.objects.count()}")
    print(f"   🛒 Cart items: {CartItem.objects.count()}")
    print(f"   📋 Orders: {Order.objects.count()}")
    print(f"   📝 Order items: {OrderItem.objects.count()}")

    print("\n🔑 Login Credentials:")
    print("   Admin: admin@kenkeputa.com / admin123")
    print("   Customer: customer@kenkeputa.com / customer123")


if __name__ == "__main__":
    run()
