-- =============================================
-- MochiFace 数据库架构
-- 最终版本 - 包含所有表结构、索引和触发器
-- =============================================

-- 创建 profiles 表：用户扩展资料 & 积分
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  points int not null default 3,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

-- 创建 updated_at 触发器函数
create or replace function public.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 删除已存在的触发器（如果存在）
drop trigger if exists trg_profiles_touch_updated on public.profiles;

-- 为 profiles 表添加 updated_at 触发器
create trigger trg_profiles_touch_updated
before update on public.profiles
for each row execute function public.touch_updated_at();

-- 创建积分流水表：正数为加分，负数为扣分
create table if not exists public.credit_transactions (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  delta int not null,
  reason text not null,             -- e.g. 'signup_bonus' | 'image_generation' | 'reward_task'
  ref_id text,                      -- 关联的业务ID（如生成任务ID）
  created_at timestamptz not null default now()
);

-- 创建生成记录表
create table if not exists public.generated_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_image_url text not null,
  style text not null,              -- 风格名或ID
  status text not null default 'queued',   -- queued | running | success | failed
  result_image_url text,
  credits_spent int not null default 1,
  error_message text,
  created_at timestamptz not null default now()
);

-- 创建奖励任务记录表
create table if not exists public.reward_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_type text not null default 'video_watch',  -- 任务类型
  proof_token text not null,         -- 验证令牌
  is_used boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- 删除已存在的索引（如果存在）
drop index if exists idx_credit_transactions_user_id;
drop index if exists idx_credit_transactions_created_at;
drop index if exists idx_generated_images_user_id;
drop index if exists idx_generated_images_status;
drop index if exists idx_generated_images_created_at;
drop index if exists idx_reward_tasks_user_id;
drop index if exists idx_reward_tasks_proof_token;
drop index if exists idx_reward_tasks_expires_at;

-- 创建索引以提高查询性能
create index idx_credit_transactions_user_id on public.credit_transactions(user_id);
create index idx_credit_transactions_created_at on public.credit_transactions(created_at desc);
create index idx_generated_images_user_id on public.generated_images(user_id);
create index idx_generated_images_status on public.generated_images(status);
create index idx_generated_images_created_at on public.generated_images(created_at desc);
create index idx_reward_tasks_user_id on public.reward_tasks(user_id);
create index idx_reward_tasks_proof_token on public.reward_tasks(proof_token);
create index idx_reward_tasks_expires_at on public.reward_tasks(expires_at);