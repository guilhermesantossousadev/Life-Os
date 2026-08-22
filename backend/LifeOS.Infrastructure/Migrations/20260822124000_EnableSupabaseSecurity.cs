using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LifeOS.Infrastructure.Migrations;

[DbContext(typeof(LifeOsDbContext))]
[Migration("20260822124000_EnableSupabaseSecurity")]
public sealed class EnableSupabaseSecurity : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            do $$
            declare
              table_name text;
            begin
              foreach table_name in array array[
                'user_preferences','categories','tags','projects','tasks','subtasks','inbox_items','events',
                'goals','goal_actions','notes','financial_accounts','credit_cards','transactions','transfers',
                'installment_purchases','installments','debts','budgets','study_subjects','assignments','courses',
                'study_topics','career_positions','career_goals','skills','certifications','assets',
                'asset_maintenances','documents'
              ] loop
                execute format('alter table public.%I enable row level security', table_name);
                execute format('drop policy if exists own_rows on public.%I', table_name);
                execute format('create policy own_rows on public.%I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())', table_name);
              end loop;
            end $$;

            alter table public.profiles enable row level security;
            drop policy if exists own_profile on public.profiles;
            create policy own_profile on public.profiles for all to authenticated
              using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());

            alter table public.project_tags enable row level security;
            drop policy if exists own_project_tags on public.project_tags;
            create policy own_project_tags on public.project_tags for all to authenticated
              using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()))
              with check (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));

            alter table public.note_tags enable row level security;
            drop policy if exists own_note_tags on public.note_tags;
            create policy own_note_tags on public.note_tags for all to authenticated
              using (exists (select 1 from public.notes n where n.id = note_id and n.user_id = auth.uid()))
              with check (exists (select 1 from public.notes n where n.id = note_id and n.user_id = auth.uid()));

            alter table public.document_tags enable row level security;
            drop policy if exists own_document_tags on public.document_tags;
            create policy own_document_tags on public.document_tags for all to authenticated
              using (exists (select 1 from public.documents d where d.id = document_id and d.user_id = auth.uid()))
              with check (exists (select 1 from public.documents d where d.id = document_id and d.user_id = auth.uid()));

            alter table public.vehicles enable row level security;
            drop policy if exists own_vehicles on public.vehicles;
            create policy own_vehicles on public.vehicles for all to authenticated
              using (exists (select 1 from public.assets a where a.id = asset_id and a.user_id = auth.uid()))
              with check (exists (select 1 from public.assets a where a.id = asset_id and a.user_id = auth.uid()));

            insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
            values (
              'documents', 'documents', false, 20971520,
              array['application/pdf','image/png','image/jpeg','image/webp','application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/plain','text/csv']
            )
            on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit,
              allowed_mime_types = excluded.allowed_mime_types;

            drop policy if exists authenticated_read_own_files on storage.objects;
            create policy authenticated_read_own_files on storage.objects for select to authenticated
              using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
            drop policy if exists authenticated_upload_own_files on storage.objects;
            create policy authenticated_upload_own_files on storage.objects for insert to authenticated
              with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
            drop policy if exists authenticated_update_own_files on storage.objects;
            create policy authenticated_update_own_files on storage.objects for update to authenticated
              using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text)
              with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
            drop policy if exists authenticated_delete_own_files on storage.objects;
            create policy authenticated_delete_own_files on storage.objects for delete to authenticated
              using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            drop policy if exists authenticated_delete_own_files on storage.objects;
            drop policy if exists authenticated_update_own_files on storage.objects;
            drop policy if exists authenticated_upload_own_files on storage.objects;
            drop policy if exists authenticated_read_own_files on storage.objects;
            drop policy if exists own_vehicles on public.vehicles;
            drop policy if exists own_document_tags on public.document_tags;
            drop policy if exists own_note_tags on public.note_tags;
            drop policy if exists own_project_tags on public.project_tags;
            drop policy if exists own_profile on public.profiles;

            do $$
            declare
              table_name text;
            begin
              foreach table_name in array array[
                'user_preferences','categories','tags','projects','tasks','subtasks','inbox_items','events',
                'goals','goal_actions','notes','financial_accounts','credit_cards','transactions','transfers',
                'installment_purchases','installments','debts','budgets','study_subjects','assignments','courses',
                'study_topics','career_positions','career_goals','skills','certifications','assets',
                'asset_maintenances','documents'
              ] loop
                execute format('drop policy if exists own_rows on public.%I', table_name);
              end loop;
            end $$;
            """);
    }
}
