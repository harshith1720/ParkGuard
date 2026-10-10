export type UserRole = 'OWNER' | 'OFFICER' | 'ADMIN';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentOrEmployeeId?: string;
  phone?: string; // Indian format e.g. +91 98765 43210
  registeredPlates?: string[]; // e.g. KA 01 AB 1234
  badgeId?: string;
  assignedZone?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export type VehicleType = 
  | 'Two-Wheeler / Motorcycle / Scooter'
  | 'Hatchback' 
  | 'Sedan' 
  | 'SUV' 
  | 'Electric Vehicle (EV)' 
  | 'Commercial Delivery Van' 
  | 'Auto-Rickshaw / Campus Shuttle';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type ViolationStatus = 
  | 'Reported' 
  | 'Under Review' 
  | 'Confirmed' 
  | 'Fine Pending' 
  | 'Paid' 
  | 'Appealed' 
  | 'Resolved';

export type ViolationCategory = 
  | 'Unauthorized Parking in Resident / Faculty Bay'
  | 'Blocking Fire Hydrant / Emergency Evacuation Route'
  | 'Tow-Away / Yellow Line Obstruction'
  | 'Unauthorized Non-EV in EV Fast Charging Bay'
  | 'Double Parking Obstructing Transit Corridor'
  | 'Disabled Parking (Divyangjan Reserved Bay) Violation'
  | 'Overnight Parking without Security Token'
  | 'Commercial Delivery Dock Obstruction';

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  capturedAt: string;
}

export interface ParkingZone {
  id: string;
  name: string;
  code: string;
  type: 'deck' | 'surface_lot' | 'street' | 'loading';
  capacity: number;
  currentOccupancy: number;
  activeViolations: number;
  enforcementHours: string;
  fineMultiplier: number;
  status: 'Active' | 'High Alert' | 'Maintenance';
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

export interface ViolationPayment {
  paidAt: string;
  paymentMethod: 'Razorpay UPI' | 'Razorpay NetBanking' | 'Razorpay Card (Test Mode)' | 'Campus Bursar Desk';
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  receiptNumber: string;
  amountPaise: number;
  amountRupees: number;
  currency: 'INR';
  isTestMode: boolean;
  verifiedByBackend: boolean;
  processedBy: string;
}

export interface ViolationAppeal {
  appealedAt: string;
  reason: string;
  evidenceUrl?: string;
  status: 'Pending' | 'Granted' | 'Denied';
  reviewedBy?: string;
  reviewedAt?: string;
  responseNotes?: string;
}

export interface SupervisorReview {
  reviewer: string;
  reviewedAt: string;
  remarks: string;
  approved: boolean;
}

export interface Violation {
  id: string;
  vehiclePlate: string; // e.g. KA 01 AB 1234
  vehicleState: string; // e.g. Karnataka (KA)
  vehicleType: VehicleType;
  vehicleMakeModel: string;
  zoneId: string;
  zoneName: string;
  specificLocation: string;
  category: ViolationCategory;
  severity: SeverityLevel;
  timestamp: string; // ISO string in IST context
  officerBadge: string;
  officerName: string;
  reportedByOfficerId?: string;
  notes: string;
  photoUrl: string;
  fineAmount: number; // in INR rupees
  fineAmountPaise: number; // in paise
  status: ViolationStatus;
  
  // Authority & Law
  issuingAuthority: string;
  applicableRule: string;

  // GPS verification
  locationMode: 'GPS_CAPTURED' | 'MANUAL_EXCEPTION';
  gpsCoordinates?: GpsCoordinates;
  gpsAddress?: string;
  manualExceptionReason?: string;
  zoneMismatchFlag?: boolean;
  zoneMismatchDetails?: string;

  supervisorReview?: SupervisorReview | null;
  payment?: ViolationPayment | null;
  appeal?: ViolationAppeal | null;
  isDuplicateFlagged?: boolean;
  linkedDuplicateId?: string;
}

export interface VehicleProfile {
  plate: string;
  state: string;
  makeModel: string;
  type: VehicleType;
  ownerName: string;
  ownerEmail?: string;
  ownerPhone?: string;
  ownerType: 'Student' | 'Faculty/Staff' | 'Resident' | 'Visitor' | 'Commercial Delivery' | 'Unregistered';
  permitNumber?: string;
  totalViolations: number;
  confirmedViolations: number;
  underReviewViolations: number;
  resolvedViolations: number;
  unresolvedPenalties: number; // INR
  totalFinesAccrued: number; // INR
  totalFinesPaid: number; // INR
  isRepeatOffender: boolean;
  bootTowEligible: boolean;
  firstSeen: string;
  lastViolation: string;
}

export interface DuplicateCandidate {
  existingViolation: Violation;
  matchScore: number;
  reasons: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetId: string;
  details: string;
}
