// ─── Supabase Database Types ──────────────────────────────────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          city: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          city?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          full_name?: string | null;
          phone?: string | null;
          city?: string | null;
          avatar_url?: string | null;
        };
      };
      kametis: {
        Row: {
          id: string;
          admin_id: string;
          name: string;
          monthly_amount: number;
          total_months: number;
          total_pool: number; // generated column
          start_date: string;
          status: "active" | "completed" | "paused";
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          name: string;
          monthly_amount: number;
          total_months: number;
          start_date: string;
          status?: "active" | "completed" | "paused";
          created_at?: string;
        };
        Update: {
          name?: string;
          monthly_amount?: number;
          total_months?: number;
          start_date?: string;
          status?: "active" | "completed" | "paused";
        };
      };
      members: {
        Row: {
          id: string;
          kameti_id: string;
          name: string;
          phone: string;
          payout_month_number: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          kameti_id: string;
          name: string;
          phone: string;
          payout_month_number: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          phone?: string;
          payout_month_number?: number;
        };
      };
      payments: {
        Row: {
          id: string;
          member_id: string;
          kameti_id: string;
          month_number: number;
          status: "paid" | "pending";
          proof_image_url: string | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          kameti_id: string;
          month_number: number;
          status?: "paid" | "pending";
          proof_image_url?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          status?: "paid" | "pending";
          proof_image_url?: string | null;
          paid_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      kameti_status: "active" | "completed" | "paused";
      payment_status: "paid" | "pending";
    };
  };
}

// ─── Convenience types ────────────────────────────────────────────────────────
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Kameti = Database["public"]["Tables"]["kametis"]["Row"];
export type Member = Database["public"]["Tables"]["members"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];

export type KametiStatus = "active" | "completed" | "paused";
export type PaymentStatus = "paid" | "pending";

// ─── Extended types with joins ────────────────────────────────────────────────
export type KametiWithMembers = Kameti & {
  members: Member[];
};

export type MemberWithPayments = Member & {
  payments: Payment[];
};

export type PaymentWithMember = Payment & {
  member: Member;
};
