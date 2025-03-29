-- Create chat_history table
create table if not exists chat_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  source text check (source in ('project_data', 'web_search', null)),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table chat_history enable row level security;

-- Create policy to allow users to see only their own chat history
create policy "Users can view their own chat history"
  on chat_history for select
  using (auth.uid() = user_id);

-- Create policy to allow users to insert their own chat history
create policy "Users can insert their own chat history"
  on chat_history for insert
  with check (auth.uid() = user_id);

-- Create index for faster queries
create index chat_history_user_id_created_at_idx on chat_history(user_id, created_at desc); 