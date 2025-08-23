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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      allowed_domains: {
        Row: {
          added_by: string | null
          created_at: string | null
          deleted_at: string | null
          domain: string
          id: string
          updated_at: string | null
        }
        Insert: {
          added_by?: string | null
          created_at?: string | null
          deleted_at?: string | null
          domain: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          added_by?: string | null
          created_at?: string | null
          deleted_at?: string | null
          domain?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "allowed_domains_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          added_by: string
          api_key: string
          created_at: string | null
          deleted_at: string | null
          id: string
          is_active: boolean | null
          provider: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          added_by: string
          api_key: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean | null
          provider: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          added_by?: string
          api_key?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          performed_at: string | null
          performed_by: string | null
          record_id: string | null
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          performed_at?: string | null
          performed_by?: string | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          performed_at?: string | null
          performed_by?: string | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      cohorts: {
        Row: {
          created_at: string | null
          created_by: string
          deleted_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string
          status: Database["public"]["Enums"]["cohort_status"]
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date: string
          status?: Database["public"]["Enums"]["cohort_status"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string
          status?: Database["public"]["Enums"]["cohort_status"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cohorts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cohorts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          enrolled_at: string | null
          id: string
          plan_id: string | null
          user_id: string
        }
        Insert: {
          enrolled_at?: string | null
          id?: string
          plan_id?: string | null
          user_id: string
        }
        Update: {
          enrolled_at?: string | null
          id?: string
          plan_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "learning_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_plans: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          description: string
          duration: unknown | null
          id: string
          is_ai_generated: boolean | null
          language: string | null
          learning_outcomes: string[] | null
          level: Database["public"]["Enums"]["content_level"]
          name: string
          star_rating: number | null
          status: Database["public"]["Enums"]["content_status"]
          steps: Json | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description: string
          duration?: unknown | null
          id?: string
          is_ai_generated?: boolean | null
          language?: string | null
          learning_outcomes?: string[] | null
          level: Database["public"]["Enums"]["content_level"]
          name: string
          star_rating?: number | null
          status?: Database["public"]["Enums"]["content_status"]
          steps?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string
          duration?: unknown | null
          id?: string
          is_ai_generated?: boolean | null
          language?: string | null
          learning_outcomes?: string[] | null
          level?: Database["public"]["Enums"]["content_level"]
          name?: string
          star_rating?: number | null
          status?: Database["public"]["Enums"]["content_status"]
          steps?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_plans_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          bucket_path: string
          content_type: string
          created_at: string | null
          created_by: string
          deleted_at: string | null
          id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          bucket_path: string
          content_type: string
          created_at?: string | null
          created_by: string
          deleted_at?: string | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          bucket_path?: string
          content_type?: string
          created_at?: string | null
          created_by?: string
          deleted_at?: string | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          created_at: string | null
          created_by: string
          deleted_at: string | null
          description: string
          id: string
          is_active: boolean | null
          language: string | null
          level: Database["public"]["Enums"]["content_level"]
          metadata: Json | null
          stars_rating: number | null
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          deleted_at?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          language?: string | null
          level: Database["public"]["Enums"]["content_level"]
          metadata?: Json | null
          stars_rating?: number | null
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          deleted_at?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          language?: string | null
          level?: Database["public"]["Enums"]["content_level"]
          metadata?: Json | null
          stars_rating?: number | null
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          department: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          organization: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          department?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_login?: string | null
          organization?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          organization?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      prompt_library: {
        Row: {
          created_at: string | null
          created_by: string
          deleted_at: string | null
          description: string
          id: string
          name: string
          purpose: string
          sample_output: string | null
          sector_tags: Json | null
          stars: number | null
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          deleted_at?: string | null
          description: string
          id?: string
          name: string
          purpose: string
          sample_output?: string | null
          sector_tags?: Json | null
          stars?: number | null
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          deleted_at?: string | null
          description?: string
          id?: string
          name?: string
          purpose?: string
          sample_output?: string | null
          sector_tags?: Json | null
          stars?: number | null
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_library_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_library_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          created_at: string | null
          created_by: string
          deleted_at: string | null
          description: string
          id: string
          is_active: boolean | null
          language: string | null
          level: Database["public"]["Enums"]["content_level"]
          name: string
          screenshot_asset_id: string | null
          stars_rating: number | null
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string | null
          updated_by: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          deleted_at?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          language?: string | null
          level: Database["public"]["Enums"]["content_level"]
          name: string
          screenshot_asset_id?: string | null
          stars_rating?: number | null
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string | null
          updated_by?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          deleted_at?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          language?: string | null
          level?: Database["public"]["Enums"]["content_level"]
          name?: string
          screenshot_asset_id?: string | null
          stars_rating?: number | null
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string | null
          updated_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_screenshot_asset_id_fkey"
            columns: ["screenshot_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_configs: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_configs_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          cost_indicator: string | null
          created_at: string | null
          created_by: string
          deleted_at: string | null
          description: string
          id: string
          name: string
          stars: number | null
          status: Database["public"]["Enums"]["content_status"]
          type: Database["public"]["Enums"]["tool_type"]
          updated_at: string | null
          updated_by: string | null
          url: string | null
        }
        Insert: {
          cost_indicator?: string | null
          created_at?: string | null
          created_by: string
          deleted_at?: string | null
          description: string
          id?: string
          name: string
          stars?: number | null
          status?: Database["public"]["Enums"]["content_status"]
          type: Database["public"]["Enums"]["tool_type"]
          updated_at?: string | null
          updated_by?: string | null
          url?: string | null
        }
        Update: {
          cost_indicator?: string | null
          created_at?: string | null
          created_by?: string
          deleted_at?: string | null
          description?: string
          id?: string
          name?: string
          stars?: number | null
          status?: Database["public"]["Enums"]["content_status"]
          type?: Database["public"]["Enums"]["tool_type"]
          updated_at?: string | null
          updated_by?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tools_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tools_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_platform_statistics: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_news: number
          total_plans: number
          total_prompts: number
          total_resources: number
          total_tools: number
          total_users: number
        }[]
      }
      promote_to_admin: {
        Args: { target_email: string }
        Returns: boolean
      }
    }
    Enums: {
      cohort_status: "active" | "inactive" | "completed"
      content_level: "1" | "2" | "3" | "RED"
      content_status: "draft" | "review" | "published" | "archived"
      module_content_type: "text" | "image" | "video" | "quiz"
      tool_type: "open_source" | "saas" | "commercial"
      user_role: "public" | "government" | "facilitator" | "admin"
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
      cohort_status: ["active", "inactive", "completed"],
      content_level: ["1", "2", "3", "RED"],
      content_status: ["draft", "review", "published", "archived"],
      module_content_type: ["text", "image", "video", "quiz"],
      tool_type: ["open_source", "saas", "commercial"],
      user_role: ["public", "government", "facilitator", "admin"],
    },
  },
} as const
