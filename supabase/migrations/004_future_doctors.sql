create table if not exists future_doctors (
  id uuid default gen_random_uuid() primary key,
  first_name text not null,
  last_name text not null,
  specialty text,
  current_school text,
  current_program text,
  expected_start_year int,
  how_connected text,
  notes text,
  next_checkin date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table future_doctors disable row level security;

drop trigger if exists future_doctors_updated_at on future_doctors;
create trigger future_doctors_updated_at
  before update on future_doctors
  for each row execute function update_updated_at();

create unique index if not exists idx_future_doctors_name_unique
  on future_doctors(first_name, last_name);
