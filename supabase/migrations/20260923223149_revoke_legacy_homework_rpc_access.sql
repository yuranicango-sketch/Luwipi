-- The public homework flow is no longer part of the local-first Luwipi.
-- Keep historical tables/data intact, but remove callable SECURITY DEFINER RPC access.
revoke execute on function public.get_public_homework(text) from public, anon, authenticated;
revoke execute on function public.update_public_homework_progress(text, boolean, boolean, integer) from public, anon, authenticated;
revoke execute on function public.update_public_homework_progress(text, boolean, boolean, integer, boolean) from public, anon, authenticated;
