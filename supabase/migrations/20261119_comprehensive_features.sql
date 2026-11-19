-- ==============================================================================
-- RayFin 2.0 Comprehensive Migration: Chat Messages, AI Rules, and Custom Categories
-- Paste and execute this in Supabase SQL Editor if you wish to have dedicated tables.
-- ==============================================================================

-- 1. Tabel Chat Messages (Cloud Synced AI Advisor History)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  type TEXT DEFAULT 'TEXT',
  content TEXT NOT NULL,
  draft JSONB,
  saved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created ON public.chat_messages(user_id, created_at ASC);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own chat messages"
  ON public.chat_messages FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Tabel User AI Rules (Aturan Personalisasi Kategori AI Advisor)
CREATE TABLE IF NOT EXISTS public.user_ai_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  rules_text TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_ai_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own AI rules"
  ON public.user_ai_rules FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Tabel User Categories (Kategori & Subkategori Kustom Per-User)
CREATE TABLE IF NOT EXISTS public.user_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📦',
  color TEXT NOT NULL DEFAULT '#6B7280',
  parent_category TEXT,  -- NULL = Kategori Utama, Non-null = Subkategori
  budget_bucket TEXT CHECK (budget_bucket IN ('needs', 'wants', 'savings')),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_user_categories_user ON public.user_categories(user_id, sort_order ASC);

ALTER TABLE public.user_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own categories"
  ON public.user_categories FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
