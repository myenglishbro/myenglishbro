import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Copy, Zap } from "lucide-react";

// Excludes visually ambiguous characters (0/O, 1/I/L) so codes are easy to type correctly
// when a student receives them by WhatsApp.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const generateCode = () => {
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
};

interface RechargeCodeRow {
  id: string;
  code: string;
  amount: number;
  price_soles: number | null;
  payment_reference: string | null;
  notes: string | null;
  created_at: string;
  redeemed_by: string | null;
  redeemed_at: string | null;
}

type FormState = {
  amount: number;
  price_soles: string;
  payment_reference: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  amount: 20,
  price_soles: "5",
  payment_reference: "",
  notes: "",
};

const AdminWordSurvivorRecargas = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const { data: codes = [], isLoading } = useQuery({
    queryKey: ["admin-word-survivor-recharge-codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("word_survivor_recharge_codes")
        .select("id, code, amount, price_soles, payment_reference, notes, created_at, redeemed_by, redeemed_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as RechargeCodeRow[];
    },
  });

  const { available, redeemed } = useMemo(() => {
    const available = codes.filter((c) => !c.redeemed_by).length;
    return { available, redeemed: codes.length - available };
  }, [codes]);

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("word_survivor_recharge_codes").insert({
        code: generateCode(),
        amount: Number(form.amount) || 0,
        price_soles: form.price_soles.trim() ? Number(form.price_soles) : null,
        payment_reference: form.payment_reference.trim() || null,
        notes: form.notes.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-word-survivor-recharge-codes"] });
      toast.success("Código generado");
      setOpen(false);
      setForm(EMPTY_FORM);
    },
    onError: () => toast.error("Error al generar el código (intenta de nuevo)"),
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado");
  };

  return (
    <div className="p-8 light" style={{ colorScheme: "light" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-display flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Recargas de energía
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Genera un código tras confirmar un pago por Yape/QR. El estudiante lo canjea desde la tienda del juego.
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-primary hover:bg-primary/90 text-white rounded-xl gap-2">
          <Plus className="h-4 w-4" />
          Generar código
        </Button>
      </div>

      <div className="flex gap-3 mb-4 text-sm text-slate-500">
        <span>
          <strong className="text-slate-800">{available}</strong> disponibles
        </span>
        <span>·</span>
        <span>
          <strong className="text-slate-800">{redeemed}</strong> canjeados
        </span>
      </div>

      <div className="dashboard-card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Cargando...</div>
        ) : codes.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Aún no has generado ningún código.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Energía</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((c) => (
                <TableRow key={c.id} className={c.redeemed_by ? "opacity-60" : ""}>
                  <TableCell className="font-mono font-bold tracking-widest text-slate-700">{c.code}</TableCell>
                  <TableCell className="text-sm text-slate-600">⚡ {c.amount}</TableCell>
                  <TableCell className="text-sm text-slate-500">{c.price_soles != null ? `S/ ${c.price_soles}` : "—"}</TableCell>
                  <TableCell className="text-sm text-slate-500">{c.payment_reference ?? "—"}</TableCell>
                  <TableCell className="text-sm text-slate-500 max-w-[160px] truncate">{c.notes ?? "—"}</TableCell>
                  <TableCell>
                    {c.redeemed_by ? (
                      <Badge variant="secondary">Canjeado</Badge>
                    ) : (
                      <Badge variant="outline">Disponible</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyCode(c.code)}
                      className="h-8 w-8 text-slate-400 hover:text-primary"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md light" style={{ colorScheme: "light" }}>
          <DialogHeader>
            <DialogTitle>Generar código de recarga</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label>Energía a otorgar *</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value === "" ? 0 : Number(e.target.value) })}
                min={1}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Precio cobrado (soles)</Label>
              <Input
                type="number"
                value={form.price_soles}
                onChange={(e) => setForm({ ...form, price_soles: e.target.value })}
                placeholder="5"
                min={0}
                step="0.01"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Referencia de pago</Label>
              <Input
                value={form.payment_reference}
                onChange={(e) => setForm({ ...form, payment_reference: e.target.value })}
                placeholder="N° de operación Yape"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Notas</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Nombre/teléfono del estudiante (opcional)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => create.mutate()}
              disabled={!form.amount || create.isPending}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {create.isPending ? "Generando..." : "Generar código"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWordSurvivorRecargas;
