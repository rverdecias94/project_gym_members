alter table public.info_general_gym
add column if not exists onboarding_tours jsonb not null default '{}'::jsonb;

alter table public.info_shops
add column if not exists onboarding_tours jsonb not null default '{}'::jsonb;

