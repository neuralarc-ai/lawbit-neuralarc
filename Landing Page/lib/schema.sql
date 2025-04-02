-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create tables
CREATE TABLE public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'plus', 'ultra')),
    PRIMARY KEY (id)
);

CREATE TABLE public.contracts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('generated', 'uploaded')),
    status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    file_url TEXT,
    file_type TEXT CHECK (file_type IN ('pdf', 'docx'))
);

CREATE TABLE public.analysis_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contract_id UUID REFERENCES public.contracts ON DELETE CASCADE,
    user_id UUID REFERENCES public.users ON DELETE CASCADE,
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    analysis_summary TEXT NOT NULL,
    key_findings JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed'))
);

CREATE TABLE public.contract_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contract_id UUID REFERENCES public.contracts ON DELETE CASCADE,
    user_id UUID REFERENCES public.users ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'analyzed')),
    details JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can view their own contracts"
    ON public.contracts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contracts"
    ON public.contracts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contracts"
    ON public.contracts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contracts"
    ON public.contracts FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own analysis results"
    ON public.analysis_results FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analysis results"
    ON public.analysis_results FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own contract history"
    ON public.contract_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contract history"
    ON public.contract_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create functions for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
    BEFORE UPDATE ON public.contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 