import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Tables } from "@/integrations/supabase/types";

export type Protokolas = Tables<"protokolai">;

export type ProtokolasInput = {
  data: string | null;
  gavimo_data: string | null;
  psp: string | null;
  tipas: string | null;
  tyrejas: string | null;
  padalinys: string | null;
  postas: string | null;
  pareigunas: string | null;
  pazymejimas: string | null;
  siuntos_nr: string | null;
  ikiteism_nr: string | null;
  ikiteisminis_prad: string | null;
  pastabos: string | null;
  byla_baigta: boolean;
  bylos_baigimo_data: string | null;
};

const FIELDS = [
  "data",
  "gavimo_data",
  "psp",
  "tipas",
  "tyrejas",
  "padalinys",
  "postas",
  "pareigunas",
  "pazymejimas",
  "siuntos_nr",
  "ikiteism_nr",
  "ikiteisminis_prad",
  "pastabos",
  "bylos_baigimo_data",
] as const;

function normalize(input: ProtokolasInput): ProtokolasInput {
  const out = { byla_baigta: Boolean(input.byla_baigta) } as ProtokolasInput;
  for (const key of FIELDS) {
    const value = input[key];
    out[key] = typeof value === "string" && value.trim() !== "" ? value.trim() : null;
  }
  return out;
}

export const listProtokolai = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("protokolai")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createProtokolas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: ProtokolasInput) => input)
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("protokolai")
      .insert({ ...normalize(data), created_by: context.userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateProtokolas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; values: ProtokolasInput }) => input)
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("protokolai")
      .update(normalize(data.values))
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteProtokolas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("protokolai").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
