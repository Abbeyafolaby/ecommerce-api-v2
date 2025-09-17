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

      ```
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
      ```
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

### Common issues

- Ensure your `.env` has a valid Mongo connection string:
  - `MONGODB_URI=mongodb://127.0.0.1:27017/ecommerce_api_v2`
  - Or use `MONGO_URI` if preferred.
- Set a strong JWT secret: `JWT_SECRET=your_long_random_string`

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework

## Author

**Abiodun Afolabi** - Backend Developer
