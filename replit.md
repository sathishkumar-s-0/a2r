# A2R Meat Shop - Workspace

## Overview

Full-stack meat shop e-commerce application with customer storefront, admin dashboard, and real-time Socket.IO integration.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (ESM bundle)
- **Real-time**: Socket.IO
- **Frontend**: React + Vite + Tailwind CSS

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (Socket.IO, auth, CRUD)
│   └── a2r-meat-shop/      # React frontend (customer + admin)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
└── pnpm-workspace.yaml
```

## Application Features

### Customer App
- Homepage with hero image and category grid (Chicken, Mutton, Fish, Eggs)
- Product listing with category filtering (only active, in-stock products)
- Product detail page with quantity selection (250g, 500g, 1kg, custom)
- Shopping cart with add/remove/quantity controls
- Checkout with name, phone, address — Cash on Delivery only
- Order tracking with real-time status updates via Socket.IO

### Admin Dashboard (at `/admin`)
- Login: `admin@a2rmeatshop.com` / `admin123`
- Dashboard stats: total orders, today's revenue, low stock alerts
- Product management: add/edit/delete products
- Order management: update status (Placed → Accepted → Preparing → Delivered)
- Real-time new order notifications via Socket.IO

## Database Schema

- `admins` — id, email, password_hash, created_at
- `products` — id, name, category, price, stock, image_url, is_active, created_at
- `orders` — id, customer_name, customer_phone, customer_address, total_price, status, created_at
- `order_items` — id, order_id, product_id, product_name, quantity, price

## API Endpoints

- `GET /api/products` — Public product listing
- `POST /api/orders` — Place new order
- `GET /api/orders/:id/status` — Get order status
- `POST /api/admin/login` — Admin authentication
- `GET /api/admin/products` — All products (admin)
- `POST /api/admin/products` — Create product
- `PUT /api/admin/products/:id` — Update product
- `DELETE /api/admin/products/:id` — Delete product
- `GET /api/admin/orders` — All orders with items
- `PUT /api/admin/orders/:id/status` — Update order status
- `GET /api/admin/dashboard` — Dashboard stats

## Real-time Socket.IO Events

- `product_updated` — When a product is created/edited
- `stock_updated` — When stock changes after an order
- `new_order` — When a customer places a new order (admin notification)
- `order_status_changed` — When admin updates order status (customer tracking)

## Development Commands

```bash
# Run API server
pnpm --filter @workspace/api-server run dev

# Run frontend
pnpm --filter @workspace/a2r-meat-shop run dev

# Push DB schema changes
pnpm --filter @workspace/db run push

# Run codegen (after OpenAPI changes)
pnpm --filter @workspace/api-spec run codegen
```
