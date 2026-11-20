-- ==============================================================================
-- RayFin 2.0 Migration: Multitenant Constraints, Balance Sync Trigger, and Personal Liabilities
-- File: supabase/migrations/20261120_fix_multitenant_and_features.sql
-- ==============================================================================

-- 1. Fix accounts unique constraint for multi-tenancy
ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_account_name_key;
ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_user_id_account_name_key;
ALTER TABLE public.accounts ADD CONSTRAINT accounts_user_id_account_name_key UNIQUE (user_id, account_name);

-- 2. Fix budgets unique constraint for multi-tenancy
ALTER TABLE public.budgets DROP CONSTRAINT IF EXISTS budgets_month_year_category_key;
ALTER TABLE public.budgets DROP CONSTRAINT IF EXISTS budgets_user_id_month_year_category_key;
ALTER TABLE public.budgets ADD CONSTRAINT budgets_user_id_month_year_category_key UNIQUE (user_id, month_year, category);

-- 3. Balance sync function & trigger for multi-tenancy
CREATE OR REPLACE FUNCTION public.mutate_balance_for_user(p_user_id uuid, p_account_name character varying, p_delta numeric)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.accounts
    SET current_balance = current_balance + p_delta,
        updated_at = NOW()
    WHERE account_name = p_account_name
      AND (user_id = p_user_id OR (p_user_id IS NULL AND user_id IS NULL));
END;
$$;

-- Maintain backward compatibility for single-argument or RPC callers
CREATE OR REPLACE FUNCTION public.mutate_balance(p_account_name character varying, p_delta numeric)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    PERFORM public.mutate_balance_for_user(auth.uid(), p_account_name, p_delta);
END;
$$;

-- Trigger function on public.transactions to automatically synchronize account balances per user
CREATE OR REPLACE FUNCTION public.fn_sync_account_balance()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    -- Rollback previous balance effect on UPDATE or DELETE
    IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') THEN
        IF OLD.flow_type = 'EXPENSE' THEN
            PERFORM public.mutate_balance_for_user(OLD.user_id, OLD.source_account, OLD.amount);
        ELSIF OLD.flow_type = 'INCOME' THEN
            PERFORM public.mutate_balance_for_user(OLD.user_id, OLD.source_account, -OLD.amount);
        ELSIF OLD.flow_type = 'TRANSFER_INTERNAL' THEN
            PERFORM public.mutate_balance_for_user(OLD.user_id, OLD.source_account, OLD.amount);
            IF OLD.destination_account IS NOT NULL THEN
                PERFORM public.mutate_balance_for_user(OLD.user_id, OLD.destination_account, -OLD.amount);
            END IF;
        END IF;
    END IF;

    -- Apply new balance effect on INSERT or UPDATE
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        IF NEW.flow_type = 'EXPENSE' THEN
            PERFORM public.mutate_balance_for_user(NEW.user_id, NEW.source_account, -NEW.amount);
        ELSIF NEW.flow_type = 'INCOME' THEN
            PERFORM public.mutate_balance_for_user(NEW.user_id, NEW.source_account, NEW.amount);
        ELSIF NEW.flow_type = 'TRANSFER_INTERNAL' THEN
            PERFORM public.mutate_balance_for_user(NEW.user_id, NEW.source_account, -NEW.amount);
            IF NEW.destination_account IS NOT NULL THEN
                PERFORM public.mutate_balance_for_user(NEW.user_id, NEW.destination_account, NEW.amount);
            END IF;
        END IF;
    END IF;

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_account_balance ON public.transactions;
CREATE TRIGGER trg_sync_account_balance
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_account_balance();

-- Permissions
GRANT EXECUTE ON FUNCTION public.mutate_balance_for_user(uuid, character varying, numeric) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mutate_balance(character varying, numeric) TO authenticated, service_role;

-- 4. Table public.personal_liabilities
CREATE TABLE IF NOT EXISTS public.personal_liabilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  creditor_name TEXT NOT NULL,
  title TEXT NOT NULL,
  principal_amount NUMERIC(15,2) NOT NULL,
  remaining_amount NUMERIC(15,2) NOT NULL,
  due_date_label TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAID')),
  source_account TEXT DEFAULT 'BCA',
  notes TEXT,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_personal_liabilities_user ON public.personal_liabilities(user_id, status);

ALTER TABLE public.personal_liabilities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own personal liabilities" ON public.personal_liabilities;
CREATE POLICY "Users can manage their own personal liabilities"
  ON public.personal_liabilities FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
