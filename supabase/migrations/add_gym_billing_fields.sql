alter table public.info_general_gym
add column if not exists additional_costs_amount numeric not null default 0,
add column if not exists next_payment_amount numeric not null default 0,
add column if not exists last_payment_at timestamptz null,
add column if not exists last_payment_amount numeric null,
add column if not exists last_payment_for_date date null;

create unique index if not exists payment_history_customer_unique_period
on public.payment_history_customer (uid_customer, next_payment_date, active_plan)
where next_payment_date is not null and active_plan is not null;

update public.info_general_gym
set
  additional_costs_amount = coalesce(additional_costs_amount, 0),
  next_payment_amount = (
    (
      case
        when coalesce(store, false) = true then
          case
            when (
              (
                (date_part('year', age(next_payment_date::date, created_at::date)) * 12) +
                (date_part('month', age(next_payment_date::date, created_at::date))) -
                case when extract(day from next_payment_date::date) < extract(day from created_at::date) then 1 else 0 end
              ) + 1
            ) <= 1 then 0
            when (
              (
                (date_part('year', age(next_payment_date::date, created_at::date)) * 12) +
                (date_part('month', age(next_payment_date::date, created_at::date))) -
                case when extract(day from next_payment_date::date) < extract(day from created_at::date) then 1 else 0 end
              ) + 1
            ) in (2, 3) then 19.6
            else 28
          end
        else
          case
            when (
              (
                (date_part('year', age(next_payment_date::date, created_at::date)) * 12) +
                (date_part('month', age(next_payment_date::date, created_at::date))) -
                case when extract(day from next_payment_date::date) < extract(day from created_at::date) then 1 else 0 end
              ) + 1
            ) <= 1 then 0
            when (
              (
                (date_part('year', age(next_payment_date::date, created_at::date)) * 12) +
                (date_part('month', age(next_payment_date::date, created_at::date))) -
                case when extract(day from next_payment_date::date) < extract(day from created_at::date) then 1 else 0 end
              ) + 1
            ) = 2 then 12
            else 15
          end
      end
    ) + coalesce(additional_costs_amount, 0)
  );

