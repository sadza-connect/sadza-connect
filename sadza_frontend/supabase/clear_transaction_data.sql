-- ============================================================================
--  MATECH Integrated Services — Clear Transactional & Inbound Messages Data
--  Safely truncates/deletes dynamic user messages, quotes, orders & chat
--  PRESERVES: products, services, projects, staff_ids, profiles, company_settings
-- ============================================================================

-- 1. Clear order items and orders
truncate table public.order_items cascade;
truncate table public.orders cascade;

-- 2. Clear receipts and receipt items
truncate table public.receipt_items cascade;
truncate table public.receipts cascade;

-- 3. Clear quote requests / contacts / inbound messages
truncate table public.quote_requests cascade;

-- 4. Clear chat messages & chat sessions
truncate table public.chat_messages cascade;
truncate table public.chat_sessions cascade;

-- Optional: If you also want to clear job applications, uncomment the following line:
-- truncate table public.job_applications cascade;
