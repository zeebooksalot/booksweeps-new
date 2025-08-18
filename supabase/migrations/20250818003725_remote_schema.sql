drop policy "Users can view their own reader deliveries" on "public"."reader_deliveries";

drop policy "Users can update their own reader deliveries" on "public"."reader_deliveries";

alter table "public"."reader_library" drop constraint "reader_library_acquired_from_check";

alter table "public"."reader_library" add constraint "reader_library_acquired_from_check" CHECK (((acquired_from)::text = ANY (ARRAY[('giveaway'::character varying)::text, ('purchase'::character varying)::text, ('gift'::character varying)::text, ('author_direct'::character varying)::text, ('access_token'::character varying)::text]))) not valid;

alter table "public"."reader_library" validate constraint "reader_library_acquired_from_check";

create policy "Public can view book files for active delivery methods"
on "public"."book_files"
as permissive
for select
to anon, authenticated
using ((EXISTS ( SELECT 1
   FROM (book_delivery_methods bdm
     JOIN books b ON ((b.id = bdm.book_id)))
  WHERE ((bdm.book_id = book_files.book_id) AND (bdm.is_active = true) AND ((bdm.delivery_method)::text = 'ebook'::text)))));


create policy "Public can view reader deliveries"
on "public"."reader_deliveries"
as permissive
for select
to anon, authenticated
using (true);


create policy "Users can update their own reader deliveries"
on "public"."reader_deliveries"
as permissive
for update
to anon, authenticated
using (true)
with check (true);



