export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      graphs: {
        Row: {
          connections: Json | null
          created_at: string | null
          graph_description: string | null
          graph_tags: string[] | null
          graph_title: string | null
          id: string
          nodes: Json | null
          public_id: string | null
          updated_at: string | null
          user_id: string
          visibility: Database["public"]["Enums"]["graph_visibility"] | null
        }
        Insert: {
          connections?: Json | null
          created_at?: string | null
          graph_description?: string | null
          graph_tags?: string[] | null
          graph_title?: string | null
          id?: string
          nodes?: Json | null
          public_id?: string | null
          updated_at?: string | null
          user_id: string
          visibility?: Database["public"]["Enums"]["graph_visibility"] | null
        }
        Update: {
          connections?: Json | null
          created_at?: string | null
          graph_description?: string | null
          graph_tags?: string[] | null
          graph_title?: string | null
          id?: string
          nodes?: Json | null
          public_id?: string | null
          updated_at?: string | null
          user_id?: string
          visibility?: Database["public"]["Enums"]["graph_visibility"] | null
        }
        Relationships: []
      }
      integrations: {
        Row: {
          api_key: string
          created_at: string | null
          database_id: string | null
          id: string
          integration_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string | null
          database_id?: string | null
          id?: string
          integration_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string | null
          database_id?: string | null
          id?: string
          integration_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          user_bio: string | null
          user_email: string | null
          user_github: string | null
          user_id: string
          user_linkedin: string | null
          user_name: string | null
          user_twitter: string | null
          user_website: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_bio?: string | null
          user_email?: string | null
          user_github?: string | null
          user_id: string
          user_linkedin?: string | null
          user_name?: string | null
          user_twitter?: string | null
          user_website?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          user_bio?: string | null
          user_email?: string | null
          user_github?: string | null
          user_id?: string
          user_linkedin?: string | null
          user_name?: string | null
          user_twitter?: string | null
          user_website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      graph_visibility: "private" | "unlisted" | "gallery"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      graph_visibility: {
        private: "private" as const,
        unlisted: "unlisted" as const,
        gallery: "gallery" as const,
      },
    },
  },
} as const