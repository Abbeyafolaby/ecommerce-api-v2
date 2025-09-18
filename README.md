# E-commerce API v2

Advanced e-commerce backend API featuring comprehensive product catalog, user management, and order processing system.

## Description

A robust and scalable e-commerce backend API that provides complete functionality for online stores. This API handles everything from product management and user authentication to order processing.

## Features

- **Product Management**: Complete CRUD operations for products with categories, variants, and inventory
- **User Authentication**: Secure registration, login, and profile management
- **Shopping Cart**: Persistent cart functionality with session management
- **Order Processing**: Complete order lifecycle from creation to fulfillment
- **Admin Panel**: Administrative endpoints for store management
- **Validation & Security**: Joi validation, input sanitization, rate limiting, secure HTTP headers

## Installation & Usage

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- MongoDB

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ecommerce-api-v2.git

# Navigate to project directory
cd ecommerce-api-v2

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Set up database
npm run setup-db

# Start the development server
npm start
```

### Usage

The API will be available at `http://localhost:3000/api/v2`

### Security & Validation

- Helmet is enabled globally for secure HTTP headers.
- Request bodies are sanitized to remove dangerous keys and trim strings.
- Auth endpoints are rate limited (20 requests / 15 minutes per IP).
- Joi validation is applied to key inputs:
  - Products: create and update bodies are validated.
  - Cart: add-to-cart body is validated.

## Testing with Postman

Set up a Postman Environment and a Collection to exercise the auth routes.

- Environment variables
  - `baseUrl` = `http://localhost:3000`
  - `apiVersion` = `v2`
  - `token` = (leave empty; will be set after login)

- Requests (create in a Collection)
  - Health
    - Method: GET
    - URL: `{{baseUrl}}/health`
  - Signup
    - Method: POST
    - URL: `{{baseUrl}}/api/{{apiVersion}}/auth/signup`
    - Headers: `Content-Type: application/json`
    - Body (raw JSON):

      ```json
      {
        "name": "John Doe",
        "email": "john@example.com",
        "password": "Passw0rd!"
      }
      ```

      - Optional admin: add `"role": "admin"`.

  - Login
    - Method: POST
    - URL: `{{baseUrl}}/api/{{apiVersion}}/auth/login`
    - Headers: `Content-Type: application/json`
    - Body (raw JSON):
      ```json
      {
        "email": "john@example.com",
        "password": "Passw0rd!"
      }
      ```
    - Tests (save JWT to env):
      ```js
      const data = pm.response.json();
      if (data && data.token) {
        pm.environment.set('token', data.token);
      }
      ```
  - Me (protected)
    - Method: GET
    - URL: `{{baseUrl}}/api/{{apiVersion}}/auth/me`
    - Headers: `Authorization: Bearer {{token}}`

- Expected responses
  - Signup: 201 `{ user, token }`
  - Login: 200 `{ user, token }`
  - Me: 200 `{ user }`

### Products Collection

Add these requests to the same Collection to test the Products CRUD. Admin-only requests require `Authorization: Bearer {{token}}` — obtain `{{token}}` by logging in as an admin user.

- List products
  - Method: GET
  - URL: `{{baseUrl}}/api/{{apiVersion}}/products`

- Get product by id
  - Method: GET
  - URL: `{{baseUrl}}/api/{{apiVersion}}/products/:id`
  - Replace `:id` with a valid product id.

- Create product (admin only)
  - Method: POST
  - URL: `{{baseUrl}}/api/{{apiVersion}}/products`
  - Headers: `Content-Type: application/json`, `Authorization: Bearer {{token}}`
  - Body (raw JSON) (validated by Joi):
    ```json
    {
      "name": "Sample Product",
      "price": 49.99,
      "description": "A great product",
      "category": "gadgets",
      "stock": 25,
      "images": ["https://example.com/image.jpg"],
      "isActive": true
    }
    ```
  - Expected: 201 `{ product }`

- Update product (admin only)
  - Method: PATCH
  - URL: `{{baseUrl}}/api/{{apiVersion}}/products/:id`
  - Headers: `Content-Type: application/json`, `Authorization: Bearer {{token}}`
  - Body (raw JSON) (validated by Joi): include only fields to change, e.g. `{ "price": 59.99, "stock": 30 }`
  - Expected: 200 `{ product }`

- Delete product (admin only)
  - Method: DELETE
  - URL: `{{baseUrl}}/api/{{apiVersion}}/products/:id`
  - Headers: `Authorization: Bearer {{token}}`
  - Expected: 204 No Content

### Cart Collection

These routes require authentication. Ensure `{{token}}` is set by logging in.

- View cart
  - Method: GET
  - URL: `{{baseUrl}}/api/{{apiVersion}}/cart`
  - Headers: `Authorization: Bearer {{token}}`
  - Expected: 200 `{ cart }` (cart may be empty)

- Add to cart
  - Method: POST
  - URL: `{{baseUrl}}/api/{{apiVersion}}/cart/add`
  - Headers: `Content-Type: application/json`, `Authorization: Bearer {{token}}`
  - Body (raw JSON) (validated by Joi):
    ```json
    {
      "productId": "<product_id>",
      "quantity": 2
    }
    ```
  - Notes: Quantity defaults to 1; cannot exceed product stock.
  - Expected: 200 `{ cart }` with populated `items.product`

- Remove from cart
  - Method: DELETE
  - URL: `{{baseUrl}}/api/{{apiVersion}}/cart/remove/:id`
  - Headers: `Authorization: Bearer {{token}}`
  - Replace `:id` with the product id to remove from the cart.
  - Expected: 204 No Content

### Orders Collection

All routes require authentication.

- Create order (from cart)
  - Method: POST
  - URL: `{{baseUrl}}/api/{{apiVersion}}/orders/checkout`
  - Headers: `Authorization: Bearer {{token}}`
  - Body: none
  - Expected: 201 `{ message, order }` with `order.status = "pending"`

- Confirm payment (simulate ~80% success)
  - Method: POST
  - URL: `{{baseUrl}}/api/{{apiVersion}}/orders/checkout`
  - Headers: `Content-Type: application/json`, `Authorization: Bearer {{token}}`
  - Body (raw JSON):
    ```json
    { "orderId": "<order_id>" }
    ```
  - Behavior:
    - On success: decrements stock, clears cart, sets `order.status = "paid"`
    - On failure: leaves stock/cart unchanged, sets `order.status = "failed"`
  - Expected: 200 on success `{ message, order }`; 402 on failure

- List my orders
  - Method: GET
  - URL: `{{baseUrl}}/api/{{apiVersion}}/orders`
  - Headers: `Authorization: Bearer {{token}}`
  - Expected: 200 `{ orders }`

- Get order by id
  - Method: GET
  - URL: `{{baseUrl}}/api/{{apiVersion}}/orders/:id`
  - Headers: `Authorization: Bearer {{token}}`
  - Expected: 200 `{ order }`

### Admin Orders

Admin-only routes. Include `Authorization: Bearer {{token}}` for an admin user.

- List all orders
  - Method: GET
  - URL: `{{baseUrl}}/api/{{apiVersion}}/admin/orders`
  - Expected: 200 `{ orders }`

- Update order fulfillment status
  - Method: PATCH
  - URL: `{{baseUrl}}/api/{{apiVersion}}/admin/orders/:id/status`
  - Headers: `Content-Type: application/json`, `Authorization: Bearer {{token}}`
  - Body (raw JSON):
    ```json
    { "status": "shipped" }
    ```
    Allowed values: `pending`, `shipped`, `delivered`
  - Expected: 200 `{ message, order }`

### Common issues

- Ensure your `.env` has a valid Mongo connection string:
  - `MONGODB_URI=mongodb://127.0.0.1:27017/ecommerce_api_v2`
  - Or use `MONGO_URI` if preferred.
- Set a strong JWT secret: `JWT_SECRET=your_long_random_string`

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB & Mongoose** - Database and ODM
- **JSON Web Tokens (jsonwebtoken)** - Authentication tokens
- **Joi** - Request schema validation
- **Helmet** - Secure HTTP headers
- **CORS** - Cross-origin resource sharing
- **express-rate-limit** - Brute-force/rate limiting
- **Morgan** - HTTP request logging
- **bcryptjs** - Password hashing

Tooling

- **Nodemon** - Development auto-reload
- **ESLint** - Linting
- **Prettier** - Code formatting

## Author

**Abiodun Afolabi** - Backend Developer
