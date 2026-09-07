import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import {
  createProtokolas,
  deleteProtokolas,
  listProtokolai,
  updateProtokolas,
  type Protokolas,
  type ProtokolasInput,
} from "@/lib/protokolai.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/irasai")({
  head: () => ({
    meta: [
      { title: "Įrašai — tarnybinių duomenų lentelė" },
      {
        name: "description",
        content: "Visų įrašų lentelė su siuntų, ikiteisminių numerių ir bylų būsenos duomenimis.",
      },
      { property: "og:title", content: "Įrašai — tarnybinių duomenų lentelė" },
      {
        property: "og:description",
        content: "Visų įrašų lentelė su siuntų, ikiteisminių numerių ir bylų būsenos duomenimis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IrasaiPage,
});

const TEXT_FIELDS: { key: keyof ProtokolasInput; label: string; type: "date" | "text" }[] = [
  { key: "data", label: "Data", type: "date" },
  { key: "gavimo_data", label: "Gavimo data", type: "date" },
  { key: "psp", label: "PSP", type: "text" },
  { key: "tipas", label: "Tipas", type: "text" },
  { key: "tyrejas", label: "Tyrėjas", type: "text" },
  { key: "padalinys", label: "Padalinys", type: "text" },
  { key: "postas", label: "Postas", type: "text" },
  { key: "pareigunas", label: "Pareigūnas", type: "text" },
  { key: "pazymejimas", label: "Pažymėjimas", type: "text" },
  { key: "siuntos_nr", label: "Siuntos Nr.", type: "text" },
  { key: "ikiteism_nr", label: "Ikiteisminio Nr.", type: "text" },
  { key: "ikiteisminis_prad", label: "Ikiteisminis pradėtas", type: "date" },
  { key: "bylos_baigimo_data", label: "Bylos baigimo data", type: "date" },
];

const EMPTY: ProtokolasInput = {
  data: "",
  gavimo_data: "",
  psp: "",
  tipas: "",
  tyrejas: "",
  padalinys: "",
  postas: "",
  pareigunas: "",
  pazymejimas: "",
  siuntos_nr: "",
  ikiteism_nr: "",
  ikiteisminis_prad: "",
  pastabos: "",
  byla_baigta: false,
  bylos_baigimo_data: "",
};

function toForm(row: Protokolas): ProtokolasInput {
  return {
    data: row.data ?? "",
    gavimo_data: row.gavimo_data ?? "",
    psp: row.psp ?? "",
    tipas: row.tipas ?? "",
    tyrejas: row.tyrejas ?? "",
    padalinys: row.padalinys ?? "",
    postas: row.postas ?? "",
    pareigunas: row.pareigunas ?? "",
    pazymejimas: row.pazymejimas ?? "",
    siuntos_nr: row.siuntos_nr ?? "",
    ikiteism_nr: row.ikiteism_nr ?? "",
    ikiteisminis_prad: row.ikiteisminis_prad ?? "",
    pastabos: row.pastabos ?? "",
    byla_baigta: row.byla_baigta,
    bylos_baigimo_data: row.bylos_baigimo_data ?? "",
  };
}

function IrasaiPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchAll = useServerFn(listProtokolai);
  const create = useServerFn(createProtokolas);
  const update = useServerFn(updateProtokolas);
  const remove = useServerFn(deleteProtokolas);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProtokolasInput>(EMPTY);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["protokolai"],
    queryFn: () => fetchAll(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["protokolai"] });

  const saveMutation = useMutation({
    mutationFn: async (values: ProtokolasInput) =>
      editingId ? update({ data: { id: editingId, values } }) : create({ data: values }),
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      toast.success(editingId ? "Įrašas atnaujintas" : "Įrašas sukurtas");
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : "Nepavyko išsaugoti"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      invalidate();
      toast.success("Įrašas ištrintas");
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : "Nepavyko ištrinti"),
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (statusFilter === "open" && row.byla_baigta) return false;
      if (statusFilter === "closed" && !row.byla_baigta) return false;
      if (!term) return true;
      return [row.siuntos_nr, row.ikiteism_nr, row.pareigunas]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [rows, search, statusFilter]);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY);
    setDialogOpen(true);
  };

  const openEdit = (row: Protokolas) => {
    setEditingId(row.id);
    setForm(toForm(row));
    setDialogOpen(true);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate({ to: "/auth" });
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Įrašai</h1>
            <p className="text-sm text-muted-foreground">
              {filtered.length} iš {rows.length} įrašų
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={openNew}>Naujas įrašas</Button>
            <Button variant="outline" onClick={signOut}>
              Atsijungti
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Paieška: siuntos nr., ikiteisminio nr., pareigūnas"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
          >
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Visos bylos</SelectItem>
              <SelectItem value="open">Nebaigtos</SelectItem>
              <SelectItem value="closed">Baigtos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Gavimo data</TableHead>
                  <TableHead>PSP</TableHead>
                  <TableHead>Tipas</TableHead>
                  <TableHead>Tyrėjas</TableHead>
                  <TableHead>Padalinys</TableHead>
                  <TableHead>Postas</TableHead>
                  <TableHead>Pareigūnas</TableHead>
                  <TableHead>Pažymėjimas</TableHead>
                  <TableHead>Siuntos Nr.</TableHead>
                  <TableHead>Ikiteisminio Nr.</TableHead>
                  <TableHead>Ikiteisminis pradėtas</TableHead>
                  <TableHead>Pastabos</TableHead>
                  <TableHead>Byla baigta</TableHead>
                  <TableHead>Bylos baigimo data</TableHead>
                  <TableHead className="text-right">Veiksmai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={16} className="py-10 text-center text-muted-foreground">
                      Kraunama…
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={16} className="py-10 text-center text-muted-foreground">
                      Įrašų nėra. Pradėkite paspaudę „Naujas įrašas“.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.data ?? "—"}</TableCell>
                      <TableCell>{row.gavimo_data ?? "—"}</TableCell>
                      <TableCell>{row.psp ?? "—"}</TableCell>
                      <TableCell>{row.tipas ?? "—"}</TableCell>
                      <TableCell>{row.tyrejas ?? "—"}</TableCell>
                      <TableCell>{row.padalinys ?? "—"}</TableCell>
                      <TableCell>{row.postas ?? "—"}</TableCell>
                      <TableCell>{row.pareigunas ?? "—"}</TableCell>
                      <TableCell>{row.pazymejimas ?? "—"}</TableCell>
                      <TableCell>{row.siuntos_nr ?? "—"}</TableCell>
                      <TableCell>{row.ikiteism_nr ?? "—"}</TableCell>
                      <TableCell>{row.ikiteisminis_prad ?? "—"}</TableCell>
                      <TableCell className="max-w-64 truncate">{row.pastabos ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={row.byla_baigta ? "default" : "secondary"}>
                          {row.byla_baigta ? "Baigta" : "Nebaigta"}
                        </Badge>
                      </TableCell>
                      <TableCell>{row.bylos_baigimo_data ?? "—"}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
                          Redaguoti
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Ištrinti šį įrašą?")) deleteMutation.mutate(row.id);
                          }}
                        >
                          Ištrinti
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Redaguoti įrašą" : "Naujas įrašas"}</DialogTitle>
          </DialogHeader>
          <form
            id="protokolas-form"
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate(form);
            }}
          >
            {TEXT_FIELDS.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type={field.type}
                  value={(form[field.key] as string) ?? ""}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                />
              </div>
            ))}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="pastabos">Pastabos</Label>
              <Textarea
                id="pastabos"
                rows={3}
                value={form.pastabos ?? ""}
                onChange={(e) => setForm({ ...form, pastabos: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Checkbox
                id="byla_baigta"
                checked={form.byla_baigta}
                onCheckedChange={(checked) => setForm({ ...form, byla_baigta: checked === true })}
              />
              <Label htmlFor="byla_baigta">Byla baigta</Label>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
              Atšaukti
            </Button>
            <Button type="submit" form="protokolas-form" disabled={saveMutation.isPending}>
              Išsaugoti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
