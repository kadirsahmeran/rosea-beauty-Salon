-- ============================================================================
-- Stripe ödeme alanları
-- 0004 (iyzico) çalıştıysa o kolonlar kaldırılır; pending/failed ve
-- expire fonksiyonu korunur veya yeniden oluşturulur.
-- 0005_remove_iyzico.sql dosyasını ÇALIŞTIRMAYIN.
-- ============================================================================

drop index if exists public.appointments_payment_token_uidx;

alter table public.appointments
  drop column if exists payment_token,
  drop column if exists iyzico_payment_id,
  drop column if exists iyzico_conversation_id;

alter table public.appointments
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text;

create unique index if not exists appointments_stripe_session_uidx
  on public.appointments (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

alter table public.appointments
  drop constraint if exists appointments_payment_status_check;

alter table public.appointments
  add constraint appointments_payment_status_check
  check (payment_status in (
    'unpaid',
    'pending',
    'paid',
    'failed',
    'refunded',
    'partially_paid'
  ));

create or replace function public.expire_stale_pending_payments(
  max_age interval default interval '45 minutes'
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  update public.appointments
  set
    status = 'cancelled',
    payment_status = 'failed',
    updated_at = now()
  where payment_status = 'pending'
    and status = 'pending'
    and created_at < now() - max_age;

  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.expire_stale_pending_payments(interval) from public;
revoke all on function public.expire_stale_pending_payments(interval) from anon, authenticated;
grant execute on function public.expire_stale_pending_payments(interval) to service_role;
