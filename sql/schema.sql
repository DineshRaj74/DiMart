-- ─────────────────────────────────────────────────────────────────────────────
-- DiMart Database Schema
-- Run this once before starting the Spring Boot application.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS dimart_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dimart_db;

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           BIGINT PRIMARY KEY AUTO_INCREMENT,
  full_name    VARCHAR(120)  NOT NULL,
  email        VARCHAR(160)  NOT NULL UNIQUE,
  phone        VARCHAR(24),
  password_hash VARCHAR(255) NOT NULL,
  role         ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  status       ENUM('ACTIVE', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
  id               BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id          BIGINT NOT NULL,
  permission_level ENUM('MANAGER', 'OWNER') NOT NULL DEFAULT 'MANAGER',
  last_login_at    TIMESTAMP NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_admin_users_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Products ──────────────────────────────────────────────────────────────────
-- NOTE: uses a flat `category` VARCHAR (e.g. "Fashion") instead of a FK to
-- a categories table. This matches the Product JPA entity and the JSON seed
-- data, and keeps the frontend filter logic simple.
CREATE TABLE IF NOT EXISTS products (
  id               BIGINT PRIMARY KEY AUTO_INCREMENT,
  name             VARCHAR(160)  NOT NULL,
  category         VARCHAR(90)   NOT NULL,       -- e.g. "Fashion", "Shoes"
  price            DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount_percent INT           NOT NULL DEFAULT 0,
  rating           DECIMAL(3,1)  NOT NULL DEFAULT 0.0,
  badge            VARCHAR(40),
  image            VARCHAR(500),                 -- relative path, e.g. assets/images/...
  description      TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Cart ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  id             BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id        BIGINT       NOT NULL,
  product_id     BIGINT       NOT NULL,
  quantity       INT          NOT NULL DEFAULT 1,
  selected_size  VARCHAR(20),
  selected_color VARCHAR(40),
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT uk_cart_user_product_options UNIQUE (user_id, product_id, selected_size, selected_color)
);

-- ── Orders ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id          BIGINT       NOT NULL,
  order_number     VARCHAR(40)  NOT NULL UNIQUE,
  status           ENUM('PLACED','CONFIRMED','PACKED','SHIPPED','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PLACED',
  subtotal         DECIMAL(10,2) NOT NULL,
  shipping_fee     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax_amount       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_amount     DECIMAL(10,2) NOT NULL,
  payment_status   ENUM('PENDING','PAID','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  shipping_name    VARCHAR(120) NOT NULL,
  shipping_phone   VARCHAR(24)  NOT NULL,
  shipping_address VARCHAR(255) NOT NULL,
  shipping_city    VARCHAR(90)  NOT NULL,
  shipping_state   VARCHAR(90)  NOT NULL,
  shipping_pincode VARCHAR(20)  NOT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id             BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id       BIGINT        NOT NULL,
  product_id     BIGINT        NOT NULL,
  product_name   VARCHAR(160)  NOT NULL,
  unit_price     DECIMAL(10,2) NOT NULL,
  quantity       INT           NOT NULL,
  selected_size  VARCHAR(20),
  selected_color VARCHAR(40),
  line_total     DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_order_items_order   FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ── Contact Messages ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  full_name  VARCHAR(120) NOT NULL,
  email      VARCHAR(160) NOT NULL,
  subject    VARCHAR(160) NOT NULL,
  message    TEXT         NOT NULL,
  status     ENUM('NEW','READ','REPLIED','ARCHIVED') NOT NULL DEFAULT 'NEW',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Wishlist ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id    BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wishlist_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT uk_wishlist_user_product UNIQUE (user_id, product_id)
);

-- ── Seed Data ─────────────────────────────────────────────────────────────────
-- Products are seeded automatically by DataSeeder.java from products.json.
-- Only seed users/admin manually here.

INSERT INTO users (full_name, email, phone, password_hash, role)
VALUES
  ('Dimart Admin', 'admin@dimart.com', '9000000000', '$2a$10$replacethiswitharealbcrypthash', 'ADMIN'),
  ('Aarav Mehta',  'aarav@example.com', '9888888888', '$2a$10$replacethiswitharealbcrypthash', 'CUSTOMER')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

INSERT INTO admin_users (user_id, permission_level)
SELECT id, 'OWNER' FROM users WHERE email = 'admin@dimart.com'
ON DUPLICATE KEY UPDATE permission_level = VALUES(permission_level);
