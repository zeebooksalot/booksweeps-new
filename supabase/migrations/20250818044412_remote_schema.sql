alter table "public"."reader_library" drop constraint "reader_library_acquired_from_check";

create table "public"."user_upgrade_logs" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "from_user_type" text not null,
    "to_user_type" text not null,
    "upgrade_reason" text,
    "domain_referrer" text,
    "ip_address" inet,
    "user_agent" text,
    "upgraded_at" timestamp with time zone default now()
);


alter table "public"."user_upgrade_logs" enable row level security;

alter table "public"."reader_deliveries" add column "re_download_count" integer default 0;

CREATE INDEX idx_reader_deliveries_email_method ON public.reader_deliveries USING btree (reader_email, delivery_method_id);

CREATE INDEX idx_user_upgrade_logs_reason ON public.user_upgrade_logs USING btree (upgrade_reason);

CREATE INDEX idx_user_upgrade_logs_upgraded_at ON public.user_upgrade_logs USING btree (upgraded_at);

CREATE INDEX idx_user_upgrade_logs_user_id ON public.user_upgrade_logs USING btree (user_id);

CREATE UNIQUE INDEX user_upgrade_logs_pkey ON public.user_upgrade_logs USING btree (id);

alter table "public"."user_upgrade_logs" add constraint "user_upgrade_logs_pkey" PRIMARY KEY using index "user_upgrade_logs_pkey";

alter table "public"."user_upgrade_logs" add constraint "user_upgrade_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_upgrade_logs" validate constraint "user_upgrade_logs_user_id_fkey";

alter table "public"."reader_library" add constraint "reader_library_acquired_from_check" CHECK (((acquired_from)::text = ANY (ARRAY['giveaway'::text, 'purchase'::text, 'gift'::text, 'author_direct'::text, 'access_token'::text]))) not valid;

alter table "public"."reader_library" validate constraint "reader_library_acquired_from_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.increment_download_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
    -- Update reader_deliveries download count
    UPDATE public.reader_deliveries
    SET download_count = download_count + 1,
        last_download_at = NOW()
    WHERE id = NEW.delivery_id;
    
    -- Update reader_library download count if exists - FIXED with explicit column reference
    UPDATE public.reader_library rl
    SET download_count = rl.download_count + 1,
        last_accessed_at = NOW()
    FROM public.reader_deliveries rd
    JOIN public.book_delivery_methods bdm ON rd.delivery_method_id = bdm.id
    WHERE rd.id = NEW.delivery_id
    AND rl.book_id = bdm.book_id
    AND rl.reader_id = (SELECT id FROM public.users WHERE email = rd.reader_email LIMIT 1);
    
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."user_upgrade_logs" to "anon";

grant insert on table "public"."user_upgrade_logs" to "anon";

grant references on table "public"."user_upgrade_logs" to "anon";

grant select on table "public"."user_upgrade_logs" to "anon";

grant trigger on table "public"."user_upgrade_logs" to "anon";

grant truncate on table "public"."user_upgrade_logs" to "anon";

grant update on table "public"."user_upgrade_logs" to "anon";

grant delete on table "public"."user_upgrade_logs" to "authenticated";

grant insert on table "public"."user_upgrade_logs" to "authenticated";

grant references on table "public"."user_upgrade_logs" to "authenticated";

grant select on table "public"."user_upgrade_logs" to "authenticated";

grant trigger on table "public"."user_upgrade_logs" to "authenticated";

grant truncate on table "public"."user_upgrade_logs" to "authenticated";

grant update on table "public"."user_upgrade_logs" to "authenticated";

grant delete on table "public"."user_upgrade_logs" to "service_role";

grant insert on table "public"."user_upgrade_logs" to "service_role";

grant references on table "public"."user_upgrade_logs" to "service_role";

grant select on table "public"."user_upgrade_logs" to "service_role";

grant trigger on table "public"."user_upgrade_logs" to "service_role";

grant truncate on table "public"."user_upgrade_logs" to "service_role";

grant update on table "public"."user_upgrade_logs" to "service_role";

create policy "Service role can insert upgrade logs"
on "public"."user_upgrade_logs"
as permissive
for insert
to public
with check (true);


create policy "Users can view own upgrade logs"
on "public"."user_upgrade_logs"
as permissive
for select
to public
using ((auth.uid() = user_id));



