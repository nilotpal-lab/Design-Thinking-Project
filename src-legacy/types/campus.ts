export type NavTabId =
  | 'explorer'
  | 'floor-map'
  | 'map'
  | 'matcher'
  | 'crowd-issues'
  | 'crowd'
  | 'case-study';

export type DayPeriod =
  | 'Morning Lecture Block'
  | 'Mid-Morning Break'
  | 'Afternoon Lecture Block'
  | 'Lunch Hour'
  | 'Post-Lunch Lab Block'
  | 'Evening Study & Project Hours'
  | string;

export type NoiseVibe =
  | 'Silent Study'
  | 'Moderate / Group Work'
  | 'Collaborative Buzz'
  | 'Pin Drop Quiet'
  | 'Quick Break'
  | 'silent'
  | 'moderate'
  | 'collaborative'
  | 'loud'
  | string;

export type StudyVibe =
  | 'Silent'
  | 'Group'
  | 'Chill'
  | 'Collaborative'
  | 'Silent Study'
  | 'Quiet Zone'
  | 'Discussion'
  | 'Quick Break'
  | 'Lecture'
  | 'Social'
  | string;

export type ACType =
  | 'Central AC (19°C - 21°C)'
  | 'Dual Split AC'
  | 'Natural Air + High Velocity Fans'
  | 'Smart Inverter AC'
  | string;

export type ACStatus =
  | 'Optimal (21°C)'
  | 'Chilled (18°C)'
  | 'Chilled (19°C)'
  | 'Warm'
  | 'Fan Only'
  | string;

export type SlotStatus = 'occupied' | 'free' | 'reserved' | 'break' | 'busy' | 'soon' | string;

export type RoomStatus = 'free' | 'soon' | 'busy' | 'occupied' | 'reserved' | 'maintenance' | string;

export type PriorityType =
  | 'charging'
  | 'ac'
  | 'silent'
  | 'quiet'
  | 'group'
  | 'wifi'
  | 'projector'
  | 'proximity'
  | string;

export type IssueCategory =
  | 'socket'
  | 'ac'
  | 'wifi'
  | 'projector'
  | 'noise'
  | 'cleanliness'
  | 'seating'
  | 'power'
  | 'marker'
  | 'furniture'
  | 'Power Sockets'
  | 'AC / Cooling'
  | 'Smart Board / Projector'
  | 'Cleanliness'
  | 'Noise Disturbance'
  | 'other'
  | string;

export type IssueStatus =
  | 'open'
  | 'investigating'
  | 'resolved'
  | 'acknowledged'
  | 'Pending'
  | 'In Review'
  | 'Assigned'
  | 'Resolved'
  | 'Open'
  | 'In Progress'
  | 'Dispatched'
  | string;

export type IssueUrgency =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'
  | 'Low'
  | 'Medium'
  | 'High'
  | 'Critical'
  | 'Urgent'
  | string;

export type CrowdDensity =
  | 'low'
  | 'moderate'
  | 'high'
  | 'full'
  | 'Empty'
  | 'Moderate'
  | 'Packed'
  | string;

export type ACComfort =
  | 'chilled'
  | 'optimal'
  | 'warm'
  | 'off'
  | 'Freezing'
  | 'Comfortable'
  | 'Warm'
  | 'AC Off'
  | string;

export type SocketStatus =
  | 'plenty'
  | 'few'
  | 'none'
  | 'Plenty'
  | 'Limited'
  | 'None'
  | string;

export interface ScheduleSlot {
  id: string;
  startTime: string; // e.g. "08:30"
  endTime: string;   // e.g. "09:30"
  timeSlot?: string;  // e.g. "08:30 - 09:30 AM"
  status?: SlotStatus;
  title: string;
  type?: 'lecture' | 'lab' | 'tutorial' | 'free' | 'workshop' | 'class' | 'study' | 'seminar' | string;
  isOccupied?: boolean;
  isCurrent?: boolean;
  instructor?: string;
  faculty?: string;
  department?: string;
  courseCode?: string;
  batch?: string;
  roomType?: string;
}

export interface InfrastructureChecklist {
  socketsWorking: boolean;
  socketsDetail: string;
  acFunctional: boolean;
  acDetail: string;
  projectorFunctional: boolean;
  projectorDetail: string;
  wifiSpeedMbps?: number;
  cleanliness: string;
  lastInspectedTime: string;
  inspectorName?: string;
}

export interface RoomComfortFactors {
  ac?: number;
  sockets?: number;
  quietness?: number;
  seating?: number;
  lighting?: number;
}

export interface RoomAmenities {
  hasAC: boolean;
  acTemperature?: number;
  powerSockets: number;
  availableSockets: number;
  wifiSpeedMbps: number;
  hasProjector: boolean;
  hasWhiteboard: boolean;
  hasNaturalLight: boolean;
  noiseLevel: 'silent' | 'moderate' | 'collaborative' | 'loud' | 'quiet' | string;
  noiseDb?: number;
}

export type AmenityInfo = RoomAmenities;

export interface RoomPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  wing?: string;
  shape?: 'rect' | 'circle' | 'polygon';
}

export interface Room {
  id: string;
  code: string;
  name: string;
  block?: 'Block A' | 'Block B' | string;
  floor: number;
  floorName?: string;
  floorLabel?: string;
  department?: string;
  status?: RoomStatus;
  statusText?: string;
  capacity?: number;
  seatsTotal?: number;
  seatsOccupied?: number;
  seatsAvailable?: number;
  chargingPoints?: number;
  socketCount?: number;
  totalSockets?: number;
  workingSockets?: number;
  hasAC?: boolean;
  acType?: ACType;
  acStatus?: ACStatus;
  hasProjector?: boolean;
  hasSmartBoard?: boolean;
  projector?: boolean;
  whiteboard?: boolean;
  hasWhiteboard?: boolean;
  naturalLight?: boolean;
  wifiSpeed?: string;
  wifiStrength?: string;
  noiseVibe?: NoiseVibe;
  comfortScore?: number;
  comfortFactors?: RoomComfortFactors;
  currentOccupancy?: number;
  crowdLevel?: string;
  isOccupied?: boolean;
  currentOccupant?: string;
  occupiedUntil?: string;
  freeDurationText?: string;
  liveCheckIns?: number;
  directions?: string;
  directionsHint?: string;
  landmarks?: string[];
  schedule?: ScheduleSlot[];
  todaySchedule?: ScheduleSlot[];
  infrastructureChecklist?: InfrastructureChecklist;
  amenities?: RoomAmenities | string[];
  position?: RoomPosition;
  isPopular?: boolean;
  tags?: string[];
  rating?: number;
  reviewsCount?: number;
  bestFor?: string[];
  description?: string;
}

export interface CampusRoom {
  id: string;
  name: string;
  code: string;
  block: string;
  floor: number;
  capacity: number;
  type: string;
  hasAC: boolean;
  hasProjector: boolean;
  totalSockets: number;
  workingSockets: number;
  hasWhiteboard: boolean;
  isAccessible: boolean;
  defaultQuietZone: boolean;
  isOccupied?: boolean;
  comfortScore?: number;
  schedule?: ScheduleSlot[];
  image?: string;
}

export interface FloorInfo {
  id: number;
  name: string;
  label: string;
  subtitle: string;
  totalRooms: number;
  freeRoomsCount: number;
  soonRoomsCount: number;
  busyRoomsCount: number;
  highlightAmenities: string[];
}

export interface CheckIn {
  id: string;
  roomId: string;
  roomCode?: string;
  roomName: string;
  studentName: string;
  studentAvatar?: string;
  checkInTime?: string;
  timestamp?: string;
  durationMinutes?: number;
  purpose?: 'study' | 'group' | 'charging' | 'break' | 'class' | string;
  isAnonymous?: boolean;
  comment?: string;
  helpfulCount?: number;
  crowdDensity?: CrowdDensity;
  acComfort?: ACComfort;
  socketAvailability?: SocketStatus;
  studyVibe?: NoiseVibe | StudyVibe | string;
  note?: string;
  isVerifiedStudent?: boolean;
}

export interface ReportedIssue {
  id: string;
  roomId: string;
  roomCode?: string;
  roomName?: string;
  category: IssueCategory;
  title?: string;
  issueType?: string;
  description: string;
  urgency: IssueUrgency;
  status: IssueStatus;
  reportedAt?: string;
  createdAt?: string;
  reportedBy?: string;
  reporterName?: string;
  reporterRole?: string;
  upvotes?: number;
  upvotedByMe?: boolean;
  locationDetail?: string;
  assignedStaff?: string;
  estimatedResolutionMinutes?: number;
  photoUrl?: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface RoomTelemetry {
  roomId: string;
  roomName?: string;
  simulatedTimeMinutes?: number;
  isOccupied?: boolean;
  currentClass?: string;
  currentFaculty?: string;
  occupiedUntil?: string;
  nextFreeTime?: string;
  availableSeats?: number;
  availableSockets?: number;
  crowdDensity: CrowdDensity;
  estimatedOccupancyPercent?: number;
  acComfort: ACComfort;
  socketAvailability?: SocketStatus;
  socketStatus?: SocketStatus;
  workingSockets?: number;
  totalSockets?: number;
  lastUpdated?: string;
  activeCheckInCount?: number;
  confidenceScore?: 'High' | 'Medium' | 'Low' | string;
  activeIssuesCount?: number;
  noiseLevel?: string;
  noiseDb?: number;
  temperatureC?: number;
}

export interface MatchFilterPreferences {
  groupSize: 'solo' | 'duo' | 'group' | number | string;
  duration: '30m' | '1h' | '2h+' | '4h+' | '2h' | '3h+' | 'all-day' | string;
  priority: PriorityType;
  floorPreference?: 'any' | number | string;
  preferredFloor?: 'all' | '0' | '1' | '2' | '3' | '4' | string;
  needProjector?: boolean;
  needWhiteboard?: boolean;
}

export interface MatchResult {
  room: Room;
  matchScore: number;
  matchReasons: string[];
  rank: number;
  walkingMinutes: number;
  badgeLabel?: string;
  bestFeature?: string;
  tag?: string;
}

export interface LiveCampusMetrics {
  totalRooms: number;
  freeRoomsCount: number;
  occupiedRoomsCount: number;
  totalSockets: number;
  freeSocketsCount: number;
  avgComfortScore: number;
  simulatedTimeMinutes: number;
  isSimulating: boolean;
  dayPeriod: DayPeriod;
}

export interface IssueReportPayload {
  roomId: string;
  roomCode: string;
  category: IssueCategory;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical' | string;
  studentName?: string;
}

// ==========================================
// Design Thinking Framework Types
// ==========================================

export interface SurveyChartItem {
  label: string;
  value: number;
  color?: string;
}

export interface SurveyMetric {
  id: string;
  category: string;
  question: string;
  sampleSize: number;
  percentage: number;
  highlight: string;
  chartData: SurveyChartItem[];
  keyInsight: string;
  designImplication: string;
}

export interface UserPersona {
  id: string;
  name: string;
  age: number;
  role: string;
  semester: string;
  department: string;
  avatar: string;
  archetype: string;
  quote: string;
  bio: string;
  coreNeed: string;
  techSavviness: string;
  painPoints: string[];
  goals: string[];
  dailyRoutine?: string[];
  preferredSpaces?: string[];
  frustrations?: string[];
  deviceEcosystem?: string[];
  studyHabits?: string[] | string;
}

export interface EmpathyMapDetails {
  says: string[];
  thinks: string[];
  does: string[];
  feels: string[];
  pains: string[];
  gains: string[];
}

export interface EmpathyMapData {
  personaId: string;
  personaName: string;
  targetRole: string;
  empathy: EmpathyMapDetails;
}

export interface StageMetric {
  label: string;
  value: string;
  change: string;
}

export interface DesignStage {
  id: string;
  stageNumber: number;
  name: string;
  title: string;
  subtitle: string;
  iconName: string;
  description: string;
  keyActivities: string[];
  deliverables: string[];
  findings: string[];
  metrics: StageMetric[];
}

export interface IssueReport {
  id: string;
  roomId: string;
  roomName: string;
  block?: string;
  floor?: number;
  category: string;
  description: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  reportedAt: string;
  status: 'Pending' | 'In Review' | 'Assigned' | 'Resolved' | string;
  upvotes: number;
  anonymous?: boolean;
  reporterName?: string;
  reporterRole?: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface CrowdReport {
  id: string;
  roomId: string;
  roomName: string;
  crowdLevel: string;
  estimatedOccupancy: number;
  noiseLevel: string;
  timestamp: string;
  reportedBy: string;
  isVerified: boolean;
}
