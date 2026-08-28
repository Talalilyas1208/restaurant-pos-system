-- ==========================================================
-- HOTEL & RESTAURANT POS + QR CODE MENU SYSTEM SCHEMA
-- Compatible with PostgreSQL 14+ / Supabase
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. HOTELS / RESTAURANT BRANCHES
CREATE TABLE IF NOT EXISTS hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    tagline VARCHAR(255),
    logo_url TEXT,
    currency VARCHAR(10) DEFAULT 'USD',
    currency_symbol VARCHAR(5) DEFAULT '$',
    tax_rate NUMERIC(5, 2) DEFAULT 8.25, -- in percentage
    service_charge_rate NUMERIC(5, 2) DEFAULT 5.00, -- in percentage
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. DINING TABLES / ROOMS
CREATE TABLE IF NOT EXISTS dining_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    table_number VARCHAR(50) NOT NULL,
    section VARCHAR(100) DEFAULT 'Main Dining', -- e.g. 'Main Hall', 'Patio', 'Rooftop', 'Room 101'
    capacity INT DEFAULT 4,
    qr_code_token VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'available', -- 'available', 'occupied', 'billed', 'reserved'
    active_order_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MENU CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'Utensils',
    image_url TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. MENU ITEMS
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    cost_price NUMERIC(10, 2) DEFAULT 0.00,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    is_veg BOOLEAN DEFAULT FALSE,
    is_vegan BOOLEAN DEFAULT FALSE,
    is_gluten_free BOOLEAN DEFAULT FALSE,
    is_spicy BOOLEAN DEFAULT FALSE,
    is_chef_special BOOLEAN DEFAULT FALSE,
    preparation_time INT DEFAULT 15, -- minutes
    calories INT,
    allergens TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ITEM MODIFIERS (Sizes, add-ons, cooking preference)
CREATE TABLE IF NOT EXISTS item_modifiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. 'Size', 'Spice Level', 'Extra Topping'
    is_required BOOLEAN DEFAULT FALSE,
    min_selection INT DEFAULT 0,
    max_selection INT DEFAULT 1,
    options JSONB NOT NULL DEFAULT '[]', -- array of { "name": "Large", "price": 4.50 }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    table_id UUID REFERENCES dining_tables(id) ON DELETE SET NULL,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    order_type VARCHAR(30) DEFAULT 'dine_in', -- 'dine_in', 'room_service', 'takeaway', 'delivery'
    source VARCHAR(20) DEFAULT 'pos', -- 'pos', 'qr_customer', 'kiosk'
    status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'
    customer_name VARCHAR(100) DEFAULT 'Guest',
    customer_phone VARCHAR(50),
    customer_notes TEXT,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    service_charge NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(20) DEFAULT 'unpaid', -- 'unpaid', 'partially_paid', 'paid', 'refunded'
    server_staff_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_price NUMERIC(10, 2) NOT NULL,
    selected_modifiers JSONB DEFAULT '[]',
    special_instructions TEXT,
    status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'preparing', 'ready', 'served'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. PAYMENTS & TRANSACTIONS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    payment_method VARCHAR(30) NOT NULL, -- 'cash', 'credit_card', 'debit_card', 'room_charge', 'qr_upi', 'apple_pay'
    amount NUMERIC(10, 2) NOT NULL,
    tendered_amount NUMERIC(10, 2),
    change_due NUMERIC(10, 2) DEFAULT 0.00,
    transaction_ref VARCHAR(100),
    status VARCHAR(20) DEFAULT 'completed', -- 'completed', 'pending', 'failed', 'refunded'
    room_number VARCHAR(50),
    guest_name VARCHAR(100),
    processed_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. STAFF USERS & CASHIERS
CREATE TABLE IF NOT EXISTS staff_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role VARCHAR(30) NOT NULL DEFAULT 'waiter', -- 'admin', 'manager', 'cashier', 'waiter', 'kitchen'
    pin_code VARCHAR(10) NOT NULL, -- 4 to 6 digit quick login PIN
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_orders_hotel_id ON orders(hotel_id);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_hotel_category ON menu_items(hotel_id, category_id);
CREATE INDEX IF NOT EXISTS idx_dining_tables_token ON dining_tables(qr_code_token);
