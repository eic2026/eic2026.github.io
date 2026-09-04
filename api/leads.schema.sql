-- Lead table for Supabase / Postgres. Matches LEAD_SCHEMA in api/enquiry.js (snake_case).
create type lead_status as enum ('NEW','CONTACTED','FOLLOW_UP_REQUIRED','QUOTATION_SENT','NEGOTIATION','CONVERTED','LOST');

create table if not exists leads (
  lead_id          text primary key,
  created_at       timestamptz not null default now(),
  type             text not null,            -- quote | contact | download
  intent           text,
  name             text not null,
  company          text,
  mobile           text not null,
  email            text,
  city             text,
  product          text,
  quantity         text,
  specification    text,
  application      text,
  message          text,
  resource         text,
  source_page      text,
  referrer         text,
  utm_source       text,
  utm_medium       text,
  utm_campaign     text,
  consent          boolean not null default false,
  status           lead_status not null default 'NEW',
  follow_up_notes  text,
  assigned_to      text,
  follow_up_date   date
);
create index if not exists leads_status_idx on leads (status);
create index if not exists leads_created_idx on leads (created_at desc);
