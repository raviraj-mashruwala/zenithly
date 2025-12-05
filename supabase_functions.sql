-- Create a function to allow users to delete their own account
create or replace function delete_user_account()
returns void
language plpgsql
security definer
as $$
declare
  current_user_id uuid;
begin
  -- Get the ID of the authenticated user
  current_user_id := auth.uid();
  
  -- Ensure a user is logged in
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Delete associated data (if constraints don't cascade, we do it manually ensures cleanup)
  delete from public.transactions where user_id = current_user_id;
  delete from public.categories where user_id = current_user_id;
  delete from public.wallets where user_id = current_user_id;
  delete from public.users where id = current_user_id;

  -- Delete the user from the auth system
  delete from auth.users where id = current_user_id;
end;
$$;
