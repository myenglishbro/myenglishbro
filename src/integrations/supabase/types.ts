export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          activo: boolean | null
          created_at: string | null
          descripcion: string | null
          id: string
          imagen_url: string | null
          link_url: string | null
          orden: number | null
          preview_url: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          link_url?: string | null
          orden?: number | null
          preview_url?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          link_url?: string | null
          orden?: number | null
          preview_url?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      curso_actividad_progreso: {
        Row: {
          actividad_id: string
          completado: boolean
          correctas: number | null
          fecha_completado: string
          id: string
          respuestas: Json
          total: number | null
          usuario_id: string
        }
        Insert: {
          actividad_id: string
          completado?: boolean
          correctas?: number | null
          fecha_completado?: string
          id?: string
          respuestas?: Json
          total?: number | null
          usuario_id: string
        }
        Update: {
          actividad_id?: string
          completado?: boolean
          correctas?: number | null
          fecha_completado?: string
          id?: string
          respuestas?: Json
          total?: number | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "curso_actividad_progreso_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "curso_actividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curso_actividad_progreso_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      curso_actividades: {
        Row: {
          activo: boolean
          contenido: Json
          fecha_creacion: string
          id: string
          instrucciones: string | null
          leccion_id: string
          order_index: number
          tipo: Database["public"]["Enums"]["activity_type"]
          titulo: string
        }
        Insert: {
          activo?: boolean
          contenido?: Json
          fecha_creacion?: string
          id?: string
          instrucciones?: string | null
          leccion_id: string
          order_index?: number
          tipo: Database["public"]["Enums"]["activity_type"]
          titulo: string
        }
        Update: {
          activo?: boolean
          contenido?: Json
          fecha_creacion?: string
          id?: string
          instrucciones?: string | null
          leccion_id?: string
          order_index?: number
          tipo?: Database["public"]["Enums"]["activity_type"]
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "curso_actividades_leccion_id_fkey"
            columns: ["leccion_id"]
            isOneToOne: false
            referencedRelation: "lecciones"
            referencedColumns: ["id"]
          },
        ]
      }
      cursos: {
        Row: {
          activo: boolean
          descripcion: string | null
          duracion_total: string | null
          estudiantes_count: number | null
          fecha_creacion: string
          id: string
          imagen_url: string | null
          instructor: string | null
          learning_outcomes: Json | null
          nivel: string
          precio_mensual_soles: number | null
          precio_unico_soles: number | null
          precio_usd: number | null
          rating: number | null
          slug: string
          stripe_price_id: string | null
          titulo: string
        }
        Insert: {
          activo?: boolean
          descripcion?: string | null
          duracion_total?: string | null
          estudiantes_count?: number | null
          fecha_creacion?: string
          id?: string
          imagen_url?: string | null
          instructor?: string | null
          learning_outcomes?: Json | null
          nivel: string
          precio_mensual_soles?: number | null
          precio_unico_soles?: number | null
          precio_usd?: number | null
          rating?: number | null
          slug: string
          stripe_price_id?: string | null
          titulo: string
        }
        Update: {
          activo?: boolean
          descripcion?: string | null
          duracion_total?: string | null
          estudiantes_count?: number | null
          fecha_creacion?: string
          id?: string
          imagen_url?: string | null
          instructor?: string | null
          learning_outcomes?: Json | null
          nivel?: string
          precio_mensual_soles?: number | null
          precio_unico_soles?: number | null
          precio_usd?: number | null
          rating?: number | null
          slug?: string
          stripe_price_id?: string | null
          titulo?: string
        }
        Relationships: []
      }
      lecciones: {
        Row: {
          contenido_html: string | null
          curso_id: string
          descripcion: string | null
          es_preview: boolean
          extra_urls: Json | null
          fecha_creacion: string
          id: string
          modulo: string | null
          modulo_id: string | null
          orden: number
          order_index: number
          pdf_url: string | null
          slug: string
          titulo: string
          video_url: string | null
          youtube_url: string | null
        }
        Insert: {
          contenido_html?: string | null
          curso_id: string
          descripcion?: string | null
          es_preview?: boolean
          extra_urls?: Json | null
          fecha_creacion?: string
          id?: string
          modulo?: string | null
          modulo_id?: string | null
          orden?: number
          order_index?: number
          pdf_url?: string | null
          slug: string
          titulo: string
          video_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          contenido_html?: string | null
          curso_id?: string
          descripcion?: string | null
          es_preview?: boolean
          extra_urls?: Json | null
          fecha_creacion?: string
          id?: string
          modulo?: string | null
          modulo_id?: string | null
          orden?: number
          order_index?: number
          pdf_url?: string | null
          slug?: string
          titulo?: string
          video_url?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lecciones_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lecciones_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      lecciones_publicas: {
        Row: {
          categoria: string
          contenido_html: string | null
          created_at: string
          descripcion: string | null
          id: string
          imagen_url: string | null
          nivel: string
          publicado: boolean
          slug: string
          titulo: string
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          categoria?: string
          contenido_html?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          nivel?: string
          publicado?: boolean
          slug: string
          titulo: string
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          categoria?: string
          contenido_html?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          nivel?: string
          publicado?: boolean
          slug?: string
          titulo?: string
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      matriculas: {
        Row: {
          curso_id: string
          estado: string
          fecha_creacion: string
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          metodo_pago: string | null
          pago_id: string | null
          tipo_pago: string | null
          usuario_id: string
        }
        Insert: {
          curso_id: string
          estado?: string
          fecha_creacion?: string
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          metodo_pago?: string | null
          pago_id?: string | null
          tipo_pago?: string | null
          usuario_id: string
        }
        Update: {
          curso_id?: string
          estado?: string
          fecha_creacion?: string
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          metodo_pago?: string | null
          pago_id?: string | null
          tipo_pago?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matriculas_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matriculas_pago_id_fkey"
            columns: ["pago_id"]
            isOneToOne: false
            referencedRelation: "pagos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matriculas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      mb_disponibilidad_horario: {
        Row: {
          dia_semana: number
          disponible: boolean
          etiqueta: string | null
          hora_inicio: number
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          dia_semana: number
          disponible?: boolean
          etiqueta?: string | null
          hora_inicio: number
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          dia_semana?: number
          disponible?: boolean
          etiqueta?: string | null
          hora_inicio?: number
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      modulos: {
        Row: {
          curso_id: string
          fecha_creacion: string
          id: string
          order_index: number
          slug: string
          titulo: string
        }
        Insert: {
          curso_id: string
          fecha_creacion?: string
          id?: string
          order_index?: number
          slug: string
          titulo: string
        }
        Update: {
          curso_id?: string
          fecha_creacion?: string
          id?: string
          order_index?: number
          slug?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "modulos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos: {
        Row: {
          curso_id: string | null
          estado: string
          fecha: string
          id: string
          moneda: string
          monto: number
          paypal_capture_id: string | null
          paypal_order_id: string | null
          raw_payload: Json | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          usuario_id: string
        }
        Insert: {
          curso_id?: string | null
          estado?: string
          fecha?: string
          id?: string
          moneda?: string
          monto: number
          paypal_capture_id?: string | null
          paypal_order_id?: string | null
          raw_payload?: Json | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          usuario_id: string
        }
        Update: {
          curso_id?: string | null
          estado?: string
          fecha?: string
          id?: string
          moneda?: string
          monto?: number
          paypal_capture_id?: string | null
          paypal_order_id?: string | null
          raw_payload?: Json | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pagos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      programas_en_vivo: {
        Row: {
          descripcion: string | null
          descripcion_completa: string | null
          dias_clase: string
          duracion_meses: number
          estado_inscripcion: string
          fecha_creacion: string
          fecha_inicio: string
          horario: string
          id: string
          imagen_promocional_url: string | null
          imagen_url: string | null
          incluye_plataforma: boolean
          max_estudiantes: number
          min_estudiantes: number
          nivel: string
          nombre: string
          precio_mensual: number
          requisito_nivel: string | null
          slug: string
          syllabus: Json | null
          whatsapp_url: string | null
        }
        Insert: {
          descripcion?: string | null
          descripcion_completa?: string | null
          dias_clase: string
          duracion_meses?: number
          estado_inscripcion?: string
          fecha_creacion?: string
          fecha_inicio: string
          horario: string
          id?: string
          imagen_promocional_url?: string | null
          imagen_url?: string | null
          incluye_plataforma?: boolean
          max_estudiantes?: number
          min_estudiantes?: number
          nivel: string
          nombre: string
          precio_mensual: number
          requisito_nivel?: string | null
          slug: string
          syllabus?: Json | null
          whatsapp_url?: string | null
        }
        Update: {
          descripcion?: string | null
          descripcion_completa?: string | null
          dias_clase?: string
          duracion_meses?: number
          estado_inscripcion?: string
          fecha_creacion?: string
          fecha_inicio?: string
          horario?: string
          id?: string
          imagen_promocional_url?: string | null
          imagen_url?: string | null
          incluye_plataforma?: boolean
          max_estudiantes?: number
          min_estudiantes?: number
          nivel?: string
          nombre?: string
          precio_mensual?: number
          requisito_nivel?: string | null
          slug?: string
          syllabus?: Json | null
          whatsapp_url?: string | null
        }
        Relationships: []
      }
      progreso_lecciones: {
        Row: {
          completado: boolean
          completed_at: string | null
          id: string
          leccion_id: string
          updated_at: string
          usuario_id: string
        }
        Insert: {
          completado?: boolean
          completed_at?: string | null
          id?: string
          leccion_id: string
          updated_at?: string
          usuario_id: string
        }
        Update: {
          completado?: boolean
          completed_at?: string | null
          id?: string
          leccion_id?: string
          updated_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progreso_lecciones_leccion_id_fkey"
            columns: ["leccion_id"]
            isOneToOne: false
            referencedRelation: "lecciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progreso_lecciones_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      recursos: {
        Row: {
          archivo_url: string
          categoria: string
          curso_id: string | null
          descripcion: string | null
          extra_urls: Json | null
          fecha_creacion: string
          id: string
          tipo: string
          titulo: string
        }
        Insert: {
          archivo_url: string
          categoria: string
          curso_id?: string | null
          descripcion?: string | null
          extra_urls?: Json | null
          fecha_creacion?: string
          id?: string
          tipo: string
          titulo: string
        }
        Update: {
          archivo_url?: string
          categoria?: string
          curso_id?: string | null
          descripcion?: string | null
          extra_urls?: Json | null
          fecha_creacion?: string
          id?: string
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "recursos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      salon_actividades: {
        Row: {
          activo: boolean
          contenido: Json
          fecha_creacion: string | null
          id: string
          instrucciones: string | null
          order_index: number
          puntaje_maximo: number
          salon_id: string
          tipo: Database["public"]["Enums"]["activity_type"]
          titulo: string
        }
        Insert: {
          activo?: boolean
          contenido?: Json
          fecha_creacion?: string | null
          id?: string
          instrucciones?: string | null
          order_index?: number
          puntaje_maximo?: number
          salon_id: string
          tipo: Database["public"]["Enums"]["activity_type"]
          titulo: string
        }
        Update: {
          activo?: boolean
          contenido?: Json
          fecha_creacion?: string | null
          id?: string
          instrucciones?: string | null
          order_index?: number
          puntaje_maximo?: number
          salon_id?: string
          tipo?: Database["public"]["Enums"]["activity_type"]
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "salon_actividades_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salones"
            referencedColumns: ["id"]
          },
        ]
      }
      salon_entregas: {
        Row: {
          actividad_id: string
          comentario_docente: string | null
          estado: Database["public"]["Enums"]["entrega_estado"]
          estudiante_id: string
          fecha_calificacion: string | null
          fecha_entrega: string | null
          id: string
          puntaje_obtenido: number | null
          respuestas: Json
          salon_id: string
        }
        Insert: {
          actividad_id: string
          comentario_docente?: string | null
          estado?: Database["public"]["Enums"]["entrega_estado"]
          estudiante_id: string
          fecha_calificacion?: string | null
          fecha_entrega?: string | null
          id?: string
          puntaje_obtenido?: number | null
          respuestas?: Json
          salon_id: string
        }
        Update: {
          actividad_id?: string
          comentario_docente?: string | null
          estado?: Database["public"]["Enums"]["entrega_estado"]
          estudiante_id?: string
          fecha_calificacion?: string | null
          fecha_entrega?: string | null
          id?: string
          puntaje_obtenido?: number | null
          respuestas?: Json
          salon_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "salon_entregas_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "salon_actividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salon_entregas_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salon_entregas_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salones"
            referencedColumns: ["id"]
          },
        ]
      }
      salon_estudiantes: {
        Row: {
          fecha_asignacion: string
          id: string
          salon_id: string
          usuario_id: string
        }
        Insert: {
          fecha_asignacion?: string
          id?: string
          salon_id: string
          usuario_id: string
        }
        Update: {
          fecha_asignacion?: string
          id?: string
          salon_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "salon_estudiantes_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salon_estudiantes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      salon_lecciones: {
        Row: {
          contenido_html: string | null
          descripcion: string | null
          extra_urls: Json | null
          fecha_creacion: string
          id: string
          modulo_id: string | null
          order_index: number
          pdf_url: string | null
          salon_id: string
          titulo: string
          video_url: string | null
          youtube_url: string | null
        }
        Insert: {
          contenido_html?: string | null
          descripcion?: string | null
          extra_urls?: Json | null
          fecha_creacion?: string
          id?: string
          modulo_id?: string | null
          order_index?: number
          pdf_url?: string | null
          salon_id: string
          titulo: string
          video_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          contenido_html?: string | null
          descripcion?: string | null
          extra_urls?: Json | null
          fecha_creacion?: string
          id?: string
          modulo_id?: string | null
          order_index?: number
          pdf_url?: string | null
          salon_id?: string
          titulo?: string
          video_url?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salon_lecciones_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "salon_modulos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salon_lecciones_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salones"
            referencedColumns: ["id"]
          },
        ]
      }
      salon_modulos: {
        Row: {
          fecha_creacion: string
          id: string
          order_index: number
          salon_id: string
          titulo: string
        }
        Insert: {
          fecha_creacion?: string
          id?: string
          order_index?: number
          salon_id: string
          titulo: string
        }
        Update: {
          fecha_creacion?: string
          id?: string
          order_index?: number
          salon_id?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "salon_modulos_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salones"
            referencedColumns: ["id"]
          },
        ]
      }
      salones: {
        Row: {
          activo: boolean
          creado_por: string | null
          curso_id: string | null
          descripcion: string | null
          fecha_creacion: string
          id: string
          imagen_url: string | null
          nombre: string
          teacher_id: string | null
        }
        Insert: {
          activo?: boolean
          creado_por?: string | null
          curso_id?: string | null
          descripcion?: string | null
          fecha_creacion?: string
          id?: string
          imagen_url?: string | null
          nombre: string
          teacher_id?: string | null
        }
        Update: {
          activo?: boolean
          creado_por?: string | null
          curso_id?: string | null
          descripcion?: string | null
          fecha_creacion?: string
          id?: string
          imagen_url?: string | null
          nombre?: string
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salones_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salones_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salones_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      suscripcion_config: {
        Row: {
          id: boolean
          precio_soles: number
          precio_usd: number
        }
        Insert: {
          id?: boolean
          precio_soles: number
          precio_usd: number
        }
        Update: {
          id?: boolean
          precio_soles?: number
          precio_usd?: number
        }
        Relationships: []
      }
      suscripciones: {
        Row: {
          estado: string
          fecha_creacion: string
          fecha_fin: string
          fecha_inicio: string
          id: string
          metodo_pago: string | null
          pago_id: string | null
          usuario_id: string
        }
        Insert: {
          estado?: string
          fecha_creacion?: string
          fecha_fin: string
          fecha_inicio?: string
          id?: string
          metodo_pago?: string | null
          pago_id?: string | null
          usuario_id: string
        }
        Update: {
          estado?: string
          fecha_creacion?: string
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          metodo_pago?: string | null
          pago_id?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suscripciones_pago_id_fkey"
            columns: ["pago_id"]
            isOneToOne: false
            referencedRelation: "pagos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suscripciones_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          email: string
          fecha_creacion: string
          id: string
          nombre: string | null
          stripe_customer_id: string | null
          telefono: string | null
        }
        Insert: {
          email: string
          fecha_creacion?: string
          id: string
          nombre?: string | null
          stripe_customer_id?: string | null
          telefono?: string | null
        }
        Update: {
          email?: string
          fecha_creacion?: string
          id?: string
          nombre?: string | null
          stripe_customer_id?: string | null
          telefono?: string | null
        }
        Relationships: []
      }
      word_survivor_inventory: {
        Row: {
          acquired_at: string
          id: string
          item_id: string
          redemption_code: string | null
          usuario_id: string
        }
        Insert: {
          acquired_at?: string
          id?: string
          item_id: string
          redemption_code?: string | null
          usuario_id: string
        }
        Update: {
          acquired_at?: string
          id?: string
          item_id?: string
          redemption_code?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "word_survivor_inventory_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "word_survivor_shop_items"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "word_survivor_inventory_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      word_survivor_progress: {
        Row: {
          created_at: string
          id: string
          last_seen_at: string | null
          mastery_score: number
          mastery_stage: string
          term_id: string
          times_correct: number
          times_seen: number
          usuario_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_seen_at?: string | null
          mastery_score?: number
          mastery_stage?: string
          term_id: string
          times_correct?: number
          times_seen?: number
          usuario_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_seen_at?: string | null
          mastery_score?: number
          mastery_stage?: string
          term_id?: string
          times_correct?: number
          times_seen?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "word_survivor_progress_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "word_survivor_terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "word_survivor_progress_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      word_survivor_questions: {
        Row: {
          accepted_answers: string[] | null
          active: boolean
          audio_url: string | null
          correct_index: number | null
          created_at: string
          created_by: string | null
          difficulty: number
          format: string
          id: string
          key_word: string | null
          level: string
          node_index: number | null
          options: Json | null
          prompt: string
          tags: string[]
          term_id: string
          tip: string | null
          transform_prompt: string | null
          type: string
          updated_at: string
        }
        Insert: {
          accepted_answers?: string[] | null
          active?: boolean
          audio_url?: string | null
          correct_index?: number | null
          created_at?: string
          created_by?: string | null
          difficulty?: number
          format?: string
          id?: string
          key_word?: string | null
          level: string
          node_index?: number | null
          options?: Json | null
          prompt: string
          tags?: string[]
          term_id: string
          tip?: string | null
          transform_prompt?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          accepted_answers?: string[] | null
          active?: boolean
          audio_url?: string | null
          correct_index?: number | null
          created_at?: string
          created_by?: string | null
          difficulty?: number
          format?: string
          id?: string
          key_word?: string | null
          level?: string
          node_index?: number | null
          options?: Json | null
          prompt?: string
          tags?: string[]
          term_id?: string
          tip?: string | null
          transform_prompt?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "word_survivor_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "word_survivor_questions_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "word_survivor_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      word_survivor_recharge_codes: {
        Row: {
          amount: number
          code: string
          created_at: string
          created_by: string | null
          currency_type: string
          id: string
          notes: string | null
          payment_reference: string | null
          price_soles: number | null
          redeemed_at: string | null
          redeemed_by: string | null
        }
        Insert: {
          amount: number
          code: string
          created_at?: string
          created_by?: string | null
          currency_type?: string
          id?: string
          notes?: string | null
          payment_reference?: string | null
          price_soles?: number | null
          redeemed_at?: string | null
          redeemed_by?: string | null
        }
        Update: {
          amount?: number
          code?: string
          created_at?: string
          created_by?: string | null
          currency_type?: string
          id?: string
          notes?: string | null
          payment_reference?: string | null
          price_soles?: number | null
          redeemed_at?: string | null
          redeemed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "word_survivor_recharge_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "word_survivor_recharge_codes_redeemed_by_fkey"
            columns: ["redeemed_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      word_survivor_region_progress: {
        Row: {
          cleared_regions: string[]
          updated_at: string
          usuario_id: string
        }
        Insert: {
          cleared_regions?: string[]
          updated_at?: string
          usuario_id: string
        }
        Update: {
          cleared_regions?: string[]
          updated_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "word_survivor_region_progress_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      word_survivor_shop_items: {
        Row: {
          category: string
          description: string | null
          item_id: string
          label: string
          price: number
          rarity: string
          value: string
        }
        Insert: {
          category: string
          description?: string | null
          item_id: string
          label: string
          price: number
          rarity: string
          value: string
        }
        Update: {
          category?: string
          description?: string | null
          item_id?: string
          label?: string
          price?: number
          rarity?: string
          value?: string
        }
        Relationships: []
      }
      word_survivor_terms: {
        Row: {
          created_at: string
          example_sentence: string | null
          id: string
          level: string
          meaning: string
          term: string
          type: string
        }
        Insert: {
          created_at?: string
          example_sentence?: string | null
          id?: string
          level: string
          meaning: string
          term: string
          type: string
        }
        Update: {
          created_at?: string
          example_sentence?: string | null
          id?: string
          level?: string
          meaning?: string
          term?: string
          type?: string
        }
        Relationships: []
      }
      word_survivor_wallet: {
        Row: {
          coins: number
          display_name: string | null
          energy: number
          energy_max: number
          energy_updated_at: string
          equipped_avatar: string | null
          equipped_frame: string | null
          equipped_title: string | null
          updated_at: string
          usuario_id: string
        }
        Insert: {
          coins?: number
          display_name?: string | null
          energy?: number
          energy_max?: number
          energy_updated_at?: string
          equipped_avatar?: string | null
          equipped_frame?: string | null
          equipped_title?: string | null
          updated_at?: string
          usuario_id: string
        }
        Update: {
          coins?: number
          display_name?: string | null
          energy?: number
          energy_max?: number
          energy_updated_at?: string
          equipped_avatar?: string | null
          equipped_frame?: string | null
          equipped_title?: string | null
          updated_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "word_survivor_wallet_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_set_user_password: {
        Args: { new_password: string; target_user_id: string }
        Returns: undefined
      }
      clear_word_survivor_region: {
        Args: { p_level: string }
        Returns: undefined
      }
      deposit_word_survivor_coins: {
        Args: { p_amount: number }
        Returns: undefined
      }
      equip_word_survivor_item: {
        Args: { p_category: string; p_item_id: string }
        Returns: undefined
      }
      exchange_word_survivor_coins_for_energy: {
        Args: { p_coin_cost: number; p_energy_amount: number }
        Returns: Json
      }
      generate_slug: { Args: { title: string }; Returns: string }
      has_active_enrollment: {
        Args: { _curso_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      purchase_word_survivor_item: {
        Args: { p_item_id: string }
        Returns: Json
      }
      record_word_progress: {
        Args: { p_correct: boolean; p_term_id: string }
        Returns: undefined
      }
      redeem_word_survivor_code: { Args: { p_code: string }; Returns: Json }
      salon_teacher_id: { Args: { _salon_id: string }; Returns: string }
      settle_word_survivor_resources: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      spend_word_survivor_coins: { Args: { p_amount: number }; Returns: Json }
      start_word_survivor_node: {
        Args: { p_coin_cost: number; p_energy_cost: number }
        Returns: Json
      }
      user_in_salon: {
        Args: { _salon_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      activity_type:
        | "multiple_matching"
        | "fill_blanks"
        | "writing"
        | "multiple_choice"
        | "open_questions"
        | "use_of_english"
        | "reading"
        | "listening"
        | "speaking"
        | "multiple_choice_cloze"
        | "open_cloze"
        | "word_formation"
        | "drag_drop_gapfill"
        | "drag_drop_reorder"
        | "drag_drop_categorize"
      app_role: "admin" | "student" | "content_admin" | "teacher"
      entrega_estado: "entregado" | "calificado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_type: [
        "multiple_matching",
        "fill_blanks",
        "writing",
        "multiple_choice",
        "open_questions",
        "use_of_english",
        "reading",
        "listening",
        "speaking",
        "multiple_choice_cloze",
        "open_cloze",
        "word_formation",
        "drag_drop_gapfill",
        "drag_drop_reorder",
        "drag_drop_categorize",
      ],
      app_role: ["admin", "student", "content_admin", "teacher"],
      entrega_estado: ["entregado", "calificado"],
    },
  },
} as const
