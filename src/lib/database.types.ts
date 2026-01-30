import type { Field } from '../types';

export interface Database {
  public: {
    Tables: {
      templates: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          original_docx: string;
          html_content: string;
          schema: Field[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          original_docx: string;
          html_content: string;
          schema: Field[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          original_docx?: string;
          html_content?: string;
          schema?: Field[];
          created_at?: string;
          updated_at?: string;
        };
      };
      data_sessions: {
        Row: {
          id: string;
          template_id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          user_id: string;
          title: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          user_id?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      data_rows: {
        Row: {
          id: string;
          session_id: string;
          template_id: string;
          user_id: string;
          values: Record<string, string>;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          template_id: string;
          user_id: string;
          values: Record<string, string>;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          template_id?: string;
          user_id?: string;
          values?: Record<string, string>;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
