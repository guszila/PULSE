export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      watchlists: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          company: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          company?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          symbol?: string;
          company?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      positions: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          shares: number;
          average_cost: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          shares: number;
          average_cost: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          symbol?: string;
          shares?: number;
          average_cost?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          type: "buy" | "sell" | "dividend" | "deposit" | "withdrawal";
          quantity: number | null;
          price: number | null;
          amount: number | null;
          executed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          type: "buy" | "sell" | "dividend" | "deposit" | "withdrawal";
          quantity?: number | null;
          price?: number | null;
          amount?: number | null;
          executed_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          symbol?: string;
          type?: "buy" | "sell" | "dividend" | "deposit" | "withdrawal";
          quantity?: number | null;
          price?: number | null;
          amount?: number | null;
          executed_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          user_id: string;
          currency: string;
          timezone: string;
          dashboard_layout: Json;
          notifications: Json;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          currency?: string;
          timezone?: string;
          dashboard_layout?: Json;
          notifications?: Json;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          currency?: string;
          timezone?: string;
          dashboard_layout?: Json;
          notifications?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
