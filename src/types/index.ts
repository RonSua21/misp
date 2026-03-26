// ─────────────────────────────────────────────
//  MISP — Shared TypeScript types
// ─────────────────────────────────────────────

export type Role = "SUPER_ADMIN" | "ADMIN" | "REGISTERED_USER" | "GUEST";

export type ApplicationStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "DISBURSED";

export type BenefitCategory =
  | "FINANCIAL_ASSISTANCE"
  | "MEDICAL_ASSISTANCE"
  | "SENIOR_CITIZEN"
  | "PWD_ASSISTANCE";

export type DocumentType =
  | "VALID_ID"
  | "PROOF_OF_RESIDENCY"
  | "MEDICAL_CERTIFICATE"
  | "PWD_ID"
  | "SENIOR_CITIZEN_ID"
  | "INCOME_CERTIFICATE"
  | "BIRTH_CERTIFICATE"
  | "OTHER";

export type DocumentStatus = "PENDING" | "VERIFIED" | "REJECTED";

// ─── Auth / Session ────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  supabaseId: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  contactNumber?: string;
  role: Role;
  barangay?: string;
  residencyVerified: boolean;
  consentGiven: boolean;
}

// ─── Application ──────────────────────────────────────────────────────────

export interface Application {
  id: string;
  referenceNumber: string;
  userId: string;
  benefitProgramId: string;
  status: ApplicationStatus;
  applicantName: string;
  applicantContact?: string;
  applicantBarangay?: string;
  purpose: string;
  amountRequested?: number;
  amountApproved?: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  benefitProgram?: BenefitProgram;
}

// ─── Benefit Program ──────────────────────────────────────────────────────

export interface BenefitProgram {
  id: string;
  name: string;
  category: BenefitCategory;
  description: string;
  requirements: string[];
  maxAmount?: number;
  isActive: boolean;
}

// ─── Document ─────────────────────────────────────────────────────────────

export interface Document {
  id: string;
  userId: string;
  applicationId?: string;
  type: DocumentType;
  status: DocumentStatus;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  expiresAt?: string;
  createdAt: string;
}

// ─── Residency ────────────────────────────────────────────────────────────

export interface ResidencyVerification {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  address: string;
  isWithinMakati: boolean;
  verifiedAt: string;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────

export interface DashboardStats {
  totalApplications: number;
  pending: number;
  underReview: number;
  approved: number;
  rejected: number;
  disbursed: number;
}

// ─── Disaster & Relief ────────────────────────────────────────────────────────

export type DisasterType =
  | "TYPHOON"
  | "FIRE"
  | "FLOOD"
  | "EARTHQUAKE"
  | "LANDSLIDE"
  | "OTHER";

export type IncidentStatus = "ACTIVE" | "MONITORING" | "RESOLVED";

export interface DisasterIncident {
  id: string;
  title: string;
  type: DisasterType;
  description?: string;
  barangay?: string;
  status: IncidentStatus;
  reportedAt: string;
  resolvedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  evacuationCenters?: EvacuationCenter[];
  reliefInventory?: ReliefInventory[];
}

export interface EvacuationCenter {
  id: string;
  disasterIncidentId?: string;
  name: string;
  address: string;
  barangay: string;
  capacity: number;
  currentHeadcount: number;
  isOpen: boolean;
  latitude?: number;
  longitude?: number;
  contactPerson?: string;
  contactNumber?: string;
  createdAt: string;
  updatedAt: string;
  evacuees?: Evacuee[];
}

export interface Evacuee {
  id: string;
  evacuationCenterId: string;
  name: string;
  age?: number;
  barangay?: string;
  headCount: number;
  registeredAt: string;
}

export interface ReliefInventory {
  id: string;
  disasterIncidentId?: string;
  itemName: string;
  unit: string;
  quantityAvailable: number;
  quantityDistributed: number;
  barangay?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
