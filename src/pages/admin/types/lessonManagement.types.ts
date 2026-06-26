// Types for the refactored lesson management system

export type ExtraUrl = {
  title: string;
  url: string;
  type: "web" | "pdf" | "iframe";
};

export type Modulo = {
  id: string;
  curso_id: string;
  titulo: string;
  slug: string;
  order_index: number;
  fecha_creacion: string;
};

export type Leccion = {
  id: string;
  curso_id: string;
  modulo_id: string | null;
  titulo: string;
  slug: string;
  descripcion: string | null;
  orden: number;
  order_index: number;
  video_url: string | null;
  youtube_url: string | null;
  pdf_url: string | null;
  extra_urls: ExtraUrl[] | null;
  contenido_html: string | null;
  modulo: string | null;
  es_preview: boolean;
};

export type Curso = {
  id: string;
  nivel: string;
  titulo: string;
  slug: string;
  descripcion: string | null;
  precio_mensual_soles: number | null;
  precio_unico_soles: number | null;
  imagen_url: string | null;
  activo: boolean;
};

// JSON Import/Export types
export type JsonLeccion = {
  titulo: string;
  slug: string;
  descripcion?: string;
  modulo?: string;
  order_index?: number;
  video_url?: string;
  youtube_url?: string;
  pdf_url?: string;
  extra_urls?: ExtraUrl[];
};

export type JsonModulo = {
  titulo: string;
  slug: string;
  order_index: number;
  lecciones: JsonLeccion[];
};

export type JsonCursoExport = {
  version: string;
  exported_at: string;
  curso: {
    slug: string;
    titulo: string;
    nivel: string;
    descripcion?: string;
  };
  modulos: JsonModulo[];
};

export type JsonImport = {
  version?: string;
  modulos?: JsonModulo[];
  lecciones?: JsonLeccion[]; // Legacy format support
};

export type ImportConflictResolution = "overwrite" | "duplicate" | "skip";

export type ImportPreviewItem = {
  type: "modulo" | "leccion";
  titulo: string;
  slug: string;
  moduloTitulo?: string;
  hasConflict: boolean;
  existingId?: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  preview: ImportPreviewItem[];
  modulos: JsonModulo[];
  legacyFormat: boolean;
};

// Form data types
export type LeccionFormData = {
  titulo: string;
  slug: string;
  descripcion: string;
  order_index: number;
  video_url: string;
  youtube_url: string;
  pdf_url: string;
  extra_urls: ExtraUrl[];
  contenido_html: string;
  modulo_id: string;
  es_preview: boolean;
};

export type ModuloFormData = {
  titulo: string;
  slug: string;
};
