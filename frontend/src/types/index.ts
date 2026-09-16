export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CONSUMER' | 'INDUSTRY_USER' | 'ADMIN';
  organization?: string;
  industryType?: string;
}

export interface CitationItem {
  id: string;
  sourceType: string;
  identifier: string;
  title: string;
  clauseRef?: string;
  sourceUrl?: string;
  isMandatoryQCO?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  language?: string;
  intent?: string;
  citations?: CitationItem[];
  confidence?: number;
  suggestedQuestions?: string[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
}

export interface Standard {
  id: string;
  isNumber: string;
  standardNo: string;
  year: number;
  title: string;
  hindiTitle?: string;
  scope: string;
  icsCode?: string;
  sector: string;
  isMandatoryQCO: boolean;
  qcoNotification?: string;
  schemeType: string;
  keyRequirements?: string[];
  applicableProducts?: string[];
  sampleSize?: string;
  testingDays?: number;
  amendmentsCount: number;
  sourceUrl?: string;
  relatedProducts?: Product[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  hsCode?: string;
  applicableStandard: string;
  isMandatory: boolean;
  scheme: string;
  description?: string;
  estimatedFee?: string;
  matchingStandard?: Standard;
}

export interface CertificationScheme {
  id: string;
  schemeCode: string;
  title: string;
  hindiTitle: string;
  description: string;
  eligibleEntities: string;
  procedureSteps: { stepNo: number; title: string; description: string; timeEstimate: string }[];
  requiredDocuments: { docName: string; format: string; isMandatory: boolean }[];
  portalUrl: string;
  feeStructure?: { applicationFee: string; inspectionFee: string; markingFee: string };
}

export interface ComplianceRoadmap {
  standardNo: string;
  title: string;
  productName: string;
  isMandatoryQCO: boolean;
  estimatedTimeline: string;
  scale: string;
  roadmapSteps: { phase: string; tasks: string[] }[];
  requiredDocuments: string[];
  keyTestParameters: string[];
}

export interface GrievanceGuide {
  id: string;
  topic: string;
  category: string;
  description: string;
  stepsToReport: string[];
  bisCareAppAction: string;
  legalProvisions: string;
  contactHelpline: string;
  onlinePortalUrl: string;
}

export interface TelemetryStats {
  totalDocuments: number;
  totalVersions: number;
  totalChunks: number;
  totalSources: number;
  totalUsers: number;
  totalConversations: number;
  totalQueries: number;
  avgLatencyMs: number;
  avgGroundingScore: number;
  recentJobs: any[];
}

export interface IngestionJob {
  id: string;
  jobType: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  totalSources: number;
  processedDocs: number;
  newDocs: number;
  updatedDocs: number;
  failedDocs: number;
  chunksCreated: number;
  errorMessage?: string;
  logs?: { timestamp: string; level: string; message: string }[];
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}
