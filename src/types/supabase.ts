export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  branding: {
    Tables: {
      icons: {
        Row: {
          concept_key: string
          created_at: string
          file_id: string
          file_type: Database["branding"]["Enums"]["icon_format"]
          source_method: Database["branding"]["Enums"]["source_method"]
        }
        Insert: {
          concept_key: string
          created_at?: string
          file_id: string
          file_type: Database["branding"]["Enums"]["icon_format"]
          source_method?: Database["branding"]["Enums"]["source_method"]
        }
        Update: {
          concept_key?: string
          created_at?: string
          file_id?: string
          file_type?: Database["branding"]["Enums"]["icon_format"]
          source_method?: Database["branding"]["Enums"]["source_method"]
        }
        Relationships: []
      }
      websites: {
        Row: {
          concept_key: string
          created_at: string
          desc: string | null
          title: string | null
        }
        Insert: {
          concept_key: string
          created_at?: string
          desc?: string | null
          title?: string | null
        }
        Update: {
          concept_key?: string
          created_at?: string
          desc?: string | null
          title?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      icon_format: "svg" | "webp"
      source_method: "favicon" | "logo_dev" | "manual"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accessibility: {
        Row: {
          created_at: string
          id: string
          project_id: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          project_id?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accessibility_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      accessibility_runs: {
        Row: {
          accessibility_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          result: Json | null
        }
        Insert: {
          accessibility_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          result?: Json | null
        }
        Update: {
          accessibility_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          result?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "accessibility_runs_accessibility_id_fkey"
            columns: ["accessibility_id"]
            isOneToOne: false
            referencedRelation: "accessibility"
            referencedColumns: ["id"]
          },
        ]
      }
      advisor_issues: {
        Row: {
          created_at: string
          id: string
          issue_metadata: Json | null
          issue_type: Database["public"]["Enums"]["issue_type"] | null
          priority: Database["public"]["Enums"]["priority"] | null
          project_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          issue_metadata?: Json | null
          issue_type?: Database["public"]["Enums"]["issue_type"] | null
          priority?: Database["public"]["Enums"]["priority"] | null
          project_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          issue_metadata?: Json | null
          issue_type?: Database["public"]["Enums"]["issue_type"] | null
          priority?: Database["public"]["Enums"]["priority"] | null
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advisor_issues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          created_at: string
          id: string
          project_id: string
          role: Database["public"]["Enums"]["role"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          role?: Database["public"]["Enums"]["role"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          role?: Database["public"]["Enums"]["role"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          project_metadata: Json | null
          subscription_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          project_metadata?: Json | null
          subscription_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          project_metadata?: Json | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_limitations: {
        Row: {
          created_at: string
          id: string
          limitations: Json
          subscription_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          limitations?: Json
          subscription_id: string
        }
        Update: {
          created_at?: string
          id?: string
          limitations?: Json
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_limitations_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: true
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          plan: Database["public"]["Enums"]["plan"] | null
          stripe_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan"] | null
          stripe_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan"] | null
          stripe_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      survey_batches: {
        Row: {
          created_at: string
          id: string
          prompter_prompt_id: string | null
          quantifier_prompt_id: string | null
          survey_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompter_prompt_id?: string | null
          quantifier_prompt_id?: string | null
          survey_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prompter_prompt_id?: string | null
          quantifier_prompt_id?: string | null
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "batches_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_runs: {
        Row: {
          batch_id: string
          created_at: string
          id: string
          metadata: Json | null
          prompt_id: string
          result: Json | null
        }
        Insert: {
          batch_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          prompt_id: string
          result?: Json | null
        }
        Update: {
          batch_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          prompt_id?: string
          result?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_runs_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "survey_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string | null
          pipeline: Database["public"]["Enums"]["pipeline"]
          pipeline_metadata: Json | null
          project_id: string | null
          runners: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
          pipeline: Database["public"]["Enums"]["pipeline"]
          pipeline_metadata?: Json | null
          project_id?: string | null
          runners?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
          pipeline?: Database["public"]["Enums"]["pipeline"]
          pipeline_metadata?: Json | null
          project_id?: string | null
          runners?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "surveys_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_invite: {
        Args: {
          _user_id: string
          _project_id: string
          _new_role: Database["public"]["Enums"]["role"]
          _member_id: string
        }
        Returns: undefined
      }
      clean_pending_memberships: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_project: {
        Args: { _user_id: string; _name: string; _description: string }
        Returns: string
      }
      get_project_user_emails: {
        Args: { project_id: string }
        Returns: {
          user_id: string
          email: string
        }[]
      }
      is_admin: {
        Args: { project: string }
        Returns: boolean
      }
    }
    Enums: {
      issue_type:
        | "presence"
        | "understanding"
        | "discoverability"
        | "llms_txt"
        | "llms_full_txt"
        | "ai_crawlable"
        | "open_content_access"
        | "robots_txt_bots"
        | "sitemap_xml"
        | "content_platform_presence"
      issue_type_new:
        | "understanding"
        | "llms_txt"
        | "llms_full_txt"
        | "ai_crawlable"
        | "open_content_access"
        | "robots_txt_bots"
        | "sitemap_xml"
        | "content_platform_presence"
      pipeline: "presence" | "understanding"
      plan: "lite" | "growth"
      priority: "low" | "medium" | "high" | "hidden" | "fixed"
      role: "admin" | "operator" | "viewer"
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
  branding: {
    Enums: {
      icon_format: ["svg", "webp"],
      source_method: ["favicon", "logo_dev", "manual"],
    },
  },
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      issue_type: [
        "presence",
        "understanding",
        "discoverability",
        "llms_txt",
        "llms_full_txt",
        "ai_crawlable",
        "open_content_access",
        "robots_txt_bots",
        "sitemap_xml",
        "content_platform_presence",
      ],
      issue_type_new: [
        "understanding",
        "llms_txt",
        "llms_full_txt",
        "ai_crawlable",
        "open_content_access",
        "robots_txt_bots",
        "sitemap_xml",
        "content_platform_presence",
      ],
      pipeline: ["presence", "understanding"],
      plan: ["lite", "growth"],
      priority: ["low", "medium", "high", "hidden", "fixed"],
      role: ["admin", "operator", "viewer"],
    },
  },
} as const
