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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blocks: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      check_in_votes: {
        Row: {
          check_in_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          check_in_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          check_in_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_in_votes_check_in_id_fkey"
            columns: ["check_in_id"]
            isOneToOne: false
            referencedRelation: "check_ins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_in_votes_check_in_id_fkey"
            columns: ["check_in_id"]
            isOneToOne: false
            referencedRelation: "v_checkin_feed"
            referencedColumns: ["id"]
          },
        ]
      }
      check_ins: {
        Row: {
          ac_comfort: Database["public"]["Enums"]["ac_comfort"] | null
          created_at: string
          crowd_density: Database["public"]["Enums"]["crowd_density"]
          expires_at: string
          helpful_count: number
          id: string
          is_anonymous: boolean
          is_simulated: boolean
          note: string | null
          purpose: Database["public"]["Enums"]["checkin_purpose"] | null
          rate_bucket: string | null
          room_id: string
          socket_availability:
            | Database["public"]["Enums"]["socket_availability"]
            | null
          user_id: string
        }
        Insert: {
          ac_comfort?: Database["public"]["Enums"]["ac_comfort"] | null
          created_at?: string
          crowd_density: Database["public"]["Enums"]["crowd_density"]
          expires_at?: string
          helpful_count?: number
          id?: string
          is_anonymous?: boolean
          is_simulated?: boolean
          note?: string | null
          purpose?: Database["public"]["Enums"]["checkin_purpose"] | null
          rate_bucket?: string | null
          room_id: string
          socket_availability?:
            | Database["public"]["Enums"]["socket_availability"]
            | null
          user_id: string
        }
        Update: {
          ac_comfort?: Database["public"]["Enums"]["ac_comfort"] | null
          created_at?: string
          crowd_density?: Database["public"]["Enums"]["crowd_density"]
          expires_at?: string
          helpful_count?: number
          id?: string
          is_anonymous?: boolean
          is_simulated?: boolean
          note?: string | null
          purpose?: Database["public"]["Enums"]["checkin_purpose"] | null
          rate_bucket?: string | null
          room_id?: string
          socket_availability?:
            | Database["public"]["Enums"]["socket_availability"]
            | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_live_status"
            referencedColumns: ["room_id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          credits: number | null
          department: string | null
          id: string
          title: string
        }
        Insert: {
          code: string
          credits?: number | null
          department?: string | null
          id?: string
          title: string
        }
        Update: {
          code?: string
          credits?: number | null
          department?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          all_day: boolean
          category: Database["public"]["Enums"]["event_category"]
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          id: string
          is_cancelled: boolean
          organizer: string | null
          starts_at: string
          title: string
          venue_room_id: string | null
          venue_text: string | null
        }
        Insert: {
          all_day?: boolean
          category?: Database["public"]["Enums"]["event_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_cancelled?: boolean
          organizer?: string | null
          starts_at: string
          title: string
          venue_room_id?: string | null
          venue_text?: string | null
        }
        Update: {
          all_day?: boolean
          category?: Database["public"]["Enums"]["event_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_cancelled?: boolean
          organizer?: string | null
          starts_at?: string
          title?: string
          venue_room_id?: string | null
          venue_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_room_id_fkey"
            columns: ["venue_room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_room_id_fkey"
            columns: ["venue_room_id"]
            isOneToOne: false
            referencedRelation: "v_room_live_status"
            referencedColumns: ["room_id"]
          },
        ]
      }
      faculty: {
        Row: {
          cabin_note: string | null
          cabin_room_id: string | null
          department: string | null
          email: string | null
          full_name: string
          id: string
          office_hours: string | null
        }
        Insert: {
          cabin_note?: string | null
          cabin_room_id?: string | null
          department?: string | null
          email?: string | null
          full_name: string
          id?: string
          office_hours?: string | null
        }
        Update: {
          cabin_note?: string | null
          cabin_room_id?: string | null
          department?: string | null
          email?: string | null
          full_name?: string
          id?: string
          office_hours?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faculty_cabin_room_id_fkey"
            columns: ["cabin_room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_cabin_room_id_fkey"
            columns: ["cabin_room_id"]
            isOneToOne: false
            referencedRelation: "v_room_live_status"
            referencedColumns: ["room_id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          room_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          room_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_live_status"
            referencedColumns: ["room_id"]
          },
        ]
      }
      features: {
        Row: {
          id: string
          kind: Database["public"]["Enums"]["feature_kind"]
          label: string
          slug: string
        }
        Insert: {
          id?: string
          kind: Database["public"]["Enums"]["feature_kind"]
          label: string
          slug: string
        }
        Update: {
          id?: string
          kind?: Database["public"]["Enums"]["feature_kind"]
          label?: string
          slug?: string
        }
        Relationships: []
      }
      floors: {
        Row: {
          block_id: string
          id: string
          label: string
          level: number
        }
        Insert: {
          block_id: string
          id?: string
          label: string
          level: number
        }
        Update: {
          block_id?: string
          id?: string
          label?: string
          level?: number
        }
        Relationships: [
          {
            foreignKeyName: "floors_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_events: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: string
          from_status: Database["public"]["Enums"]["issue_status"] | null
          id: number
          issue_id: string
          note: string | null
          to_status: Database["public"]["Enums"]["issue_status"] | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: string
          from_status?: Database["public"]["Enums"]["issue_status"] | null
          id?: number
          issue_id: string
          note?: string | null
          to_status?: Database["public"]["Enums"]["issue_status"] | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: string
          from_status?: Database["public"]["Enums"]["issue_status"] | null
          id?: number
          issue_id?: string
          note?: string | null
          to_status?: Database["public"]["Enums"]["issue_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "issue_events_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_votes: {
        Row: {
          created_at: string
          issue_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          issue_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          issue_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_votes_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          assigned_to: string | null
          category: Database["public"]["Enums"]["issue_category"]
          created_at: string
          description: string
          id: string
          is_anonymous: boolean
          photo_path: string | null
          ref: string
          reported_by: string
          resolution_note: string | null
          resolved_at: string | null
          room_id: string
          status: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at: string
          urgency: Database["public"]["Enums"]["issue_urgency"]
        }
        Insert: {
          assigned_to?: string | null
          category: Database["public"]["Enums"]["issue_category"]
          created_at?: string
          description: string
          id?: string
          is_anonymous?: boolean
          photo_path?: string | null
          ref?: string
          reported_by: string
          resolution_note?: string | null
          resolved_at?: string | null
          room_id: string
          status?: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at?: string
          urgency?: Database["public"]["Enums"]["issue_urgency"]
        }
        Update: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["issue_category"]
          created_at?: string
          description?: string
          id?: string
          is_anonymous?: boolean
          photo_path?: string | null
          ref?: string
          reported_by?: string
          resolution_note?: string | null
          resolved_at?: string | null
          room_id?: string
          status?: Database["public"]["Enums"]["issue_status"]
          title?: string
          updated_at?: string
          urgency?: Database["public"]["Enums"]["issue_urgency"]
        }
        Relationships: [
          {
            foreignKeyName: "issues_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "v_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_live_status"
            referencedColumns: ["room_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string
          full_name: string
          id: string
          karma: number
          role: Database["public"]["Enums"]["user_role"]
          semester: string | null
          updated_at: string
          usn: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email: string
          full_name?: string
          id: string
          karma?: number
          role?: Database["public"]["Enums"]["user_role"]
          semester?: string | null
          updated_at?: string
          usn?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          karma?: number
          role?: Database["public"]["Enums"]["user_role"]
          semester?: string | null
          updated_at?: string
          usn?: string | null
        }
        Relationships: []
      }
      room_features: {
        Row: {
          feature_id: string
          room_id: string
        }
        Insert: {
          feature_id: string
          room_id: string
        }
        Update: {
          feature_id?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_features_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_features_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_live_status"
            referencedColumns: ["room_id"]
          },
        ]
      }
      room_infrastructure: {
        Row: {
          ac_setpoint_c: number | null
          ac_type: string | null
          comfort_score: number | null
          has_ac: boolean
          has_natural_light: boolean
          has_projector: boolean
          has_smart_board: boolean
          has_whiteboard: boolean
          inspected_by: string | null
          last_inspected_at: string | null
          noise_vibe: Database["public"]["Enums"]["noise_vibe"]
          room_id: string
          sockets_total: number
          sockets_working: number
          updated_at: string
          wifi_band: Database["public"]["Enums"]["wifi_band"] | null
          wifi_label_raw: string | null
          wifi_mbps: number | null
        }
        Insert: {
          ac_setpoint_c?: number | null
          ac_type?: string | null
          comfort_score?: number | null
          has_ac?: boolean
          has_natural_light?: boolean
          has_projector?: boolean
          has_smart_board?: boolean
          has_whiteboard?: boolean
          inspected_by?: string | null
          last_inspected_at?: string | null
          noise_vibe?: Database["public"]["Enums"]["noise_vibe"]
          room_id: string
          sockets_total?: number
          sockets_working?: number
          updated_at?: string
          wifi_band?: Database["public"]["Enums"]["wifi_band"] | null
          wifi_label_raw?: string | null
          wifi_mbps?: number | null
        }
        Update: {
          ac_setpoint_c?: number | null
          ac_type?: string | null
          comfort_score?: number | null
          has_ac?: boolean
          has_natural_light?: boolean
          has_projector?: boolean
          has_smart_board?: boolean
          has_whiteboard?: boolean
          inspected_by?: string | null
          last_inspected_at?: string | null
          noise_vibe?: Database["public"]["Enums"]["noise_vibe"]
          room_id?: string
          sockets_total?: number
          sockets_working?: number
          updated_at?: string
          wifi_band?: Database["public"]["Enums"]["wifi_band"] | null
          wifi_label_raw?: string | null
          wifi_mbps?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "room_infrastructure_inspected_by_fkey"
            columns: ["inspected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_infrastructure_inspected_by_fkey"
            columns: ["inspected_by"]
            isOneToOne: false
            referencedRelation: "v_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_infrastructure_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: true
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_infrastructure_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: true
            referencedRelation: "v_room_live_status"
            referencedColumns: ["room_id"]
          },
        ]
      }
      rooms: {
        Row: {
          block_id: string
          capacity: number
          catalog_amenities: string[]
          catalog_best_for: string[]
          category: Database["public"]["Enums"]["room_category"]
          code: string
          created_at: string
          description: string | null
          directions: string | null
          floor_id: string
          id: string
          is_accessible: boolean
          is_active: boolean
          is_bookable: boolean
          map_h: number | null
          map_w: number | null
          map_x: number | null
          map_y: number | null
          name: string
          slug: string
          updated_at: string
          wing: Database["public"]["Enums"]["wing_type"]
        }
        Insert: {
          block_id: string
          capacity: number
          catalog_amenities?: string[]
          catalog_best_for?: string[]
          category: Database["public"]["Enums"]["room_category"]
          code: string
          created_at?: string
          description?: string | null
          directions?: string | null
          floor_id: string
          id?: string
          is_accessible?: boolean
          is_active?: boolean
          is_bookable?: boolean
          map_h?: number | null
          map_w?: number | null
          map_x?: number | null
          map_y?: number | null
          name: string
          slug: string
          updated_at?: string
          wing: Database["public"]["Enums"]["wing_type"]
        }
        Update: {
          block_id?: string
          capacity?: number
          catalog_amenities?: string[]
          catalog_best_for?: string[]
          category?: Database["public"]["Enums"]["room_category"]
          code?: string
          created_at?: string
          description?: string | null
          directions?: string | null
          floor_id?: string
          id?: string
          is_accessible?: boolean
          is_active?: boolean
          is_bookable?: boolean
          map_h?: number | null
          map_w?: number | null
          map_x?: number | null
          map_y?: number | null
          name?: string
          slug?: string
          updated_at?: string
          wing?: Database["public"]["Enums"]["wing_type"]
        }
        Relationships: [
          {
            foreignKeyName: "rooms_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_floor_id_fkey"
            columns: ["floor_id"]
            isOneToOne: false
            referencedRelation: "floors"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_exceptions: {
        Row: {
          created_at: string
          created_by: string | null
          end_time: string | null
          exception_date: string
          id: string
          kind: Database["public"]["Enums"]["exception_kind"]
          reason: string
          room_id: string | null
          start_time: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_time?: string | null
          exception_date: string
          id?: string
          kind: Database["public"]["Enums"]["exception_kind"]
          reason: string
          room_id?: string | null
          start_time?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_time?: string | null
          exception_date?: string
          id?: string
          kind?: Database["public"]["Enums"]["exception_kind"]
          reason?: string
          room_id?: string | null
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_exceptions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_exceptions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_exceptions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_exceptions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_live_status"
            referencedColumns: ["room_id"]
          },
        ]
      }
      timetable_slots: {
        Row: {
          batch: string | null
          course_id: string | null
          created_at: string
          day_of_week: number
          end_time: string
          faculty_id: string | null
          id: string
          kind: Database["public"]["Enums"]["slot_kind"]
          room_id: string
          start_time: string
          title_override: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          batch?: string | null
          course_id?: string | null
          created_at?: string
          day_of_week: number
          end_time: string
          faculty_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["slot_kind"]
          room_id: string
          start_time: string
          title_override?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          batch?: string | null
          course_id?: string | null
          created_at?: string
          day_of_week?: number
          end_time?: string
          faculty_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["slot_kind"]
          room_id?: string
          start_time?: string
          title_override?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timetable_slots_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_slots_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_slots_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_slots_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_live_status"
            referencedColumns: ["room_id"]
          },
        ]
      }
    }
    Views: {
      v_checkin_feed: {
        Row: {
          ac_comfort: Database["public"]["Enums"]["ac_comfort"] | null
          created_at: string | null
          crowd_density: Database["public"]["Enums"]["crowd_density"] | null
          display_name: string | null
          expires_at: string | null
          helpful_count: number | null
          id: string | null
          is_live: boolean | null
          is_simulated: boolean | null
          note: string | null
          purpose: Database["public"]["Enums"]["checkin_purpose"] | null
          room_code: string | null
          room_id: string | null
          room_name: string | null
          socket_availability:
            | Database["public"]["Enums"]["socket_availability"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_live_status"
            referencedColumns: ["room_id"]
          },
        ]
      }
      v_floor_summary: {
        Row: {
          avg_comfort: number | null
          block_code: string | null
          busy_rooms: number | null
          floor_label: string | null
          floor_level: number | null
          free_rooms: number | null
          soon_rooms: number | null
          total_rooms: number | null
          working_sockets: number | null
        }
        Relationships: []
      }
      v_public_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          full_name: string | null
          id: string | null
          karma: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          semester: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          full_name?: string | null
          id?: string | null
          karma?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          semester?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          full_name?: string | null
          id?: string | null
          karma?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          semester?: string | null
        }
        Relationships: []
      }
      v_room_live_status: {
        Row: {
          ac_type: string | null
          as_of_date: string | null
          as_of_time: string | null
          block_code: string | null
          block_name: string | null
          capacity: number | null
          category: Database["public"]["Enums"]["room_category"] | null
          code: string | null
          comfort_score: number | null
          computed_at: string | null
          confidence: string | null
          crowd_density: Database["public"]["Enums"]["crowd_density"] | null
          current_batch: string | null
          current_course_code: string | null
          current_faculty: string | null
          current_occupancy_kind: string | null
          current_occupancy_title: string | null
          floor_label: string | null
          floor_level: number | null
          free_minutes: number | null
          has_ac: boolean | null
          has_projector: boolean | null
          has_smart_board: boolean | null
          has_whiteboard: boolean | null
          is_accessible: boolean | null
          is_free_now: boolean | null
          last_report_at: string | null
          map_h: number | null
          map_w: number | null
          map_x: number | null
          map_y: number | null
          name: string | null
          next_occupancy_from: string | null
          next_occupancy_title: string | null
          noise_vibe: Database["public"]["Enums"]["noise_vibe"] | null
          occupied_until: string | null
          open_issue_count: number | null
          report_count: number | null
          room_id: string | null
          slug: string | null
          sockets_total: number | null
          sockets_working: number | null
          status: string | null
          wifi_band: Database["public"]["Enums"]["wifi_band"] | null
          wifi_mbps: number | null
          wing: Database["public"]["Enums"]["wing_type"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      award_karma: {
        Args: { p_points: number; p_user: string }
        Returns: undefined
      }
      fn_campus_tz: { Args: never; Returns: string }
      fn_is_admin: { Args: never; Returns: boolean }
      fn_is_staff: { Args: never; Returns: boolean }
      fn_room_day: {
        Args: { p_date: string; p_room_id?: string }
        Returns: {
          batch: string
          code: string
          course_code: string
          faculty_name: string
          is_current: boolean
          is_past: boolean
          kind: string
          room_id: string
          slot_end: string
          slot_start: string
          source: string
          title: string
        }[]
      }
      fn_room_occupancy: {
        Args: { p_date: string }
        Returns: {
          batch: string
          course_code: string
          end_time: string
          faculty_name: string
          kind: string
          room_id: string
          source: string
          start_time: string
          title: string
        }[]
      }
    }
    Enums: {
      ac_comfort: "freezing" | "comfortable" | "warm" | "off"
      checkin_purpose: "study" | "group" | "charging" | "break" | "class"
      crowd_density: "empty" | "light" | "moderate" | "crowded" | "full"
      event_category:
        | "fest"
        | "workshop"
        | "seminar"
        | "exam"
        | "club"
        | "sports"
        | "cultural"
        | "other"
      exception_kind: "holiday" | "maintenance" | "event" | "exam" | "blocked"
      feature_kind: "amenity" | "best_for"
      issue_category:
        | "power"
        | "ac"
        | "wifi"
        | "projector"
        | "noise"
        | "cleanliness"
        | "seating"
        | "furniture"
        | "other"
      issue_status:
        | "open"
        | "acknowledged"
        | "assigned"
        | "in_progress"
        | "resolved"
        | "rejected"
      issue_urgency: "low" | "medium" | "high" | "critical"
      noise_vibe: "silent" | "moderate" | "collaborative" | "quick_break"
      room_category:
        | "smart_classroom"
        | "computer_lab"
        | "silent_study_pod"
        | "seminar_amphitheatre"
        | "innovation_studio"
      slot_kind:
        | "lecture"
        | "lab"
        | "tutorial"
        | "workshop"
        | "seminar"
        | "exam"
      socket_availability: "plenty" | "limited" | "none"
      user_role: "student" | "faculty" | "staff" | "admin"
      wifi_band: "wifi_6e" | "wifi_5" | "wifi_4"
      wing_type: "west" | "central" | "east"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      ac_comfort: ["freezing", "comfortable", "warm", "off"],
      checkin_purpose: ["study", "group", "charging", "break", "class"],
      crowd_density: ["empty", "light", "moderate", "crowded", "full"],
      event_category: [
        "fest",
        "workshop",
        "seminar",
        "exam",
        "club",
        "sports",
        "cultural",
        "other",
      ],
      exception_kind: ["holiday", "maintenance", "event", "exam", "blocked"],
      feature_kind: ["amenity", "best_for"],
      issue_category: [
        "power",
        "ac",
        "wifi",
        "projector",
        "noise",
        "cleanliness",
        "seating",
        "furniture",
        "other",
      ],
      issue_status: [
        "open",
        "acknowledged",
        "assigned",
        "in_progress",
        "resolved",
        "rejected",
      ],
      issue_urgency: ["low", "medium", "high", "critical"],
      noise_vibe: ["silent", "moderate", "collaborative", "quick_break"],
      room_category: [
        "smart_classroom",
        "computer_lab",
        "silent_study_pod",
        "seminar_amphitheatre",
        "innovation_studio",
      ],
      slot_kind: ["lecture", "lab", "tutorial", "workshop", "seminar", "exam"],
      socket_availability: ["plenty", "limited", "none"],
      user_role: ["student", "faculty", "staff", "admin"],
      wifi_band: ["wifi_6e", "wifi_5", "wifi_4"],
      wing_type: ["west", "central", "east"],
    },
  },
} as const
