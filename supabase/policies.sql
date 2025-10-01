-- =============================================
-- MochiFace 数据库策略
-- 最终版本 - 包含所有 RLS 策略、函数和触发器
-- =============================================

-- 启用行级安全策略
alter table public.profiles enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.generated_images enable row level security;
alter table public.reward_tasks enable row level security;

-- 删除已存在的策略（如果存在）
drop policy if exists "profiles: owner rw" on public.profiles;
drop policy if exists "credit_transactions: owner r" on public.credit_transactions;
drop policy if exists "generated_images: owner rw" on public.generated_images;
drop policy if exists "reward_tasks: owner rw" on public.reward_tasks;

-- profiles 表策略：用户只能访问和修改自己的资料
create policy "profiles: owner rw"
on public.profiles for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- credit_transactions 表策略：用户只能查看自己的积分流水
create policy "credit_transactions: owner r"
on public.credit_transactions for select
to authenticated
using (auth.uid() = user_id);

-- generated_images 表策略：用户只能访问自己的生成记录
create policy "generated_images: owner rw"
on public.generated_images for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- reward_tasks 表策略：用户只能访问自己的奖励任务
create policy "reward_tasks: owner rw"
on public.reward_tasks for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- 删除已存在的函数和触发器（如果存在）
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 创建用户注册后自动创建 profile 的函数
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- 从 user_metadata 中获取用户名，如果没有则使用 email 的前缀
  declare
    username_value text;
  begin
    -- 尝试从 user_metadata 获取用户名
    if new.raw_user_meta_data ? 'username' then
      username_value := new.raw_user_meta_data->>'username';
    else
      -- 如果没有用户名，使用邮箱的前缀部分
      username_value := split_part(new.email, '@', 1);
    end if;
    
    -- 插入用户资料
    insert into public.profiles (user_id, username, points)
    values (new.id, username_value, 3);
    
    -- 插入注册奖励积分流水
    insert into public.credit_transactions (user_id, delta, reason)
    values (new.id, 3, 'signup_bonus');
    
    return new;
  end;
end;
$$ language plpgsql security definer;

-- 创建触发器：用户注册后自动创建 profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 删除已存在的积分函数（如果存在）
drop function if exists public.deduct_credits(uuid, int, text, text);
drop function if exists public.add_credits(uuid, int, text, text);

-- 创建积分扣减函数（带事务保护）
create or replace function public.deduct_credits(
  p_user_id uuid,
  p_amount int,
  p_reason text,
  p_ref_id text default null
)
returns boolean as $$
declare
  current_points int;
begin
  -- 获取当前积分
  select points into current_points
  from public.profiles
  where user_id = p_user_id;
  
  -- 检查积分是否足够
  if current_points < p_amount then
    return false;
  end if;
  
  -- 扣减积分
  update public.profiles
  set points = points - p_amount
  where user_id = p_user_id;
  
  -- 记录积分流水
  insert into public.credit_transactions (user_id, delta, reason, ref_id)
  values (p_user_id, -p_amount, p_reason, p_ref_id);
  
  return true;
end;
$$ language plpgsql security definer;

-- 创建积分增加函数
create or replace function public.add_credits(
  p_user_id uuid,
  p_amount int,
  p_reason text,
  p_ref_id text default null
)
returns void as $$
begin
  -- 增加积分
  update public.profiles
  set points = points + p_amount
  where user_id = p_user_id;
  
  -- 记录积分流水
  insert into public.credit_transactions (user_id, delta, reason, ref_id)
  values (p_user_id, p_amount, p_reason, p_ref_id);
end;
$$ language plpgsql security definer;