-- Update admin password with proper bcrypt hash for 'admin123'
UPDATE users 
SET password = '$2b$10$zXv9MDX1kNkPUeKSS8PCpuVwrukw4sPRRxl0JBVARh1OJJG0P8wMi'
WHERE email = 'admin@crowdelic.com';
