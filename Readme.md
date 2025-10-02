```markdown
# Kenkeputa E-Commerce

A full-stack e-commerce platform built with **Django Rest Framework (backend)** and **React Native / Expo (mobile client)**.  
Supports product management, image uploads, carts, and orders.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Ola-toyosi/kenkeputa-ecommerce.git
cd kenkeputa-ecommerce
```

### 2. Backend (Django)
```bash
cd server
python -m venv venv
source venv/bin/activate   # on Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` file (see `.env.example`) and apply migrations:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

The API will be available at:
- `http://127.0.0.1:8000/api/` (local)
- `http://<LAN_IP>:8000/api/` (for mobile devices via Expo Go)

### 3. Mobile Client (Expo React Native)
```bash
cd client
npm install
```

Update the `API_BASE_URL` in `.env` to point to your backend (LAN IP in dev).

Run Expo:
```bash
npx expo start -c
```

Scan the QR code with Expo Go app on your phone.

---

## ⚡ API Endpoints

**Base URL:** `/api/`

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/token/` - User login (JWT token)
- `GET /api/auth/me/` - Get current user profile

**Registration Request:**
```json
{
  "email": "user@example.com",
  "username": "optional_username",
  "first_name": "John",
  "last_name": "Doe",
  "password": "SecurePass123!",
  "role": "customer"
}
```

**Registration Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "optional_username",
    "is_admin": false,
    "is_staff": false,
    "is_superuser": false
  },
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Login Response:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Get Current User Profile:**
```bash
GET /api/auth/me/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "optional_username",
  "is_admin": false,
  "is_staff": false,
  "is_superuser": false
}
```

#### User Roles:
- **Customer** (`role: "customer"`): Regular user with shopping permissions
- **Vendor** (`role: "vendor"`): Staff user with product management permissions (`is_staff: true`)

#### Required Fields:
- `email` (unique)
- `first_name` 
- `last_name`
- `password` (validated using Django password validation)
- `role` (optional, defaults to "customer")

#### Optional Fields:
- `username`
- `phone`
- `profile_image`


### Products

- `GET /api/products/` - List all products (paginated)
- `POST /api/products/` - Create product (Admin/Staff only)
- `GET /api/products/{id}/` - Get product details
- `PUT /api/products/{id}/` - Update product (Admin/Staff only)
- `PATCH /api/products/{id}/` - Partial update product (Admin/Staff only)
- `DELETE /api/products/{id}/` - Delete product (Admin/Staff only)
- `GET /api/products/categories/list/` - List all unique categories

#### Query Parameters:
- `search` - Search in title, description, and category
- `category` - Filter by category
- `page` - Pagination (default: 20 items per page)

**Example: Search and Filter**
```bash
GET /api/products/?search=laptop&category=Electronics
```

**Products List Response:**
```json
{
  "count": 15,
  "next": "http://localhost:8000/api/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Gaming Laptop",
      "description": "High-performance gaming laptop",
      "price": "999.99",
      "inventory_count": 10,
      "category": "Electronics",
      "image": null,
      "image_url": "http://localhost:8000/media/products/gaming_laptop.jpg",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "is_active": true
    }
  ]
}
```

**Create Product Request (Admin/Staff only):**
```json
{
  "title": "New Product",
  "description": "Product description",
  "price": "49.99",
  "inventory_count": 25,
  "category": "Electronics",
  "image": "uploaded_file",  // Optional - multipart/form-data
  "image_url": "https://example.com/image.jpg",  // Optional - fallback URL
  "is_active": true
}
```

**Categories List Response:**
```json
{
  "categories": ["Electronics", "Clothing", "Books", "Home & Garden"]
}
```

#### Image Handling:
- **Priority 1**: Uploaded `image` file (local storage in dev, S3 in production)
- **Priority 2**: Manual `image_url` field (external image URL)
- Images are served with full absolute URLs when available

#### Product Fields:
- **Required**: `title`, `price`
- **Optional**: `description`, `category`, `inventory_count` (default: 0), `image`, `image_url`, `is_active` (default: true)
- **Auto-generated**: `id`, `created_at`, `updated_at`

#### Permissions:
- **Read**: Anyone can view products
- **Write**: Only users with `is_staff=True` or `is_admin=True` can create/update/delete products


### Cart

- `GET /api/cart/` - Get current user/session cart
- `POST /api/cart/add/` - Add item to cart
- `PATCH /api/cart/items/{id}/` - Update cart item quantity
- `DELETE /api/cart/items/{id}/` - Remove item from cart
- `POST /api/cart/merge/` - Merge anonymous cart with user cart (after login)

#### Cart Features:
- **Automatic cart creation**: Cart is automatically created for authenticated users or anonymous sessions
- **Session support**: Anonymous users can use carts via `X-Session-Key` header
- **Stock validation**: Prevents adding more items than available inventory
- **Automatic totals**: Calculates subtotal, total items, and cart total

**Get Cart Response:**
```json
{
  "id": 1,
  "user": 1,
  "session_key": null,
  "items": [
    {
      "id": 1,
      "product": 1,
      "product_detail": {
        "id": 1,
        "title": "Gaming Laptop",
        "description": "High-performance laptop",
        "price": "999.99",
        "inventory_count": 10,
        "category": "Electronics",
        "image_url": "https://example.com/laptop.jpg",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      },
      "quantity": 2,
      "subtotal": "1999.98",
      "created_at": "2024-01-15T11:00:00Z"
    }
  ],
  "total_items": 2,
  "subtotal": "1999.98",
  "total": "1999.98",
  "created_at": "2024-01-15T10:45:00Z"
}
```

**Add to Cart Request:**
```json
{
  "product": 1,
  "quantity": 2
}
```

**Add to Cart Response:**
```json
{
  "id": 1,
  "product": 1,
  "product_detail": {
    "id": 1,
    "title": "Gaming Laptop",
    "price": "999.99",
    "inventory_count": 10,
    "category": "Electronics"
  },
  "quantity": 2,
  "subtotal": "1999.98",
  "created_at": "2024-01-15T11:00:00Z"
}
```

**Update Cart Item Request:**
```bash
PATCH /api/cart/items/1/
```
```json
{
  "quantity": 3
}
```

**Merge Carts Request (after login):**
```bash
POST /api/cart/merge/
```
```json
{
  "session_key": "anonymous_session_key_123"
}
```

#### Anonymous Cart Usage:
```bash
# For anonymous users, include session key in headers
GET /api/cart/
Headers: { "X-Session-Key": "your_session_key" }
```

#### Error Responses:
- `400 Bad Request`: Quantity exceeds available stock
- `400 Bad Request`: Quantity must be greater than zero
- `404 Not Found`: Product or cart item not found

---

### Orders

- `GET /api/orders/` - List user's orders (authenticated only)
- `POST /api/orders/` - Create new order from cart (checkout)
- `GET /api/orders/{id}/` - Get order details

**Create Order Request:**
```json
{
  "shipping_address": "123 Main St, City, Country, 12345"
}
```

**Create Order Response:**
```json
{
  "id": 1,
  "user": 1,
  "created_at": "2024-01-15T12:00:00Z",
  "total_price": "1999.98",
  "status": "pending",
  "shipping_address": "123 Main St, City, Country, 12345",
  "items": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "title": "Gaming Laptop",
        "description": "High-performance laptop",
        "price": "999.99",
        "inventory_count": 8,
        "category": "Electronics",
        "image_url": "https://example.com/laptop.jpg",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T12:00:00Z"
      },
      "quantity": 2,
      "price": "999.99"
    }
  ]
}
```

**List Orders Response:**
```json
[
  {
    "id": 1,
    "user": 1,
    "created_at": "2024-01-15T12:00:00Z",
    "total_price": "1999.98",
    "status": "pending",
    "items": [
      {
        "id": 1,
        "product": {
          "id": 1,
          "title": "Gaming Laptop",
          "price": "999.99",
          "category": "Electronics"
        },
        "quantity": 2,
        "price": "999.99"
      }
    ]
  }
]
```

#### Order Flow:
1. **Cart Validation**: Checks cart exists and has items
2. **Stock Check**: Verifies sufficient inventory for all items
3. **Inventory Update**: Reduces product inventory counts
4. **Order Creation**: Creates order with items from cart
5. **Cart Clear**: Empties the user's cart
6. **Order Confirmation**: Returns order details with status "pending"

#### Order Statuses:
- `pending` - Order created, awaiting payment
- `paid` - Payment received
- `shipped` - Order shipped to customer
- `delivered` - Order delivered successfully
- `cancelled` - Order cancelled

#### Required Fields:
- `shipping_address` - Customer delivery address

#### Auto-generated Fields:
- `total_price` - Calculated from cart items
- `status` - Always starts as "pending"
- `created_at` - Order creation timestamp

#### Permissions:
- **Authentication required** for all order operations
- Users can only access their own orders

---

## 🛠️ Technology Stack

- **Backend:** Django, Django REST Framework, PostgreSQL/SQLite
- **Frontend:** React Native, Expo, TypeScript
- **Authentication:** JWT (Simple JWT)
- **Image Storage:** URL-based (configure cloud storage in production)
- **State Management:** React Context API
- **Notifications:** Toast notifications

---

## 📂 Environment Setup

### Server (.env)
```ini
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=127.0.0.1,localhost,192.168.1.42
```

### Client (.env)
```ini
EXPPO_BASE_URL=http://192.168.1.42:8000/api
```

---

## 🌱 Seed Data

To quickly seed products for testing:

```bash
python manage.py seed
```

---

## 🧪 Testing

### Running Tests

The project includes comprehensive test coverage for all Django apps. Tests are organized by app in `tests/` directories.

#### Run All Tests
```bash
python manage.py test 

# Test specific app
python manage.py test users.tests
python manage.py test products.tests
python manage.py test cart.tests
python manage.py test orders.tests

# Run with verbose output
python manage.py test users.tests --verbosity=2
```
---
## ⚠️ Known Limitations

- Currently using URL-based images; production should use proper image upload with S3/Cloudinary
- No payment gateway integrated yet (planned: Paystack/Flutterwave)
- Cart merge logic only works if session cart exists before login
- Basic inventory management without advanced stock tracking or analytics

---


```