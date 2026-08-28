-- ==========================================================
-- SEED DATA FOR HOTEL & RESTAURANT POS
-- ==========================================================

-- 1. Insert Hotel
INSERT INTO hotels (id, name, slug, tagline, logo_url, currency, currency_symbol, tax_rate, service_charge_rate, address, phone, email)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Grand Horizon Hotel & Bistro',
    'grand-horizon',
    'Fine Dining & Luxury Hospitality',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80',
    'USD',
    '$',
    8.50,
    5.00,
    '742 Evergreen Terrace, Suite 100',
    '+1 (555) 234-5678',
    'dining@grandhorizon.com'
) ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Dining Tables / Rooms
INSERT INTO dining_tables (id, hotel_id, table_number, section, capacity, qr_code_token, status)
VALUES 
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'T-01', 'Main Dining', 2, 'gh-tbl-01', 'available'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'T-02', 'Main Dining', 4, 'gh-tbl-02', 'occupied'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'T-03', 'Main Dining', 4, 'gh-tbl-03', 'available'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'T-04', 'Patio Garden', 6, 'gh-tbl-04', 'billed'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'T-05', 'Patio Garden', 2, 'gh-tbl-05', 'available'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b06', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'R-101', 'Room Service', 2, 'gh-rm-101', 'available'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b07', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'R-204', 'Room Service', 4, 'gh-rm-204', 'available'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Bar-01', 'Lounge & Bar', 2, 'gh-bar-01', 'available')
ON CONFLICT (qr_code_token) DO NOTHING;

-- 3. Insert Menu Categories
INSERT INTO categories (id, hotel_id, name, description, icon, image_url, sort_order, is_active)
VALUES
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Appetizers & Starters', 'Crispy bites and gourmet starters', 'Soup', 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=300', 1, TRUE),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Chef Signature Mains', 'Prime meats, seafood & artisan pasta', 'UtensilsCrossed', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300', 2, TRUE),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Wood-Fired Pizza & Burgers', 'Artisan sourdough pizzas & gourmet burgers', 'Pizza', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300', 3, TRUE),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Desserts & Pastries', 'Handcrafted sweet delicacies', 'Cake', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300', 4, TRUE),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Beverages & Mocktails', 'Refreshing craft drinks, smoothies & coffees', 'GlassWater', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300', 5, TRUE)
ON CONFLICT DO NOTHING;

-- 4. Insert Menu Items
INSERT INTO menu_items (id, hotel_id, category_id, name, description, price, cost_price, image_url, is_available, is_veg, is_vegan, is_gluten_free, is_spicy, is_chef_special, preparation_time, calories)
VALUES
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'Truffle Burrata Bruschetta', 'Toasted sourdough, heirloom cherry tomatoes, creamy burrata, balsamic glaze & fresh basil', 14.50, 4.00, 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=400', TRUE, TRUE, FALSE, FALSE, FALSE, TRUE, 10, 420),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'Crispy Calamari Fritti', 'Tender squid rings, lemon garlic aioli, smoked paprika dust & charred lemon', 16.00, 5.20, 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=400', TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, 12, 480),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', 'Prime Angus Ribeye Steak (10oz)', 'Grass-fed beef, rosemary garlic butter, roasted asparagus & truffle potato mash', 36.00, 14.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', TRUE, FALSE, FALSE, TRUE, FALSE, TRUE, 22, 850),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', 'Pan-Seared Atlantic Salmon', 'Wild salmon fillet, lemon dill beurre blanc, quinoa pilaf & baby carrots', 28.50, 9.50, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', TRUE, FALSE, FALSE, TRUE, FALSE, FALSE, 18, 620),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', 'Wild Mushroom Tagliatelle', 'Fresh hand-cut pasta, porcini mushrooms, black truffle cream, aged parmesan', 22.00, 6.00, 'https://images.unsplash.com/photo-1621996346565-e3d5d6281061?w=400', TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, 15, 590),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d06', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03', 'Diavola Spicy Pepperoni Pizza', 'San Marzano tomato, fior di latte mozzarella, spicy soppressata, chili honey', 19.50, 4.80, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', TRUE, FALSE, FALSE, FALSE, TRUE, TRUE, 14, 780),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d07', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03', 'The Grand Horizon Wagyu Burger', 'Brioche bun, 8oz Wagyu patty, aged white cheddar, caramelized onion jam, truffle fries', 21.00, 7.20, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', TRUE, FALSE, FALSE, FALSE, FALSE, TRUE, 16, 920),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d08', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c04', 'Molten Belgian Chocolate Lava Cake', 'Warm molten center, vanilla bean gelato, raspberry coulis & gold leaf', 11.50, 3.10, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', TRUE, TRUE, FALSE, FALSE, FALSE, TRUE, 12, 540),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d09', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c04', 'Madagascar Vanilla Bean Panna Cotta', 'Silky infused cream, passionfruit gel, fresh berries & mint', 9.50, 2.50, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', TRUE, TRUE, FALSE, TRUE, FALSE, FALSE, 8, 320),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d10', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c05', 'Sparkling Yuzu Berry Spritz', 'Japanese yuzu, wild berry puree, sparkling mineral water, fresh rosemary sprig', 7.50, 1.20, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400', TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, 5, 110),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c05', 'Artisan Nitro Cold Brew Coffee', 'Single-origin Ethiopian beans, cascading crema, choice of oat milk or Madagascar vanilla syrup', 6.00, 1.00, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400', TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, 4, 45)
ON CONFLICT DO NOTHING;
