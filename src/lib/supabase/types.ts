import type { Database } from '@/types/database';

export type Tables = Database['public']['Tables'];
export type Views = Database['public']['Views'];

export type RoomRow = Tables['rooms']['Row'];
export type InfrastructureRow = Tables['room_infrastructure']['Row'];
export type FeatureRow = Tables['features']['Row'];
export type BlockRow = Tables['blocks']['Row'];
export type FloorRow = Tables['floors']['Row'];
export type CheckInRow = Tables['check_ins']['Row'];
export type IssueRow = Tables['issues']['Row'];
export type ProfileRow = Tables['profiles']['Row'];

export type RoomLiveStatus = Views['v_room_live_status']['Row'];
export type FloorSummary = Views['v_floor_summary']['Row'];

// Enum unions, derived from the database so they can never drift from it.
export type UserRole = Tables['profiles']['Row']['role'];
export type NoiseVibe = Tables['room_infrastructure']['Row']['noise_vibe'];
export type WifiBand = Tables['room_infrastructure']['Row']['wifi_band'];
export type CheckinPurpose = Tables['check_ins']['Row']['purpose'];
export type IssueCategory = Tables['issues']['Row']['category'];
export type IssueUrgency = Tables['issues']['Row']['urgency'];
export type IssueStatus = Tables['issues']['Row']['status'];
export type RoomCategory = Tables['rooms']['Row']['category'];
export type WingType = Tables['rooms']['Row']['wing'];
