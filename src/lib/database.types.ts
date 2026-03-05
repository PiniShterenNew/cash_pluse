export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          registration_number: string | null;
          default_currency: string;
          timezone: string;
          whatsapp_config_status: "not_connected" | "connected" | "error";
          payplus_config_status: "not_connected" | "connected" | "error";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          registration_number?: string | null;
          default_currency?: string;
          timezone?: string;
          whatsapp_config_status?: "not_connected" | "connected" | "error";
          payplus_config_status?: "not_connected" | "connected" | "error";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          registration_number?: string | null;
          default_currency?: string;
          timezone?: string;
          whatsapp_config_status?: "not_connected" | "connected" | "error";
          payplus_config_status?: "not_connected" | "connected" | "error";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          company_id: string;
          email: string;
          full_name: string;
          role: "owner" | "member";
          is_active: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          company_id: string;
          email: string;
          full_name: string;
          role?: "owner" | "member";
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          email?: string;
          full_name?: string;
          role?: "owner" | "member";
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      clients: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          contact_name: string | null;
          phone_e164: string;
          email: string | null;
          external_reference: string | null;
          reliability_score: number | null;
          total_debt_open: number;
          total_debt_paid: number;
          created_at: string;
          updated_at: string;
          archived_at: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          contact_name?: string | null;
          phone_e164: string;
          email?: string | null;
          external_reference?: string | null;
          reliability_score?: number | null;
          total_debt_open?: number;
          total_debt_paid?: number;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          contact_name?: string | null;
          phone_e164?: string;
          email?: string | null;
          external_reference?: string | null;
          reliability_score?: number | null;
          total_debt_open?: number;
          total_debt_paid?: number;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      debts: {
        Row: {
          id: string;
          company_id: string;
          client_id: string;
          title: string | null;
          description: string | null;
          invoice_reference: string | null;
          amount_total: number;
          amount_paid: number;
          amount_outstanding: number;
          currency: string;
          issue_date: string | null;
          due_date: string;
          status: DebtStatus;
          overdue_days: number;
          payment_link_url: string | null;
          payment_link_provider_ref: string | null;
          expected_payment_date: string | null;
          expected_payment_confidence: string | null;
          last_reminder_sent_at: string | null;
          created_by_user_id: string | null;
          created_at: string;
          updated_at: string;
          closed_at: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          client_id: string;
          title?: string | null;
          description?: string | null;
          invoice_reference?: string | null;
          amount_total: number;
          amount_paid?: number;
          amount_outstanding: number;
          currency?: string;
          issue_date?: string | null;
          due_date: string;
          status?: DebtStatus;
          overdue_days?: number;
          payment_link_url?: string | null;
          payment_link_provider_ref?: string | null;
          expected_payment_date?: string | null;
          expected_payment_confidence?: string | null;
          last_reminder_sent_at?: string | null;
          created_by_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
          closed_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          client_id?: string;
          title?: string | null;
          description?: string | null;
          invoice_reference?: string | null;
          amount_total?: number;
          amount_paid?: number;
          amount_outstanding?: number;
          currency?: string;
          issue_date?: string | null;
          due_date?: string;
          status?: DebtStatus;
          overdue_days?: number;
          payment_link_url?: string | null;
          payment_link_provider_ref?: string | null;
          expected_payment_date?: string | null;
          expected_payment_confidence?: string | null;
          last_reminder_sent_at?: string | null;
          created_by_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
          closed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "debts_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "debts_client_id_fkey";
            columns: ["client_id"];
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          company_id: string;
          debt_id: string;
          provider: string;
          provider_transaction_id: string | null;
          provider_event_id: string;
          amount: number;
          currency: string;
          status: "pending" | "completed" | "failed" | "refunded";
          paid_at: string | null;
          failure_reason: string | null;
          raw_payload: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          debt_id: string;
          provider?: string;
          provider_transaction_id?: string | null;
          provider_event_id: string;
          amount: number;
          currency?: string;
          status?: "pending" | "completed" | "failed" | "refunded";
          paid_at?: string | null;
          failure_reason?: string | null;
          raw_payload: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          debt_id?: string;
          provider?: string;
          provider_transaction_id?: string | null;
          provider_event_id?: string;
          amount?: number;
          currency?: string;
          status?: "pending" | "completed" | "failed" | "refunded";
          paid_at?: string | null;
          failure_reason?: string | null;
          raw_payload?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      reminders: {
        Row: {
          id: string;
          company_id: string;
          debt_id: string;
          client_id: string;
          channel: "whatsapp";
          template_key: string;
          rendered_message: string;
          status: "pending" | "sent" | "delivered" | "read" | "failed";
          provider_message_id: string | null;
          sent_by_user_id: string | null;
          sent_at: string | null;
          delivered_at: string | null;
          read_at: string | null;
          failure_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          debt_id: string;
          client_id: string;
          channel?: "whatsapp";
          template_key: string;
          rendered_message: string;
          status?: "pending" | "sent" | "delivered" | "read" | "failed";
          provider_message_id?: string | null;
          sent_by_user_id?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          read_at?: string | null;
          failure_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          debt_id?: string;
          client_id?: string;
          channel?: "whatsapp";
          template_key?: string;
          rendered_message?: string;
          status?: "pending" | "sent" | "delivered" | "read" | "failed";
          provider_message_id?: string | null;
          sent_by_user_id?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          read_at?: string | null;
          failure_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reminders_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      activity_logs: {
        Row: {
          id: string;
          company_id: string;
          actor_type: string;
          actor_id: string | null;
          entity_type: string;
          entity_id: string;
          action: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          actor_type: string;
          actor_id?: string | null;
          entity_type: string;
          entity_id: string;
          action: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          actor_type?: string;
          actor_id?: string | null;
          entity_type?: string;
          entity_id?: string;
          action?: string;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_logs_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      prediction_snapshots: {
        Row: {
          id: string;
          company_id: string;
          subject_type: string;
          subject_id: string;
          model_version: string;
          expected_payment_date: string | null;
          reliability_score: number | null;
          confidence_score: number | null;
          explanation: Json;
          generated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          subject_type: string;
          subject_id: string;
          model_version: string;
          expected_payment_date?: string | null;
          reliability_score?: number | null;
          confidence_score?: number | null;
          explanation?: Json;
          generated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          subject_type?: string;
          subject_id?: string;
          model_version?: string;
          expected_payment_date?: string | null;
          reliability_score?: number | null;
          confidence_score?: number | null;
          explanation?: Json;
          generated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prediction_snapshots_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    CompositeTypes: Record<never, never>;
    Enums: {
      debt_status: DebtStatus;
      user_role: "owner" | "member";
      reminder_channel: "whatsapp";
      reminder_status: "pending" | "sent" | "delivered" | "read" | "failed";
      payment_status: "pending" | "completed" | "failed" | "refunded";
      connection_status: "not_connected" | "connected" | "error";
    };
  };
};

export type DebtStatus =
  | "draft"
  | "open"
  | "due_today"
  | "overdue"
  | "partially_paid"
  | "paid"
  | "canceled"
  | "disputed";

// Convenience row types
export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Debt = Database["public"]["Tables"]["debts"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Reminder = Database["public"]["Tables"]["reminders"]["Row"];
export type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"];
export type PredictionSnapshot = Database["public"]["Tables"]["prediction_snapshots"]["Row"];
