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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      daily_unit_readings: {
        Row: {
          cdd: number | null
          condition: string | null
          created_at: string
          fleet_sar: number | null
          fleet_total: number | null
          id: string
          kwh: number | null
          max_temp_c: number | null
          mean_temp_c: number | null
          min_temp_c: number | null
          notes: string | null
          reading_date: string
          status: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          cdd?: number | null
          condition?: string | null
          created_at?: string
          fleet_sar?: number | null
          fleet_total?: number | null
          id?: string
          kwh?: number | null
          max_temp_c?: number | null
          mean_temp_c?: number | null
          min_temp_c?: number | null
          notes?: string | null
          reading_date: string
          status?: string | null
          unit: string
          updated_at?: string
        }
        Update: {
          cdd?: number | null
          condition?: string | null
          created_at?: string
          fleet_sar?: number | null
          fleet_total?: number | null
          id?: string
          kwh?: number | null
          max_temp_c?: number | null
          mean_temp_c?: number | null
          min_temp_c?: number | null
          notes?: string | null
          reading_date?: string
          status?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_weather: {
        Row: {
          cdd: number | null
          created_at: string
          date: string
          max_temp_c: number | null
          mean_temp_c: number | null
          min_temp_c: number | null
          source: string
          updated_at: string
        }
        Insert: {
          cdd?: number | null
          created_at?: string
          date: string
          max_temp_c?: number | null
          mean_temp_c?: number | null
          min_temp_c?: number | null
          source?: string
          updated_at?: string
        }
        Update: {
          cdd?: number | null
          created_at?: string
          date?: string
          max_temp_c?: number | null
          mean_temp_c?: number | null
          min_temp_c?: number | null
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_weather_rawdah: {
        Row: {
          cdd: number | null
          created_at: string
          date: string
          max_temp_c: number | null
          mean_temp_c: number | null
          min_temp_c: number | null
          source: string
        }
        Insert: {
          cdd?: number | null
          created_at?: string
          date: string
          max_temp_c?: number | null
          mean_temp_c?: number | null
          min_temp_c?: number | null
          source?: string
        }
        Update: {
          cdd?: number | null
          created_at?: string
          date?: string
          max_temp_c?: number | null
          mean_temp_c?: number | null
          min_temp_c?: number | null
          source?: string
        }
        Relationships: []
      }
      eyedro_readings: {
        Row: {
          created_at: string
          current_a: number | null
          device_serial: string | null
          energy_kwh: number | null
          id: string
          payload: Json | null
          power_kw: number | null
          ts: string
          voltage: number | null
        }
        Insert: {
          created_at?: string
          current_a?: number | null
          device_serial?: string | null
          energy_kwh?: number | null
          id?: string
          payload?: Json | null
          power_kw?: number | null
          ts?: string
          voltage?: number | null
        }
        Update: {
          created_at?: string
          current_a?: number | null
          device_serial?: string | null
          energy_kwh?: number | null
          id?: string
          payload?: Json | null
          power_kw?: number | null
          ts?: string
          voltage?: number | null
        }
        Relationships: []
      }
      page_layouts: {
        Row: {
          created_at: string
          id: string
          layout_json: Json
          name: string
          published_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          layout_json?: Json
          name?: string
          published_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          layout_json?: Json
          name?: string
          published_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      sceco_monthly_bills: {
        Row: {
          base_cost: number | null
          bill_sar: number | null
          created_at: string
          id: string
          kwh: number | null
          month: string
          updated_at: string
          vat: number | null
          year: number
        }
        Insert: {
          base_cost?: number | null
          bill_sar?: number | null
          created_at?: string
          id?: string
          kwh?: number | null
          month: string
          updated_at?: string
          vat?: number | null
          year: number
        }
        Update: {
          base_cost?: number | null
          bill_sar?: number | null
          created_at?: string
          id?: string
          kwh?: number | null
          month?: string
          updated_at?: string
          vat?: number | null
          year?: number
        }
        Relationships: []
      }
      unit_alerts: {
        Row: {
          action: string | null
          created_at: string
          id: string
          level: string | null
          message: string | null
          ts: string
          unit: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string
          id?: string
          level?: string | null
          message?: string | null
          ts: string
          unit?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string
          id?: string
          level?: string | null
          message?: string | null
          ts?: string
          unit?: string | null
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
