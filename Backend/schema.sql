-- Query 1: Total users
SELECT COUNT(*) FROM users;

-- Query 2: New users in the last 30 days
SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '30 days';

-- Query 3: Active users in the last 7 days (those who made a purchase)
SELECT COUNT(DISTINCT user_id) FROM purchases WHERE purchased_at >= NOW() - INTERVAL '7 days';

-- Query 4: Total revenue
SELECT SUM(product_price) AS total_revenue FROM purchases;

-- Query 5: Top 5 most common name lengths
SELECT LENGTH(name) AS length, COUNT(*) AS count
FROM users
GROUP BY length
ORDER BY count DESC
LIMIT 5;

-- Query 6: Top 5 products by revenue
SELECT product_name, SUM(product_price) AS total_revenue
FROM purchases
GROUP BY product_name
ORDER BY total_revenue DESC
LIMIT 5;

-- Query 7: Top 5 users by total spent
SELECT u.name, SUM(p.product_price) AS total_spent
FROM users u
JOIN purchases p ON u.id = p.user_id
GROUP BY u.id
ORDER BY total_spent DESC
LIMIT 5;
