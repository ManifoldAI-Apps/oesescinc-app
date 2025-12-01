-- Script para corrigir a tabela de turmas (classes) e limpar dados corrompidos
-- Rode este script no Editor SQL do Supabase

DO $$
BEGIN
    -- 1. Verifica se existe a coluna 'subjects' (errada) e renomeia para 'schedule' (correta)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'subjects') THEN
        ALTER TABLE public.classes RENAME COLUMN subjects TO schedule;
    END IF;

    -- 2. Se a coluna 'schedule' ainda não existir, cria ela
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'schedule') THEN
        ALTER TABLE public.classes ADD COLUMN schedule JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    -- 3. Garante que a coluna student_ids existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'student_ids') THEN
        ALTER TABLE public.classes ADD COLUMN student_ids JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- 4. Limpa a tabela de turmas para remover dados inconsistentes
    -- Isso permitirá que o aplicativo recrie as turmas iniciais corretamente
    TRUNCATE TABLE public.classes CASCADE;

END $$;

-- Confirmação
SELECT 'Tabela classes corrigida e limpa com sucesso.' as status;
