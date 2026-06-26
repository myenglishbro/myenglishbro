import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ChevronLeft, Trophy, ClipboardCheck, User, Star,
  CheckCircle2, Clock, AlertCircle, Shuffle, AlignLeft, PenLine,
  FileText, ClipboardList, ListChecks, HelpCircle,
} from "lucide-react";

type ActivityType = "multiple_matching" | "fill_blanks" | "multiple_choice" | "writing" | "open_questions";

type Actividad = {
  id: string;
  titulo: string;
  tipo: ActivityType;
  puntaje_maximo: number;
  contenido: Record<string, unknown>;
};

type Entrega = {
  id: string;
  actividad_id: string;
  salon_id: string;
  estudiante_id: string;
  respuestas: Record<string, unknown>;
  puntaje_obtenido: number | null;
  comentario_docente: string | null;
  estado: "entregado" | "calificado";
  fecha_entrega: string;
  usuario: { nombre: string | null } | null;
};

type LeaderboardEntry = {
  estudiante_id: string;
  nombre: string | null;
  total: number;
  calificadas: number;
};

const TIPO_ICONS: Record<ActivityType, React.ElementType> = {
  multiple_matching: Shuffle,
  fill_blanks: AlignLeft,
  multiple_choice: ListChecks,
  writing: PenLine,
  open_questions: HelpCircle,
};

const TIPO_LABELS: Record<ActivityType, string> = {
  multiple_matching: "Multiple Matching",
  fill_blanks: "Fill in the Blanks",
  multiple_choice: "Multiple Choice",
  writing: "Writing",
  open_questions: "Preguntas Abiertas",
};

function renderRespuesta(actividad: Actividad, entrega: Entrega) {
  if (actividad.tipo === "writing") {
    const r = entrega.respuestas as { text?: string };
    return (
      <div className="bg-muted/40 rounded-md p-3 text-sm whitespace-pre-wrap">
        {r.text || "(Sin respuesta)"}
      </div>
    );
  }
  if (actividad.tipo === "multiple_matching") {
    const content = actividad.contenido as { pairs?: Array<{ id: string; left: string; right: string }> };
    const answers = entrega.respuestas as { matches?: Record<string, string> };
    const pairs = content.pairs || [];
    const matches = answers.matches || {};
    return (
      <div className="space-y-2">
        {pairs.map((pair) => {
          const selectedId = matches[pair.id];
          const selectedPair = pairs.find((p) => p.id === selectedId);
          const correct = selectedId === pair.id;
          return (
            <div key={pair.id} className={`flex items-center gap-3 p-2 rounded text-sm ${correct ? "bg-green-50" : "bg-red-50"}`}>
              <span className="font-medium w-1/3">{pair.left}</span>
              <span className="text-muted-foreground">→</span>
              <span className={`flex-1 ${correct ? "text-green-700" : "text-red-700"}`}>
                {selectedPair ? selectedPair.right : "(Sin respuesta)"}
              </span>
              {correct
                ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                : <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />}
            </div>
          );
        })}
      </div>
    );
  }
  if (actividad.tipo === "fill_blanks") {
    const content = actividad.contenido as {
      template?: string;
      blanks?: Array<{ id: string; answer: string }>;
    };
    const answers = entrega.respuestas as { answers?: Record<string, string> };
    const blanks = content.blanks || [];
    const studentAnswers = answers.answers || {};
    return (
      <div className="space-y-2">
        {blanks.map((blank, i) => {
          const studentAnswer = studentAnswers[blank.id] || "";
          const correct = studentAnswer.trim().toLowerCase() === blank.answer.trim().toLowerCase();
          return (
            <div key={blank.id} className={`flex items-center gap-3 p-2 rounded text-sm ${correct ? "bg-green-50" : "bg-red-50"}`}>
              <span className="text-muted-foreground w-5 text-xs">#{i + 1}</span>
              <span className={`flex-1 font-medium ${correct ? "text-green-700" : "text-red-700"}`}>
                {studentAnswer || "(Sin respuesta)"}
              </span>
              <span className="text-xs text-muted-foreground">Correcta: {blank.answer}</span>
              {correct
                ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                : <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />}
            </div>
          );
        })}
      </div>
    );
  }
  if (actividad.tipo === "multiple_choice") {
    const content = actividad.contenido as { questions?: Array<{ id: string; question: string; options: string[]; correctIndex: number }> };
    const answers = entrega.respuestas as { answers?: Record<string, number> };
    const questions = content.questions || [];
    const studentAnswers = answers.answers || {};
    return (
      <div className="space-y-3">
        {questions.map((q, i) => {
          const selectedIndex = studentAnswers[q.id];
          const correct = selectedIndex === q.correctIndex;
          return (
            <div key={q.id} className={`p-2 rounded text-sm ${correct ? "bg-green-50" : "bg-red-50"}`}>
              <p className="font-medium mb-1">{i + 1}. {q.question}</p>
              <div className="flex items-center gap-2">
                <span className={`flex-1 ${correct ? "text-green-700" : "text-red-700"}`}>
                  {selectedIndex !== undefined ? q.options[selectedIndex] : "(Sin respuesta)"}
                </span>
                {correct
                  ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  : <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />}
              </div>
              {!correct && <p className="text-xs text-muted-foreground mt-0.5">Correcta: {q.options[q.correctIndex]}</p>}
            </div>
          );
        })}
      </div>
    );
  }
  if (actividad.tipo === "open_questions") {
    const content = actividad.contenido as { questions?: Array<{ id: string; question: string }> };
    const answers = entrega.respuestas as { answers?: Record<string, string> };
    const questions = content.questions || [];
    const studentAnswers = answers.answers || {};
    return (
      <div className="space-y-3">
        {questions.map((q, i) => (
          <div key={q.id}>
            <p className="text-sm font-medium mb-1">{i + 1}. {q.question}</p>
            <div className="bg-muted/40 rounded-md p-3 text-sm whitespace-pre-wrap">
              {studentAnswers[q.id] || "(Sin respuesta)"}
            </div>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

const TeacherCalificaciones = () => {
  const { salonId } = useParams<{ salonId: string }>();
  const queryClient = useQueryClient();

  const [selectedEntrega, setSelectedEntrega] = useState<Entrega | null>(null);
  const [selectedActividad, setSelectedActividad] = useState<Actividad | null>(null);
  const [gradeForm, setGradeForm] = useState({ puntaje: "", comentario: "" });

  const { data: salon } = useQuery({
    queryKey: ["teacher-salon-name", salonId],
    queryFn: async () => {
      const { data, error } = await supabase.from("salones").select("id, nombre").eq("id", salonId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!salonId,
  });

  const { data: actividades = [] } = useQuery({
    queryKey: ["salon-actividades", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salon_actividades")
        .select("id, titulo, tipo, puntaje_maximo, contenido")
        .eq("salon_id", salonId!)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as Actividad[];
    },
    enabled: !!salonId,
  });

  const { data: entregas = [] } = useQuery({
    queryKey: ["salon-entregas-teacher", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salon_entregas")
        .select("id, actividad_id, salon_id, estudiante_id, respuestas, puntaje_obtenido, comentario_docente, estado, fecha_entrega, usuarios(nombre)")
        .eq("salon_id", salonId!);
      if (error) throw error;
      return (data || []).map((row) => ({
        ...row,
        usuario: row.usuarios as { nombre: string | null } | null,
      })) as Entrega[];
    },
    enabled: !!salonId,
  });

  const { data: estudiantes = [] } = useQuery({
    queryKey: ["salon-estudiantes-list", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salon_estudiantes")
        .select("usuario_id, usuarios(nombre)")
        .eq("salon_id", salonId!);
      if (error) throw error;
      return (data || []).map((row) => ({
        usuario_id: row.usuario_id,
        usuario: row.usuarios as { nombre: string | null } | null,
      }));
    },
    enabled: !!salonId,
  });

  const gradeMutation = useMutation({
    mutationFn: async ({ id, puntaje, comentario }: { id: string; puntaje: number; comentario: string }) => {
      const { error } = await supabase
        .from("salon_entregas")
        .update({
          puntaje_obtenido: puntaje,
          comentario_docente: comentario || null,
          estado: "calificado",
          fecha_calificacion: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salon-entregas-teacher", salonId] });
      toast.success("Calificación guardada");
      setSelectedEntrega(null);
    },
    onError: () => toast.error("Error al guardar la calificación"),
  });

  function openGradeDialog(entrega: Entrega, actividad: Actividad) {
    setSelectedEntrega(entrega);
    setSelectedActividad(actividad);
    setGradeForm({
      puntaje: entrega.puntaje_obtenido?.toString() ?? "",
      comentario: entrega.comentario_docente ?? "",
    });
  }

  function handleGrade() {
    if (!selectedEntrega || !selectedActividad) return;
    const puntaje = parseInt(gradeForm.puntaje);
    if (isNaN(puntaje) || puntaje < 0 || puntaje > selectedActividad.puntaje_maximo) {
      toast.error(`El puntaje debe estar entre 0 y ${selectedActividad.puntaje_maximo}`);
      return;
    }
    gradeMutation.mutate({ id: selectedEntrega.id, puntaje, comentario: gradeForm.comentario });
  }

  // Leaderboard: sum calificado scores per student
  const leaderboard: LeaderboardEntry[] = estudiantes.map(({ usuario_id, usuario }) => {
    const mine = entregas.filter((e) => e.estudiante_id === usuario_id && e.estado === "calificado");
    return {
      estudiante_id: usuario_id,
      nombre: usuario?.nombre ?? null,
      total: mine.reduce((s, e) => s + (e.puntaje_obtenido ?? 0), 0),
      calificadas: mine.length,
    };
  }).sort((a, b) => b.total - a.total);

  const pendingCount = entregas.filter((e) => e.estado === "entregado" && actividades.find((a) => a.id === e.actividad_id && (a.tipo === "writing" || a.tipo === "open_questions"))).length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/teacher/salon/${salonId}`}>
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver al salón
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            Calificaciones
          </h1>
          {salon && <p className="text-sm text-muted-foreground mt-1">{salon.nombre}</p>}
        </div>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="text-sm px-3 py-1">
            {pendingCount} por corregir
          </Badge>
        )}
      </div>

      {/* Sub-navigation */}
      <div className="flex gap-2 mb-6 border-b pb-3">
        <Link to={`/teacher/salon/${salonId}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            Contenido
          </Button>
        </Link>
        <Link to={`/teacher/actividades/${salonId}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Actividades
          </Button>
        </Link>
        <Link to={`/teacher/calificaciones/${salonId}`}>
          <Button variant="secondary" size="sm" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Calificaciones
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="actividades">
        <TabsList className="mb-6">
          <TabsTrigger value="actividades">Por Actividad</TabsTrigger>
          <TabsTrigger value="leaderboard">
            <Trophy className="h-4 w-4 mr-1" />
            Ranking del Salón
          </TabsTrigger>
        </TabsList>

        {/* PER-ACTIVITY VIEW */}
        <TabsContent value="actividades" className="space-y-6">
          {actividades.length === 0 && (
            <p className="text-muted-foreground text-sm">No hay actividades en este salón.</p>
          )}
          {actividades.map((actividad) => {
            const actEntregas = entregas.filter((e) => e.actividad_id === actividad.id);
            const Icon = TIPO_ICONS[actividad.tipo];
            const pending = actEntregas.filter((e) => e.estado === "entregado").length;
            return (
              <Card key={actividad.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{actividad.titulo}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {TIPO_LABELS[actividad.tipo]} · Máx. {actividad.puntaje_maximo} pts
                      </p>
                    </div>
                    {pending > 0 && (
                      <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                        <Clock className="h-3 w-3 mr-1" />
                        {pending} pendiente{pending > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {actEntregas.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Ningún estudiante ha entregado aún.</p>
                  ) : (
                    <div className="divide-y">
                      {actEntregas.map((entrega) => (
                        <div key={entrega.id} className="py-3 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {entrega.usuario?.nombre || "Estudiante"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(entrega.fecha_entrega).toLocaleDateString("es-PE", {
                                day: "2-digit", month: "short", year: "numeric",
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {entrega.estado === "calificado" ? (
                              <span className="text-sm font-bold text-primary">
                                {entrega.puntaje_obtenido}/{actividad.puntaje_maximo}
                              </span>
                            ) : (
                              <Badge variant="outline" className="text-amber-600 text-xs">
                                Pendiente
                              </Badge>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openGradeDialog(entrega, actividad)}
                            >
                              {entrega.estado === "calificado" ? "Ver / Editar" : "Calificar"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* LEADERBOARD VIEW */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Top del salón
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay datos de calificaciones aún.</p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, i) => (
                    <div
                      key={entry.estudiante_id}
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        i === 0 ? "bg-amber-50 border border-amber-200" :
                        i === 1 ? "bg-slate-50 border border-slate-200" :
                        i === 2 ? "bg-orange-50 border border-orange-200" :
                        "bg-muted/30"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        i === 0 ? "bg-amber-400 text-white" :
                        i === 1 ? "bg-slate-400 text-white" :
                        i === 2 ? "bg-orange-400 text-white" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {i + 1}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {entry.nombre || "Estudiante"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.calificadas} actividad{entry.calificadas !== 1 ? "es" : ""} calificada{entry.calificadas !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-primary">{entry.total} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Grade dialog */}
      <Dialog open={!!selectedEntrega} onOpenChange={(open) => !open && setSelectedEntrega(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedActividad?.tipo === "writing" || selectedActividad?.tipo === "open_questions" ? "Corregir respuesta" : "Ver entrega"} —{" "}
              {selectedEntrega?.usuario?.nombre || "Estudiante"}
            </DialogTitle>
          </DialogHeader>
          {selectedEntrega && selectedActividad && (
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Respuesta del estudiante</Label>
                {renderRespuesta(selectedActividad, selectedEntrega)}
              </div>
              <div className="border-t pt-4 space-y-3">
                <div>
                  <Label>
                    Puntaje * (máx. {selectedActividad.puntaje_maximo})
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={selectedActividad.puntaje_maximo}
                    value={gradeForm.puntaje}
                    onChange={(e) => setGradeForm((f) => ({ ...f, puntaje: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Comentario (opcional)</Label>
                  <Textarea
                    value={gradeForm.comentario}
                    onChange={(e) => setGradeForm((f) => ({ ...f, comentario: e.target.value }))}
                    placeholder="Retroalimentación para el estudiante..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedEntrega(null)}>Cancelar</Button>
                  <Button onClick={handleGrade} disabled={gradeMutation.isPending}>
                    {gradeMutation.isPending ? "Guardando..." : "Guardar calificación"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherCalificaciones;
