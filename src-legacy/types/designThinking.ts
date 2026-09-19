export interface SurveyChartData {
  label: string;
  value: number;
  color: string;
}

export interface SurveyMetric {
  id: string;
  category: string;
  question: string;
  sampleSize: number;
  percentage: number;
  highlight: string;
  chartData: SurveyChartData[];
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
  techSavviness: 'Expert' | 'High' | 'Moderate' | 'Basic';
  painPoints: string[];
  goals: string[];
  dailyRoutine: string[];
  preferredSpaces: string[];
  frustrations: string[];
  deviceEcosystem: string[];
  studyHabits: string[];
}

export interface EmpathyMapContent {
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
  empathy: EmpathyMapContent;
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
  block: string;
  floor: number;
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
