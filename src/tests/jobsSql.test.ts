import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const sqlPath = fileURLToPath(new URL("../../supabase/jobs.sql", import.meta.url));
const sql = readFileSync(sqlPath, "utf8");

describe("jobs SQL security", () => {
  it("expone postulaciones públicas solo mediante una RPC de campos públicos", () => {
    expect(sql).toContain("CREATE OR REPLACE FUNCTION public.submit_job_application(");
    expect(sql).toMatch(/SECURITY DEFINER\s+SET search_path = public/);
    expect(sql).toContain("REVOKE INSERT ON TABLE public.job_applications FROM anon, authenticated;");
    expect(sql).toContain(
      "GRANT EXECUTE ON FUNCTION public.submit_job_application(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT) TO anon, authenticated;",
    );

    const rpc = sql.match(
      /CREATE OR REPLACE FUNCTION public\.submit_job_application\([\s\S]*?\n\$\$;/,
    )?.[0];

    expect(rpc).toBeDefined();
    expect(rpc).not.toMatch(/p_(id|status|internal_notes|created_at|updated_at)\b/);
    expect(rpc).toContain("gen_random_uuid(),");
    expect(rpc).toContain("'new',");
    expect(rpc).toContain("NULL,");
    expect(rpc).toMatch(/NOW\(\),\s+NOW\(\)/);
  });

  it("no permite reemplazar objetos del bucket de CV", () => {
    const storagePolicies = sql.slice(sql.indexOf("INSERT INTO storage.buckets"));

    expect(storagePolicies).not.toMatch(/ON storage\.objects\s+FOR UPDATE/);
  });
});
