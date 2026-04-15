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

// ─── MSWD Workflow Enums ───────────────────────────────────────────────────

export type VoterStatus = "ACTIVE" | "INACTIVE" | "UNKNOWN";

/** 0=pending MAC, 1=MAC done/pending MSWD, 2=MSWD done/pending Mayor, 3=fully approved */
export type ApprovalLevel = 0 | 1 | 2 | 3;

export type RejectionCode =
  | "VOTER_INACTIVE"
  | "INCOMPLETE_DOCS"
  | "NOT_ELIGIBLE"
  | "ORIENTATION_REQUIRED"
  | "FAILED_HOME_VISIT"
  | "OTHER";

export type TenurialStatus = "OWNER" | "RENTER" | "SHARER" | "BEDSPACER";

export type DisburseMethod = "CASH" | "MAKATIZEN_CARD" | "GCASH";

export type PayrollBatchStatus =
  | "DRAFT"
  | "PENDING_MAC"
  | "PENDING_MSWD"
  | "PENDING_MAYOR"
  | "APPROVED"
  | "DISBURSED"
  | "REJECTED";

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
  amountApproved?: number;
  remarks?: string;
  // MSWD multi-level approval fields
  voterStatus?: VoterStatus;
  approvalLevel?: ApprovalLevel;
  rejectionCode?: RejectionCode;
  orientationAttended?: boolean;
  homeVisitRequired?: boolean;
  homeVisitDate?: string;
  homeVisitNotes?: string;
  macApprovedAt?: string;
  mswdApprovedAt?: string;
  mayorApprovedAt?: string;
  disbursementMethod?: DisburseMethod;
  prpwdEncoded?: boolean;
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
  // DAFAC fields
  dafacNumber?: string;
  tenurialStatus?: TenurialStatus;
  assistanceAmount?: number;
  isSenior?: boolean;
  isPwd?: boolean;
  isPregnant?: boolean;
  disbursed?: boolean;
  disbursedAt?: string;
  disbursementMethod?: DisburseMethod;
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

// ─── DAFAC Config ─────────────────────────────────────────────────────────

export interface DafacConfig {
  id: string;
  tenurialStatus: TenurialStatus;
  amount: number;
  updatedAt: string;
}

// ─── Payroll ──────────────────────────────────────────────────────────────

export interface PayrollBatch {
  id: string;
  incidentId: string;
  batchNumber: string;
  status: PayrollBatchStatus;
  totalAmount: number;
  rejectionReason?: string;
  macApprovedAt?: string;
  mswdApprovedAt?: string;
  mayorApprovedAt?: string;
  disbursedAt?: string;
  createdAt: string;
  items?: PayrollItem[];
}

export interface PayrollItem {
  id: string;
  batchId: string;
  evacueeId: string;
  amount: number;
  disburseMethod: DisburseMethod;
  disbursedAt?: string;
  evacuee?: Evacuee;
}

// ─── Relief Voucher ───────────────────────────────────────────────────────

export interface ReliefVoucher {
  id: string;
  voucherCode: string;
  evacueeId: string;
  inventoryId: string;
  quantity: number;
  redeemed: boolean;
  redeemedAt?: string;
  issuedAt: string;
  evacuee?: Evacuee;
  inventory?: ReliefInventory;
}

// ─── Audit Photo ──────────────────────────────────────────────────────────

export interface AuditPhoto {
  id: string;
  entityType: "APPLICATION" | "DISBURSEMENT" | "DISTRIBUTION";
  entityId: string;
  fileUrl: string;
  latitude?: number;
  longitude?: number;
  takenAt: string;
}

// ─── ID Issuance ──────────────────────────────────────────────────────────

export interface IdIssuance {
  id: string;
  applicationId: string;
  userId: string;
  bookletType: "MEDICINE" | "GROCERY" | "MOVIE";
  bookletNumber?: string;
  claimDate?: string;
  signatureUrl?: string;
  issuedBy: string;
  createdAt: string;
}
