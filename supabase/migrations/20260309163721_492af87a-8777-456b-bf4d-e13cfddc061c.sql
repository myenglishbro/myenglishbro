INSERT INTO public.user_roles (user_id, role)
VALUES ('220ec42c-6f7f-4fc0-a2dd-026ddfe00a21', 'content_admin')
ON CONFLICT (user_id, role) DO NOTHING;