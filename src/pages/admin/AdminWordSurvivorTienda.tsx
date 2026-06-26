import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ShoppingBag } from "lucide-react";

const CATEGORIES = ["avatar", "title", "frame", "voucher"] as const;
const RARITIES = ["common", "rare", "epic", "legendary"] as const;

const CATEGORY_LABEL: Record<string, string> = {
  avatar: "Avatar",
  title: "Título",
  frame: "Marco",
  voucher: "Ticket de descuento",
};

const VALUE_HINT: Record<string, string> = {
  avatar: "El emoji que se muestra como avatar, ej: 🦊",
  title: "El texto del título, ej: Word Wizard",
  frame: "Clases de Tailwind para el marco, ej: ring-2 ring-rose-400",
  voucher: "El monto/descripción corta en la tarjeta, ej: S/ 30",
};

interface ShopItemRow {
  item_id: string;
  category: string;
  value: string;
  label: string;
  description: string | null;
  price: number;
  rarity: string;
}

type FormState = {
  item_id: string;
  category: string;
  value: string;
  label: string;
  description: string;
  price: number;
  rarity: string;
};

const EMPTY: FormState = {
  item_id: "",
  category: "voucher",
  value: "",
  label: "",
  description: "",
  price: 100,
  rarity: "common",
};

const AdminWordSurvivorTienda = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ShopItemRow | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-word-survivor-shop-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("word_survivor_shop_items")
        .select("*")
        .order("category")
        .order("price");
      if (error) throw error;
      return data as ShopItemRow[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        category: form.category,
        value: form.value.trim(),
        label: form.label.trim(),
        description: form.description.trim() || null,
        price: Number(form.price) || 0,
        rarity: form.rarity,
      };
      if (editing) {
        const { error } = await supabase
          .from("word_survivor_shop_items")
          .update(payload)
          .eq("item_id", editing.item_id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("word_survivor_shop_items")
          .insert({ item_id: form.item_id.trim(), ...payload });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-word-survivor-shop-items"] });
      qc.invalidateQueries({ queryKey: ["word-survivor-shop-items"] });
      toast.success(editing ? "Elemento actualizado" : "Elemento creado");
      setOpen(false);
    },
    onError: () => toast.error("Error al guardar (¿ID duplicado o datos inválidos?)"),
  });

  const remove = useMutation({
    mutationFn: async (item_id: string) => {
      const { error } = await supabase.from("word_survivor_shop_items").delete().eq("item_id", item_id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-word-survivor-shop-items"] });
      qc.invalidateQueries({ queryKey: ["word-survivor-shop-items"] });
      toast.success("Elemento eliminado");
    },
    onError: () => toast.error("No se pudo eliminar (¿ya fue comprado por algún estudiante?)"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (item: ShopItemRow) => {
    setEditing(item);
    setForm({
      item_id: item.item_id,
      category: item.category,
      value: item.value,
      label: item.label,
      description: item.description ?? "",
      price: item.price,
      rarity: item.rarity,
    });
    setOpen(true);
  };

  const set = (field: keyof FormState, value: string | number) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="p-8 light" style={{ colorScheme: "light" }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-display flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Tienda de Word Survivor
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Avatares, títulos, marcos y tickets de descuento que los estudiantes compran con monedas.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white rounded-xl gap-2">
          <Plus className="h-4 w-4" />
          Nuevo elemento
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="dashboard-card p-16 text-center">
          <ShoppingBag className="h-10 w-10 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-medium mb-1">No hay elementos aún</p>
          <p className="text-slate-400 text-sm">Crea el primero con el botón de arriba.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <div key={item.item_id} className="dashboard-card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-lg font-bold text-slate-500 overflow-hidden text-center px-1">
                {item.category === "avatar" ? item.value : item.category === "voucher" ? "🎟️" : item.category === "frame" ? "🖼️" : "🏷️"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p className="font-semibold text-slate-800 text-sm truncate">{item.label}</p>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 shrink-0">
                    {CATEGORY_LABEL[item.category] ?? item.category}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-600 shrink-0 capitalize">
                    {item.rarity}
                  </span>
                </div>
                {item.description && <p className="text-xs text-slate-500 truncate">{item.description}</p>}
              </div>
              <div className="text-sm font-bold text-amber-600 shrink-0">🪙 {item.price}</div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => openEdit(item)}
                  className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/5"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    if (confirm(`¿Eliminar "${item.label}"?`)) remove.mutate(item.item_id);
                  }}
                  className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/5"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg light" style={{ colorScheme: "light" }}>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar elemento" : "Nuevo elemento"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label>ID único *</Label>
              <Input
                value={form.item_id}
                onChange={(e) => set("item_id", e.target.value)}
                placeholder="ej: voucher_s30"
                disabled={!!editing}
              />
              {!editing && <p className="text-xs text-slate-400">No se puede cambiar después. Usa minúsculas y guiones bajos.</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Categoría *</Label>
                <Select value={form.category} onValueChange={(v) => set("category", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CATEGORY_LABEL[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Rareza *</Label>
                <Select value={form.rarity} onValueChange={(v) => set("rarity", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RARITIES.map((r) => (
                      <SelectItem key={r} value={r} className="capitalize">
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input
                value={form.label}
                onChange={(e) => set("label", e.target.value)}
                placeholder="ej: Ticket S/30 de descuento"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Valor *</Label>
              <Input value={form.value} onChange={(e) => set("value", e.target.value)} />
              <p className="text-xs text-slate-400">{VALUE_HINT[form.category]}</p>
            </div>

            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={2}
                placeholder="Opcional"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Precio (monedas) *</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => set("price", e.target.value === "" ? 0 : Number(e.target.value))}
                min={0}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => save.mutate()}
              disabled={!form.item_id.trim() || !form.label.trim() || !form.value.trim() || save.isPending}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {save.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWordSurvivorTienda;
