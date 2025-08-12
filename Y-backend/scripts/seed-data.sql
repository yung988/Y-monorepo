-- Seed data pro testování

-- Kategorie
INSERT INTO categories (name, slug, description, is_active) VALUES
('Elektronika', 'elektronika', 'Elektronické zařízení a příslušenství', true),
('Oblečení', 'obleceni', 'Módní oblečení pro muže a ženy', true),
('Domácnost', 'domacnost', 'Potřeby pro domácnost a kuchyň', true),
('Knihy', 'knihy', 'Knihy všech žánrů', true),
('Sport', 'sport', 'Sportovní potřeby a oblečení', true);

-- Produkty
INSERT INTO products (name, slug, description, sku, price, compare_price, category_id, brand, stock, status, is_featured) VALUES
('iPhone 15 Pro', 'iphone-15-pro', 'Nejnovější iPhone s pokročilými funkcemi', 'IPH15PRO', 32990.00, 35990.00, (SELECT id FROM categories WHERE slug = 'elektronika'), 'Apple', 25, 'active', true),
('Samsung Galaxy S24', 'samsung-galaxy-s24', 'Prémiový Android smartphone', 'SGS24', 28990.00, 31990.00, (SELECT id FROM categories WHERE slug = 'elektronika'), 'Samsung', 18, 'active', true),
('Pánská košile', 'panska-kosile', 'Elegantní pánská košile z bavlny', 'KOSILE001', 1290.00, 1590.00, (SELECT id FROM categories WHERE slug = 'obleceni'), 'Fashion Brand', 45, 'active', false),
('Kávovar DeLonghi', 'kavovar-delonghi', 'Automatický kávovar s mlýnkem', 'KAVO001', 15990.00, 18990.00, (SELECT id FROM categories WHERE slug = 'domacnost'), 'DeLonghi', 8, 'active', true),
('Běžecké boty Nike', 'bezecke-boty-nike', 'Profesionální běžecké boty', 'NIKE001', 3490.00, 3990.00, (SELECT id FROM categories WHERE slug = 'sport'), 'Nike', 32, 'active', false);

-- Zákazníci
INSERT INTO customers (name, email, phone, address, city, postal_code, total_orders, total_revenue, customer_group) VALUES
('Jan Novák', 'jan.novak@email.cz', '+420 123 456 789', 'Václavské náměstí 1', 'Praha', '11000', 5, 45230.50, 'vip'),
('Eva Svobodová', 'eva.svobodova@email.cz', '+420 987 654 321', 'Masarykova 25', 'Brno', '60200', 3, 12450.00, 'regular'),
('Petr Dvořák', 'petr.dvorak@email.cz', '+420 555 123 456', 'Náměstí Míru 10', 'Ostrava', '70200', 8, 67890.25, 'vip'),
('Marie Nováková', 'marie.novakova@email.cz', '+420 777 888 999', 'Hlavní třída 5', 'České Budějovice', '37001', 2, 8750.00, 'regular'),
('Tomáš Procházka', 'tomas.prochazka@email.cz', '+420 666 555 444', 'Palackého 15', 'Plzeň', '30100', 12, 89340.75, 'vip');

-- Objednávky
INSERT INTO orders (order_number, customer_id, customer_name, customer_email, billing_address, status, payment_status, subtotal, tax_amount, total_amount, payment_method, shipping_method) VALUES
('ORD-2024-001', (SELECT id FROM customers WHERE email = 'jan.novak@email.cz'), 'Jan Novák', 'jan.novak@email.cz', '{"street": "Václavské náměstí 1", "city": "Praha", "postal_code": "11000"}', 'delivered', 'paid', 32990.00, 6928.00, 39918.00, 'card', 'standard'),
('ORD-2024-002', (SELECT id FROM customers WHERE email = 'eva.svobodova@email.cz'), 'Eva Svobodová', 'eva.svobodova@email.cz', '{"street": "Masarykova 25", "city": "Brno", "postal_code": "60200"}', 'shipped', 'paid', 1290.00, 271.00, 1561.00, 'bank_transfer', 'express'),
('ORD-2024-003', (SELECT id FROM customers WHERE email = 'petr.dvorak@email.cz'), 'Petr Dvořák', 'petr.dvorak@email.cz', '{"street": "Náměstí Míru 10", "city": "Ostrava", "postal_code": "70200"}', 'processing', 'paid', 15990.00, 3358.00, 19348.00, 'card', 'standard'),
('ORD-2024-004', (SELECT id FROM customers WHERE email = 'marie.novakova@email.cz'), 'Marie Nováková', 'marie.novakova@email.cz', '{"street": "Hlavní třída 5", "city": "České Budějovice", "postal_code": "37001"}', 'pending', 'pending', 3490.00, 733.00, 4223.00, 'cash_on_delivery', 'standard'),
('ORD-2024-005', (SELECT id FROM customers WHERE email = 'tomas.prochazka@email.cz'), 'Tomáš Procházka', 'tomas.prochazka@email.cz', '{"street": "Palackého 15", "city": "Plzeň", "postal_code": "30100"}', 'cancelled', 'refunded', 28990.00, 6088.00, 35078.00, 'card', 'express');

-- Položky objednávek
INSERT INTO order_items (order_id, product_id, product_name, sku, quantity, unit_price, total_price, tax_amount) VALUES
((SELECT id FROM orders WHERE order_number = 'ORD-2024-001'), (SELECT id FROM products WHERE sku = 'IPH15PRO'), 'iPhone 15 Pro', 'IPH15PRO', 1, 32990.00, 32990.00, 6928.00),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-002'), (SELECT id FROM products WHERE sku = 'KOSILE001'), 'Pánská košile', 'KOSILE001', 1, 1290.00, 1290.00, 271.00),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-003'), (SELECT id FROM products WHERE sku = 'KAVO001'), 'Kávovar DeLonghi', 'KAVO001', 1, 15990.00, 15990.00, 3358.00),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-004'), (SELECT id FROM products WHERE sku = 'NIKE001'), 'Běžecké boty Nike', 'NIKE001', 1, 3490.00, 3490.00, 733.00),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-005'), (SELECT id FROM products WHERE sku = 'SGS24'), 'Samsung Galaxy S24', 'SGS24', 1, 28990.00, 28990.00, 6088.00);

-- Zásilky
INSERT INTO shipments (order_id, tracking_number, carrier, status, shipping_address) VALUES
((SELECT id FROM orders WHERE order_number = 'ORD-2024-001'), 'TRK123456789', 'Zásilkovna', 'delivered', '{"street": "Václavské náměstí 1", "city": "Praha", "postal_code": "11000"}'),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-002'), 'TRK987654321', 'DPD', 'in_transit', '{"street": "Masarykova 25", "city": "Brno", "postal_code": "60200"}'),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-003'), 'TRK555666777', 'PPL', 'preparing', '{"street": "Náměstí Míru 10", "city": "Ostrava", "postal_code": "70200"}');

-- Platby
INSERT INTO payments (order_id, payment_method, provider, transaction_id, amount, status) VALUES
((SELECT id FROM orders WHERE order_number = 'ORD-2024-001'), 'card', 'stripe', 'pi_1234567890', 39918.00, 'completed'),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-002'), 'bank_transfer', 'bank', 'BT_987654321', 1561.00, 'completed'),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-003'), 'card', 'stripe', 'pi_0987654321', 19348.00, 'completed'),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-004'), 'cash_on_delivery', 'cod', null, 4223.00, 'pending'),
((SELECT id FROM orders WHERE order_number = 'ORD-2024-005'), 'card', 'stripe', 'pi_5555666677', 35078.00, 'refunded');

-- Slevy
INSERT INTO discounts (code, name, description, type, value, minimum_amount, usage_limit, is_active) VALUES
('WELCOME10', 'Vítejte 10%', 'Sleva 10% pro nové zákazníky', 'percentage', 10.00, 1000.00, 100, true),
('FREESHIP', 'Doprava zdarma', 'Doprava zdarma nad 2000 Kč', 'free_shipping', 0.00, 2000.00, null, true),
('SUMMER500', 'Letní sleva 500 Kč', 'Pevná sleva 500 Kč', 'fixed_amount', 500.00, 3000.00, 50, true);

-- Nastavení
INSERT INTO settings (key, value, description, category, is_public) VALUES
('shop_name', '"Můj E-shop"', 'Název obchodu', 'general', true),
('shop_email', '"info@mujeshop.cz"', 'Kontaktní email', 'general', true),
('currency', '"CZK"', 'Měna obchodu', 'general', true),
('tax_rate', '21.0', 'Základní sazba DPH', 'tax', false),
('free_shipping_threshold', '2000.0', 'Limit pro dopravu zdarma', 'shipping', true),
('order_number_prefix', '"ORD-"', 'Prefix pro čísla objednávek', 'orders', false);

-- Recenze
INSERT INTO product_reviews (product_id, customer_id, rating, title, content, is_verified, is_published) VALUES
((SELECT id FROM products WHERE sku = 'IPH15PRO'), (SELECT id FROM customers WHERE email = 'jan.novak@email.cz'), 5, 'Skvělý telefon!', 'iPhone 15 Pro je opravdu fantastický. Rychlý, kvalitní fotoaparát a dlouhá výdrž baterie.', true, true),
((SELECT id FROM products WHERE sku = 'KAVO001'), (SELECT id FROM customers WHERE email = 'petr.dvorak@email.cz'), 4, 'Dobrý kávovar', 'Kávovar dělá skvělou kávu, ale je trochu hlučný.', true, true),
((SELECT id FROM products WHERE sku = 'NIKE001'), (SELECT id FROM customers WHERE email = 'marie.novakova@email.cz'), 5, 'Perfektní boty', 'Velmi pohodlné běžecké boty, doporučuji!', true, true);
