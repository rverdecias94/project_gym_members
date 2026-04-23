create or replace function public.process_gym_payment(
  p_uid_customer uuid,
  p_amount numeric,
  p_currency text,
  p_new_next_payment_date date
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_gym info_general_gym%rowtype;
  v_expected numeric;
  v_active_plan text;
  v_month_at_next int;
  v_base numeric;
begin
  if not exists (select 1 from public.admins a where a.uuid = auth.uid()) then
    raise exception 'not_authorized';
  end if;

  if p_uid_customer is null then
    raise exception 'missing_customer';
  end if;
  if p_new_next_payment_date is null then
    raise exception 'missing_next_date';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;

  select * into v_gym
  from public.info_general_gym
  where owner_id = p_uid_customer
  for update;

  if not found then
    raise exception 'gym_not_found';
  end if;

  v_expected := coalesce(v_gym.next_payment_amount, 0);
  if abs(coalesce(p_amount, 0) - v_expected) >= 0.01 then
    raise exception 'amount_mismatch';
  end if;

  v_active_plan := case when coalesce(v_gym.store, false) = true then 'Premium' else 'Standard' end;

  if exists (
    select 1
    from public.payment_history_customer ph
    where ph.uid_customer = p_uid_customer
      and ph.next_payment_date = p_new_next_payment_date
      and ph.active_plan = v_active_plan
  ) then
    raise exception 'duplicate_payment';
  end if;

  insert into public.payment_history_customer(uid_customer, quantity_paid, currency, next_payment_date, active_plan)
  values (p_uid_customer, p_amount, p_currency, p_new_next_payment_date, v_active_plan);

  v_month_at_next := (
    (
      (date_part('year', age(p_new_next_payment_date::date, v_gym.created_at::date)) * 12) +
      (date_part('month', age(p_new_next_payment_date::date, v_gym.created_at::date))) -
      case when extract(day from p_new_next_payment_date::date) < extract(day from v_gym.created_at::date) then 1 else 0 end
    ) + 1
  )::int;
  if v_month_at_next < 1 then v_month_at_next := 1; end if;

  if coalesce(v_gym.store, false) = true then
    v_base := case when v_month_at_next <= 1 then 0 when v_month_at_next in (2,3) then 19.6 else 28 end;
  else
    v_base := case when v_month_at_next <= 1 then 0 when v_month_at_next = 2 then 12 else 15 end;
  end if;

  update public.info_general_gym
  set
    last_payment_at = now(),
    last_payment_amount = p_amount,
    last_payment_for_date = v_gym.next_payment_date,
    last_payment_date = current_date,
    next_payment_date = p_new_next_payment_date,
    additional_costs_amount = 0,
    next_payment_amount = v_base,
    active = true
  where owner_id = p_uid_customer;

  return jsonb_build_object(
    'ok', true,
    'uid_customer', p_uid_customer,
    'paid_amount', p_amount,
    'currency', p_currency,
    'new_next_payment_date', p_new_next_payment_date,
    'active_plan', v_active_plan,
    'next_payment_amount', v_base
  );
end;
$$;

revoke all on function public.process_gym_payment(uuid, numeric, text, date) from public;
grant execute on function public.process_gym_payment(uuid, numeric, text, date) to authenticated;

