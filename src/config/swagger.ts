import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-commerce Auth API",
      version: "1.0.0",
      description: "Authentication API with register, login, logout and profile endpoints",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        RegisterInput: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "John Doe" },
            email: { type: "string", format: "email", example: "john@example.com" },
            password: { type: "string", example: "Secret123" },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "john@example.com" },
            password: { type: "string", example: "Secret123" },
          },
        },
        UserResponse: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            email: { type: "string" },
            role: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        UpdateProfileInput: {
          type: "object",
          properties: {
            name: { type: "string", example: "John Updated" },
            email: { type: "string", format: "email", example: "john.updated@example.com" },
          },
        },
        ChangePasswordInput: {
          type: "object",
          required: ["currentPassword", "newPassword"],
          properties: {
            currentPassword: { type: "string", example: "Secret123" },
            newPassword: { type: "string", example: "NewSecret456" },
          },
        },
        ProductInput: {
          type: "object",
          required: ["name", "price", "category"],
          properties: {
            name: { type: "string", example: "Wireless Headphones" },
            description: { type: "string", example: "Noise cancelling headphones" },
            price: { type: "number", example: 99.99 },
            stock: { type: "integer", example: 50 },
            category: { type: "string", example: "Electronics" },
            imageUrl: { type: "string", example: "https://example.com/image.jpg" },
          },
        },
        ProductResponse: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            stock: { type: "integer" },
            category: { type: "string" },
            imageUrl: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        AddItemInput: {
          type: "object",
          required: ["productId"],
          properties: {
            productId: { type: "integer", example: 1 },
            quantity: { type: "integer", example: 2, default: 1 },
          },
        },
        UpdateQuantityInput: {
          type: "object",
          required: ["quantity"],
          properties: {
            quantity: { type: "integer", example: 3 },
          },
        },
        CartItemResponse: {
          type: "object",
          properties: {
            id: { type: "integer" },
            productId: { type: "integer" },
            product: { $ref: "#/components/schemas/ProductResponse" },
            quantity: { type: "integer" },
            subtotal: { type: "number" },
          },
        },
        CartResponse: {
          type: "object",
          properties: {
            id: { type: "integer" },
            userId: { type: "integer" },
            items: { type: "array", items: { $ref: "#/components/schemas/CartItemResponse" } },
            total: { type: "number" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CreateOrderInput: {
          type: "object",
          required: ["shippingAddress"],
          properties: {
            shippingAddress: { type: "string", example: "123 Main St, New York, NY 10001" },
          },
        },
        UpdateOrderStatusInput: {
          type: "object",
          required: ["status"],
          properties: {
            status: { type: "string", enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"], example: "confirmed" },
          },
        },
        OrderItemResponse: {
          type: "object",
          properties: {
            id: { type: "integer" },
            productId: { type: "integer" },
            product: { $ref: "#/components/schemas/ProductResponse" },
            quantity: { type: "integer" },
            unitPrice: { type: "number" },
            subtotal: { type: "number" },
          },
        },
        OrderResponse: {
          type: "object",
          properties: {
            id: { type: "integer" },
            userId: { type: "integer" },
            status: { type: "string", enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"] },
            totalAmount: { type: "number" },
            shippingAddress: { type: "string" },
            items: { type: "array", items: { $ref: "#/components/schemas/OrderItemResponse" } },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    paths: {
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterInput" } } },
          },
          responses: {
            201: {
              description: "User registered successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      message: { type: "string" },
                      user: { $ref: "#/components/schemas/UserResponse" },
                    },
                  },
                },
              },
            },
            400: { description: "Validation error" },
            409: { description: "Email already exists" },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login with email and password",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/LoginInput" } } },
          },
          responses: {
            200: {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      message: { type: "string" },
                      token: { type: "string" },
                      user: { $ref: "#/components/schemas/UserResponse" },
                    },
                  },
                },
              },
            },
            400: { description: "Validation error" },
            401: { description: "Invalid credentials" },
          },
        },
      },
      "/api/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout current user",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Logged out successfully" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/auth/profile": {
        get: {
          tags: ["Auth"],
          summary: "Get current user profile",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "User profile",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      user: { $ref: "#/components/schemas/UserResponse" },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
          },
        },
        put: {
          tags: ["Auth"],
          summary: "Update current user profile",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateProfileInput" } } },
          },
          responses: {
            200: {
              description: "Profile updated successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      message: { type: "string" },
                      user: { $ref: "#/components/schemas/UserResponse" },
                    },
                  },
                },
              },
            },
            400: { description: "Validation error" },
            401: { description: "Unauthorized" },
            409: { description: "Email already in use" },
          },
        },
      },
      "/api/auth/change-password": {
        put: {
          tags: ["Auth"],
          summary: "Change current user password",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/ChangePasswordInput" } } },
          },
          responses: {
            200: { description: "Password changed successfully" },
            400: { description: "Validation error" },
            401: { description: "Unauthorized or incorrect current password" },
          },
        },
      },
      "/api/products": {
        get: {
          tags: ["Products"],
          summary: "Get all products with optional search & filters",
          parameters: [
            { in: "query", name: "search", schema: { type: "string" }, description: "Search by name" },
            { in: "query", name: "category", schema: { type: "string" }, description: "Filter by category" },
            { in: "query", name: "minPrice", schema: { type: "number" }, description: "Minimum price" },
            { in: "query", name: "maxPrice", schema: { type: "number" }, description: "Maximum price" },
            { in: "query", name: "page", schema: { type: "integer", default: 1 } },
            { in: "query", name: "limit", schema: { type: "integer", default: 10 } },
          ],
          responses: {
            200: {
              description: "List of products",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      products: { type: "array", items: { $ref: "#/components/schemas/ProductResponse" } },
                      total: { type: "integer" },
                      page: { type: "integer" },
                      totalPages: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Products"],
          summary: "Create a new product (admin only)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/ProductInput" } } },
          },
          responses: {
            201: {
              description: "Product created",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      message: { type: "string" },
                      product: { $ref: "#/components/schemas/ProductResponse" },
                    },
                  },
                },
              },
            },
            400: { description: "Validation error" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden - admin only" },
          },
        },
      },
      "/api/products/{id}": {
        get: {
          tags: ["Products"],
          summary: "Get product by ID",
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
          responses: {
            200: {
              description: "Product details",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      product: { $ref: "#/components/schemas/ProductResponse" },
                    },
                  },
                },
              },
            },
            404: { description: "Product not found" },
          },
        },
        put: {
          tags: ["Products"],
          summary: "Update a product (admin only)",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/ProductInput" } } },
          },
          responses: {
            200: {
              description: "Product updated",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      message: { type: "string" },
                      product: { $ref: "#/components/schemas/ProductResponse" },
                    },
                  },
                },
              },
            },
            400: { description: "Validation error" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden - admin only" },
            404: { description: "Product not found" },
          },
        },
        delete: {
          tags: ["Products"],
          summary: "Delete a product (admin only)",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
          responses: {
            200: { description: "Product deleted successfully" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden - admin only" },
            404: { description: "Product not found" },
          },
        },
      },
      "/api/cart": {
        get: {
          tags: ["Cart"],
          summary: "Get current user's cart",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Cart retrieved",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      cart: { $ref: "#/components/schemas/CartResponse" },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
          },
        },
        delete: {
          tags: ["Cart"],
          summary: "Clear all items from cart",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Cart cleared successfully" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/cart/items": {
        post: {
          tags: ["Cart"],
          summary: "Add item to cart",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/AddItemInput" } } },
          },
          responses: {
            200: {
              description: "Item added to cart",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      message: { type: "string" },
                      cart: { $ref: "#/components/schemas/CartResponse" },
                    },
                  },
                },
              },
            },
            400: { description: "Validation error or insufficient stock" },
            401: { description: "Unauthorized" },
            404: { description: "Product not found" },
          },
        },
      },
      "/api/cart/items/{itemId}": {
        put: {
          tags: ["Cart"],
          summary: "Update cart item quantity",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "itemId", required: true, schema: { type: "integer" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateQuantityInput" } } },
          },
          responses: {
            200: {
              description: "Cart item updated",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      message: { type: "string" },
                      cart: { $ref: "#/components/schemas/CartResponse" },
                    },
                  },
                },
              },
            },
            400: { description: "Validation error or insufficient stock" },
            401: { description: "Unauthorized" },
            404: { description: "Cart item not found" },
          },
        },
        delete: {
          tags: ["Cart"],
          summary: "Remove item from cart",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "itemId", required: true, schema: { type: "integer" } }],
          responses: {
            200: {
              description: "Item removed from cart",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      message: { type: "string" },
                      cart: { $ref: "#/components/schemas/CartResponse" },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
            404: { description: "Cart item not found" },
          },
        },
      },
      "/api/orders": {
        post: {
          tags: ["Orders"],
          summary: "Place a new order from cart",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/CreateOrderInput" } } },
          },
          responses: {
            201: {
              description: "Order placed successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      message: { type: "string" },
                      order: { $ref: "#/components/schemas/OrderResponse" },
                    },
                  },
                },
              },
            },
            400: { description: "Cart is empty or insufficient stock" },
            401: { description: "Unauthorized" },
          },
        },
        get: {
          tags: ["Orders"],
          summary: "Get orders (own orders for customers, all orders for admin)",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "List of orders",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      orders: { type: "array", items: { $ref: "#/components/schemas/OrderResponse" } },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/orders/{id}": {
        get: {
          tags: ["Orders"],
          summary: "Get order by ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
          responses: {
            200: {
              description: "Order details",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      order: { $ref: "#/components/schemas/OrderResponse" },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
            404: { description: "Order not found" },
          },
        },
      },
      "/api/orders/{id}/status": {
        put: {
          tags: ["Orders"],
          summary: "Update order status (admin only)",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateOrderStatusInput" } } },
          },
          responses: {
            200: {
              description: "Order status updated",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      message: { type: "string" },
                      order: { $ref: "#/components/schemas/OrderResponse" },
                    },
                  },
                },
              },
            },
            400: { description: "Invalid status transition" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden - admin only" },
            404: { description: "Order not found" },
          },
        },
      },
      "/api/orders/{id}/cancel": {
        put: {
          tags: ["Orders"],
          summary: "Cancel an order",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
          responses: {
            200: {
              description: "Order cancelled successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      message: { type: "string" },
                      order: { $ref: "#/components/schemas/OrderResponse" },
                    },
                  },
                },
              },
            },
            400: { description: "Cannot cancel shipped or delivered order" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
            404: { description: "Order not found" },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
