-- Schema Setup
CREATE TABLE users(id SERIAL PRIMARY KEY, email TEXT, created_at TIMESTAMP);
CREATE TABLE orders(id SERIAL PRIMARY KEY, user_id INT, amount FLOAT, status TEXT, created_at TIMESTAMP);
CREATE TABLE payments(id SERIAL PRIMARY KEY, order_id INT, status TEXT, timestamp TIMESTAMP);
CREATE TABLE logs(id SERIAL PRIMARY KEY, service TEXT, error TEXT, timestamp TIMESTAMP);

-- Insert Users
INSERT INTO users (email, created_at) VALUES
('ceo@startup.io', NOW() - INTERVAL '30 days'),
('cto@startup.io', NOW() - INTERVAL '29 days'),
('vp_eng@enterprise.com', NOW() - INTERVAL '15 days'),
('data_lead@fintech.co.uk', NOW() - INTERVAL '10 days'),
('ops_manager@bank.com', NOW() - INTERVAL '2 days');

-- Insert Orders (Simulating Daily Revenue)
INSERT INTO orders (user_id, amount, status, created_at) VALUES
(1, 15000.00, 'completed', NOW() - INTERVAL '5 days'),
(2, 4500.50, 'completed', NOW() - INTERVAL '4 days'),
(3, 8900.00, 'completed', NOW() - INTERVAL '4 days'),
(4, 32000.00, 'completed', NOW() - INTERVAL '2 days'),
(4, 150.00, 'pending', NOW() - INTERVAL '1 days'),
(5, 7500.00, 'completed', NOW());

-- Insert Payments (With targeted 'failed' hooks for the Wow Query)
INSERT INTO payments (order_id, status, timestamp) VALUES
(1, 'completed', NOW() - INTERVAL '5 days'),
(2, 'completed', NOW() - INTERVAL '4 days'),
(3, 'completed', NOW() - INTERVAL '4 days'),
(4, 'completed', NOW() - INTERVAL '2 days'),
(5, 'failed', NOW() - INTERVAL '12 hours'), -- Wow Moment: Failed Stripe webhook simulated
(6, 'completed', NOW());

-- Insert Logs (Simulating fragmented service errors)
INSERT INTO logs (service, error, timestamp) VALUES
('auth_service', NULL, NOW() - INTERVAL '5 hours'),
('payment_gateway', 'API_TIMEOUT: target host unreachable', NOW() - INTERVAL '2 hours'),
('payment_gateway', 'API_TIMEOUT: target host unreachable', NOW() - INTERVAL '1 hours'),
('user_service', NULL, NOW() - INTERVAL '30 minutes'),
('inventory_sync', 'DEADLOCK_DETECTED: tx_id 89192', NOW() - INTERVAL '10 minutes');
