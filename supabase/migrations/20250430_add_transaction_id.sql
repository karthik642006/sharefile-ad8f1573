
-- Add transaction_id column to the subscriptions table if it doesn't exist
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS transaction_id TEXT;

-- Create an index for faster lookups by transaction_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_transaction_id ON public.subscriptions(transaction_id);
