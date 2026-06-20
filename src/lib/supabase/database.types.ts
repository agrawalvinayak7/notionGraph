// Generated from the Supabase schema (docs/SCHEMA.md). Regenerate after any
// migration with the Supabase MCP `generate_typescript_types` or the CLI.
// Do not edit by hand.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      edges: {
        Row: {
          created_at: string;
          id: string;
          source_node_id: string;
          target_node_id: string;
          type: string;
          user_id: string;
          weight: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          source_node_id: string;
          target_node_id: string;
          type: string;
          user_id: string;
          weight?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          source_node_id?: string;
          target_node_id?: string;
          type?: string;
          user_id?: string;
          weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: "edges_source_node_id_fkey";
            columns: ["source_node_id"];
            isOneToOne: false;
            referencedRelation: "nodes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "edges_target_node_id_fkey";
            columns: ["target_node_id"];
            isOneToOne: false;
            referencedRelation: "nodes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "edges_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      nodes: {
        Row: {
          degree: number;
          id: string;
          meta: Json;
          notion_id: string;
          parent_notion_id: string | null;
          title: string | null;
          type: string;
          updated_at: string;
          url: string | null;
          user_id: string;
        };
        Insert: {
          degree?: number;
          id?: string;
          meta?: Json;
          notion_id: string;
          parent_notion_id?: string | null;
          title?: string | null;
          type: string;
          updated_at?: string;
          url?: string | null;
          user_id: string;
        };
        Update: {
          degree?: number;
          id?: string;
          meta?: Json;
          notion_id?: string;
          parent_notion_id?: string | null;
          title?: string | null;
          type?: string;
          updated_at?: string;
          url?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "nodes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      notion_connections: {
        Row: {
          access_token_encrypted: string;
          bot_id: string | null;
          created_at: string;
          id: string;
          last_synced_at: string | null;
          user_id: string;
          workspace_id: string | null;
          workspace_name: string | null;
        };
        Insert: {
          access_token_encrypted: string;
          bot_id?: string | null;
          created_at?: string;
          id?: string;
          last_synced_at?: string | null;
          user_id: string;
          workspace_id?: string | null;
          workspace_name?: string | null;
        };
        Update: {
          access_token_encrypted?: string;
          bot_id?: string | null;
          created_at?: string;
          id?: string;
          last_synced_at?: string | null;
          user_id?: string;
          workspace_id?: string | null;
          workspace_name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notion_connections_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      sync_runs: {
        Row: {
          connection_id: string | null;
          error: string | null;
          finished_at: string | null;
          id: string;
          kind: string;
          started_at: string;
          stats: Json;
          status: string;
          user_id: string;
        };
        Insert: {
          connection_id?: string | null;
          error?: string | null;
          finished_at?: string | null;
          id?: string;
          kind: string;
          started_at?: string;
          stats?: Json;
          status: string;
          user_id: string;
        };
        Update: {
          connection_id?: string | null;
          error?: string | null;
          finished_at?: string | null;
          id?: string;
          kind?: string;
          started_at?: string;
          stats?: Json;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sync_runs_connection_id_fkey";
            columns: ["connection_id"];
            isOneToOne: false;
            referencedRelation: "notion_connections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sync_runs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          clerk_user_id: string;
          created_at: string;
          email: string;
          id: string;
        };
        Insert: {
          clerk_user_id: string;
          created_at?: string;
          email: string;
          id?: string;
        };
        Update: {
          clerk_user_id?: string;
          created_at?: string;
          email?: string;
          id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
