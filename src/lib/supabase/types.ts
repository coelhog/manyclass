// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
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
    PostgrestVersion: '13.0.5'
  }
  public: {
    Tables: {
      automated_messages: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          template: string | null
          timing: string | null
          title: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          template?: string | null
          timing?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          template?: string | null
          timing?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'automated_messages_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      class_notes: {
        Row: {
          class_id: string | null
          content: string | null
          created_at: string | null
          event_id: string | null
          id: string
          student_id: string | null
          teacher_id: string | null
          updated_at: string | null
        }
        Insert: {
          class_id?: string | null
          content?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          student_id?: string | null
          teacher_id?: string | null
          updated_at?: string | null
        }
        Update: {
          class_id?: string | null
          content?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          student_id?: string | null
          teacher_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'class_notes_class_id_fkey'
            columns: ['class_id']
            isOneToOne: false
            referencedRelation: 'classes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'class_notes_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'class_notes_teacher_id_fkey'
            columns: ['teacher_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      class_students: {
        Row: {
          class_id: string
          created_at: string | null
          custom_price: number | null
          student_id: string
        }
        Insert: {
          class_id: string
          created_at?: string | null
          custom_price?: number | null
          student_id: string
        }
        Update: {
          class_id?: string
          created_at?: string | null
          custom_price?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'class_students_class_id_fkey'
            columns: ['class_id']
            isOneToOne: false
            referencedRelation: 'classes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'class_students_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      classes: {
        Row: {
          billing_model: string | null
          category: string | null
          color: string | null
          created_at: string | null
          days: number[] | null
          duration: number | null
          id: string
          meet_link: string | null
          name: string
          price: number | null
          schedule: string | null
          start_time: string | null
          status: string | null
          student_limit: number | null
          teacher_id: string | null
        }
        Insert: {
          billing_model?: string | null
          category?: string | null
          color?: string | null
          created_at?: string | null
          days?: number[] | null
          duration?: number | null
          id?: string
          meet_link?: string | null
          name: string
          price?: number | null
          schedule?: string | null
          start_time?: string | null
          status?: string | null
          student_limit?: number | null
          teacher_id?: string | null
        }
        Update: {
          billing_model?: string | null
          category?: string | null
          color?: string | null
          created_at?: string | null
          days?: number[] | null
          duration?: number | null
          id?: string
          meet_link?: string | null
          name?: string
          price?: number | null
          schedule?: string | null
          start_time?: string | null
          status?: string | null
          student_limit?: number | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'classes_teacher_id_fkey'
            columns: ['teacher_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      daily_metrics: {
        Row: {
          active_users: number | null
          date: string
          new_signups: number | null
          tasks_completed: number | null
          total_revenue: number | null
        }
        Insert: {
          active_users?: number | null
          date?: string
          new_signups?: number | null
          tasks_completed?: number | null
          total_revenue?: number | null
        }
        Update: {
          active_users?: number | null
          date?: string
          new_signups?: number | null
          tasks_completed?: number | null
          total_revenue?: number | null
        }
        Relationships: []
      }
      events: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          end_time: string | null
          id: string
          is_synced: boolean | null
          start_time: string | null
          student_ids: string[] | null
          teacher_id: string | null
          title: string | null
          type: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          is_synced?: boolean | null
          start_time?: string | null
          student_ids?: string[] | null
          teacher_id?: string | null
          title?: string | null
          type?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          is_synced?: boolean | null
          start_time?: string | null
          student_ids?: string[] | null
          teacher_id?: string | null
          title?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'events_teacher_id_fkey'
            columns: ['teacher_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      integrations: {
        Row: {
          config: Json | null
          connected_at: string | null
          id: string
          integration_id: string
          provider: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          config?: Json | null
          connected_at?: string | null
          id?: string
          integration_id: string
          provider?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          config?: Json | null
          connected_at?: string | null
          id?: string
          integration_id?: string
          provider?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'integrations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      material_access: {
        Row: {
          material_id: string
          student_id: string
        }
        Insert: {
          material_id: string
          student_id: string
        }
        Update: {
          material_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'material_access_material_id_fkey'
            columns: ['material_id']
            isOneToOne: false
            referencedRelation: 'materials'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'material_access_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      materials: {
        Row: {
          description: string | null
          file_type: string | null
          file_url: string | null
          id: string
          teacher_id: string | null
          title: string
          uploaded_at: string | null
        }
        Insert: {
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          teacher_id?: string | null
          title: string
          uploaded_at?: string | null
        }
        Update: {
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          teacher_id?: string | null
          title?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'materials_teacher_id_fkey'
            columns: ['teacher_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      onboarding_data: {
        Row: {
          data: Json | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          data?: Json | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          data?: Json | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'onboarding_data_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      onboarding_questions: {
        Row: {
          id: string
          options: string[] | null
          step: number | null
          text: string | null
          type: string | null
        }
        Insert: {
          id: string
          options?: string[] | null
          step?: number | null
          text?: string | null
          type?: string | null
        }
        Update: {
          id?: string
          options?: string[] | null
          step?: number | null
          text?: string | null
          type?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          paid_at: string | null
          status: string | null
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          paid_at?: string | null
          status?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          paid_at?: string | null
          status?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'payments_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      platform_courses: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          title: string
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          bio: string | null
          created_at: string | null
          created_by: string | null
          email: string
          id: string
          name: string | null
          onboarding_completed: boolean | null
          phone: string | null
          plan_id: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          created_by?: string | null
          email: string
          id: string
          name?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          plan_id?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string
          id?: string
          name?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          plan_id?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      task_submissions: {
        Row: {
          content: string | null
          feedback: string | null
          grade: number | null
          id: string
          selected_option_id: string | null
          status: string | null
          student_id: string | null
          submitted_at: string | null
          task_id: string | null
        }
        Insert: {
          content?: string | null
          feedback?: string | null
          grade?: number | null
          id?: string
          selected_option_id?: string | null
          status?: string | null
          student_id?: string | null
          submitted_at?: string | null
          task_id?: string | null
        }
        Update: {
          content?: string | null
          feedback?: string | null
          grade?: number | null
          id?: string
          selected_option_id?: string | null
          status?: string | null
          student_id?: string | null
          submitted_at?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'task_submissions_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'task_submissions_task_id_fkey'
            columns: ['task_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id']
          },
        ]
      }
      tasks: {
        Row: {
          class_id: string | null
          color: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          options: Json | null
          status: string | null
          student_id: string | null
          tags: Json | null
          teacher_id: string | null
          title: string
          type: string | null
        }
        Insert: {
          class_id?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          options?: Json | null
          status?: string | null
          student_id?: string | null
          tags?: Json | null
          teacher_id?: string | null
          title: string
          type?: string | null
        }
        Update: {
          class_id?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          options?: Json | null
          status?: string | null
          student_id?: string | null
          tags?: Json | null
          teacher_id?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'tasks_class_id_fkey'
            columns: ['class_id']
            isOneToOne: false
            referencedRelation: 'classes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_teacher_id_fkey'
            columns: ['teacher_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      teacher_schedules: {
        Row: {
          availability: Json | null
          booking_duration: number | null
          booking_link_enabled: boolean | null
          id: string
          teacher_id: string | null
          updated_at: string | null
        }
        Insert: {
          availability?: Json | null
          booking_duration?: number | null
          booking_link_enabled?: boolean | null
          id?: string
          teacher_id?: string | null
          updated_at?: string | null
        }
        Update: {
          availability?: Json | null
          booking_duration?: number | null
          booking_link_enabled?: boolean | null
          id?: string
          teacher_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'teacher_schedules_teacher_id_fkey'
            columns: ['teacher_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      storage_can_read_file: {
        Args: { bucket_id: string; name: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
