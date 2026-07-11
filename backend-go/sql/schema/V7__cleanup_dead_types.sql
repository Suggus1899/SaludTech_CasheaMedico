-- Drop unused PG ENUM types (columns are VARCHAR, enums were never referenced)
DROP TYPE IF EXISTS credit_line_type;
DROP TYPE IF EXISTS merchant_category;
