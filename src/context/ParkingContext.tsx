import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Violation, 
  ParkingZone, 
  UserRole, 
  UserAccount,
  VehicleProfile, 
  DuplicateCandidate, 
  ViolationCategory, 
  ViolationStatus,
  SeverityLevel,
  VehicleType,
  AuditLogEntry
} from '../types';
import { 
  INITIAL_VIOLATIONS, 
  INITIAL_ZONES, 
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS,
  CATEGORY_FINE_MAP, 
  KNOWN_VEHICLES_REGISTRY 
} from '../data/initialData';

interface AddViolationInput {
  vehiclePlate: string;
  vehicleState: string;
  vehicleType: VehicleType;
  vehicleMakeModel: string;
  zoneId: string;
  specificLocation: string;
  category: ViolationCategory;
  severity: SeverityLevel;
  timestamp: string;
  officerBadge: string;
  officerName: string;
  notes: string;
  photoUrl: string;
  isDuplicateFlagged?: boolean;
  linkedDuplicateId?: string;
  locationMode?: 'GPS_CAPTURED' | 'MANUAL_EXCEPTION';
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
    accuracyMeters: number;
    capturedAt: string;
  };
  gpsAddress?: string;
  manualExceptionReason?: string;
  zoneMismatchFlag?: boolean;
  zoneMismatchDetails?: string;
  issuingAuthority?: string;
  applicableRule?: string;
}

interface ParkingContextType {
  // Auth state
  currentUser: UserAccount | null;
  users: UserAccount[];
  login: (email: string) => boolean;
  logout: () => void;
  switchUser: (user: UserAccount) => void;
  registerOwner: (name: string, email: string, plate: string, studentOrEmployeeId?: string) => boolean;
  registerVehicleToCurrentOwner: (plate: string, makeModel: string, state?: string, type?: VehicleType) => void;

  // Data
  violations: Violation[]; // Scoped or global depending on role
  allViolationsRaw: Violation[]; // For admin
  zones: ParkingZone[];
  auditLogs: AuditLogEntry[];
  
  // Navigation / Modal
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedViolationId: string | null;
  setSelectedViolationId: (id: string | null) => void;
  selectedVehiclePlate: string | null;
  setSelectedVehiclePlate: (plate: string | null) => void;
  
  // Actions
  addViolation: (input: AddViolationInput) => Violation;
  updateViolationStatus: (id: string, status: ViolationStatus, reviewerRemarks?: string) => void;
  recordPenaltyPayment: (id: string, amount: number, paymentMethod: string, notes?: any) => void;
  submitAppeal: (violationId: string, reason: string, evidenceUrl?: string) => void;
  resolveAppeal: (id: string, decision: 'Granted' | 'Denied', responseNotes: string) => void;
  deleteViolation: (id: string) => void;
  updateZone: (updatedZone: ParkingZone) => void;
  addZone: (newZone: Omit<ParkingZone, 'id' | 'activeViolations'>) => void;
  
  // Queries
  checkDuplicateCandidates: (plate: string, zoneId: string, category: ViolationCategory, timestampStr: string) => DuplicateCandidate[];
  getVehicleProfile: (plate: string) => VehicleProfile | null;
  getAllVehicleProfiles: () => VehicleProfile[];
  
  // Utilities
  resetToDemoData: () => void;
  exportViolationsCSV: () => void;
}

const STORAGE_KEY_VIOLATIONS = 'parkguard_violations_data_v3';
const STORAGE_KEY_ZONES = 'parkguard_zones_data_v3';
const STORAGE_KEY_USERS = 'parkguard_users_data_v3';
const STORAGE_KEY_AUTH_USER = 'parkguard_auth_user_v3';
const STORAGE_KEY_AUDIT_LOGS = 'parkguard_audit_logs_v3';

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export const ParkingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Users state
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USERS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return INITIAL_USERS;
  });

  // Unauthenticated visitors start as null to show login page first
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUTH_USER);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    // Unauthenticated visitors see the login page first
    return null;
  });

  const [allViolations, setAllViolations] = useState<Violation[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VIOLATIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return INITIAL_VIOLATIONS;
  });

  const [zones, setZones] = useState<ParkingZone[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ZONES);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return INITIAL_ZONES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return INITIAL_AUDIT_LOGS;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedViolationId, setSelectedViolationId] = useState<string | null>(null);
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VIOLATIONS, JSON.stringify(allViolations));
    } catch (e) {}
  }, [allViolations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ZONES, JSON.stringify(zones));
    } catch (e) {}
  }, [zones]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch (e) {}
  }, [users]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH_USER);
      }
    } catch (e) {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(auditLogs));
    } catch (e) {}
  }, [auditLogs]);

  // Append audit log
  const logAudit = (action: string, targetId: string, details: string) => {
    if (!currentUser) return;
    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      targetId,
      details,
    };
    setAuditLogs(prev => [entry, ...prev]);
  };

  // Auth methods
  const login = (email: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (found) {
      setCurrentUser(found);
      setActiveTab('dashboard');
      logAudit('LOGIN', found.id, `User signed in with role ${found.role}`);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentUser) {
      logAudit('LOGOUT', currentUser.id, 'User signed out');
    }
    setCurrentUser(null);
    setSelectedViolationId(null);
    setSelectedVehiclePlate(null);
  };

  const switchUser = (user: UserAccount) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
    setSelectedViolationId(null);
    setSelectedVehiclePlate(null);
    logAudit('ROLE_SWITCH', user.id, `Session switched to ${user.name} (${user.role})`);
  };

  const registerOwner = (name: string, email: string, plate: string, studentOrEmployeeId?: string): boolean => {
    const cleanPlate = plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const cleanEmail = email.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return false;
    }

    const newUser: UserAccount = {
      id: `usr-owner-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      role: 'OWNER',
      studentOrEmployeeId: studentOrEmployeeId?.trim() || `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      registeredPlates: [cleanPlate],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setActiveTab('dashboard');
    logAudit('USER_REGISTERED', newUser.id, `New vehicle owner registered with plate ${cleanPlate}`);
    return true;
  };

  const registerVehicleToCurrentOwner = (plate: string, makeModel: string, state = 'CA', type: VehicleType = 'Sedan') => {
    if (!currentUser || currentUser.role !== 'OWNER') return;
    const cleanPlate = plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    const updatedPlates = Array.from(new Set([...(currentUser.registeredPlates || []), cleanPlate]));
    const updatedUser: UserAccount = {
      ...currentUser,
      registeredPlates: updatedPlates,
    };

    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);

    // Also update known registry
    KNOWN_VEHICLES_REGISTRY[cleanPlate] = {
      ownerName: currentUser.name,
      ownerEmail: currentUser.email,
      ownerType: 'Student',
      permitNumber: currentUser.studentOrEmployeeId,
      makeModel,
      state,
      type,
    };

    logAudit('VEHICLE_REGISTERED', cleanPlate, `Added vehicle ${cleanPlate} to owner ${currentUser.name}`);
  };

  // OWASP Data Scope: If Owner, strictly limit returned violations to their registered plates
  const visibleViolations = currentUser?.role === 'OWNER'
    ? allViolations.filter(v => 
        (currentUser.registeredPlates || []).some(
          p => p.toUpperCase() === v.vehiclePlate.trim().toUpperCase()
        )
      )
    : allViolations;

  // Duplicate detection algorithm
  const checkDuplicateCandidates = (
    plate: string, 
    zoneId: string, 
    category: ViolationCategory, 
    timestampStr: string
  ): DuplicateCandidate[] => {
    const cleanPlate = plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!cleanPlate || cleanPlate.length < 2) return [];

    const targetDate = new Date(timestampStr || new Date());
    const candidates: DuplicateCandidate[] = [];

    allViolations.forEach(v => {
      const existingPlate = v.vehiclePlate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      const existingDate = new Date(v.timestamp);
      const hoursDiff = Math.abs(targetDate.getTime() - existingDate.getTime()) / (1000 * 60 * 60);

      const isSamePlate = cleanPlate === existingPlate;
      const isSameZone = v.zoneId === zoneId;
      const isSameCategory = v.category === category;

      let matchScore = 0;
      const reasons: string[] = [];

      if (isSamePlate) {
        matchScore += 50;
        reasons.push(`Vehicle registration plate matches identical vehicle (${v.vehiclePlate})`);

        if (hoursDiff <= 4) {
          matchScore += 40;
          reasons.push(`Reported very recently: ${Math.round(hoursDiff * 60)} minutes apart`);
        } else if (hoursDiff <= 24) {
          matchScore += 30;
          reasons.push(`Reported within the past ${Math.round(hoursDiff)} hours`);
        } else if (hoursDiff <= 72) {
          matchScore += 15;
          reasons.push(`Active violation in last 3 days`);
        }

        if (isSameZone) {
          matchScore += 15;
          reasons.push(`Identical parking zone (${v.zoneName})`);
        }

        if (isSameCategory) {
          matchScore += 10;
          reasons.push(`Identical violation category (${v.category})`);
        }
      } else if (isSameZone && isSameCategory && hoursDiff <= 2) {
        matchScore = 25;
        reasons.push(`Same location & category recorded recently`);
      }

      if (matchScore >= 40) {
        candidates.push({
          existingViolation: v,
          matchScore: Math.min(matchScore, 99),
          reasons,
        });
      }
    });

    return candidates.sort((a, b) => b.matchScore - a.matchScore);
  };

  // Add violation (Officer or Admin)
  const addViolation = (input: AddViolationInput): Violation => {
    if (currentUser?.role === 'OWNER') {
      throw new Error('Unauthorized: Vehicle owners cannot issue citations.');
    }

    const zone = zones.find(z => z.id === input.zoneId) || zones[0];
    const baseFine = CATEGORY_FINE_MAP[input.category]?.fineINR || 500;
    const fineMultiplier = zone?.fineMultiplier || 1.0;
    const calculatedFine = Math.round(baseFine * fineMultiplier);
    const calculatedPaise = calculatedFine * 100;

    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `PG-${year}-${randomSuffix}`;

    const newViolation: Violation = {
      id: newId,
      vehiclePlate: input.vehiclePlate.trim().toUpperCase(),
      vehicleState: input.vehicleState.trim().toUpperCase() || 'KA',
      vehicleType: input.vehicleType,
      vehicleMakeModel: input.vehicleMakeModel.trim() || 'Vehicle (Unspecified)',
      zoneId: input.zoneId,
      zoneName: zone.name,
      specificLocation: input.specificLocation.trim(),
      category: input.category,
      severity: input.severity,
      timestamp: input.timestamp || new Date().toISOString(),
      officerBadge: input.officerBadge.trim() || currentUser?.badgeId || 'OFF-402',
      officerName: input.officerName.trim() || currentUser?.name || 'Patrol Officer',
      reportedByOfficerId: currentUser?.id,
      notes: input.notes.trim(),
      photoUrl: input.photoUrl,
      fineAmount: calculatedFine,
      fineAmountPaise: calculatedPaise,
      status: 'Reported',
      issuingAuthority: input.issuingAuthority || 'Campus Traffic & Security Enforcement Directorate',
      applicableRule: input.applicableRule || (CATEGORY_FINE_MAP[input.category]?.ruleCode ? `${CATEGORY_FINE_MAP[input.category].ruleCode} (${CATEGORY_FINE_MAP[input.category].ruleDescription})` : 'Campus Traffic & Parking Regulation 2026'),
      locationMode: input.locationMode || (input.gpsCoordinates ? 'GPS_CAPTURED' : 'MANUAL_EXCEPTION'),
      gpsCoordinates: input.gpsCoordinates,
      gpsAddress: input.gpsAddress,
      manualExceptionReason: input.manualExceptionReason,
      zoneMismatchFlag: input.zoneMismatchFlag,
      zoneMismatchDetails: input.zoneMismatchDetails,
      isDuplicateFlagged: input.isDuplicateFlagged,
      linkedDuplicateId: input.linkedDuplicateId,
    };

    setAllViolations(prev => [newViolation, ...prev]);
    logAudit('CREATE_CITATION', newId, `Citation issued to ${newViolation.vehiclePlate} for ${newViolation.category}`);
    return newViolation;
  };

  // Status transitions
  const updateViolationStatus = (id: string, status: ViolationStatus, reviewerRemarks?: string) => {
    if (currentUser?.role === 'OWNER') {
      alert('Access Denied: Vehicle owners cannot modify violation statuses.');
      return;
    }

    // Officers cannot confirm citations without supervisor approval
    if (currentUser?.role === 'OFFICER' && ['Confirmed', 'Resolved'].includes(status)) {
      alert('Permission Denied: Only Watch Supervisors or Administrators can confirm or close citations.');
      return;
    }

    setAllViolations(prev =>
      prev.map(v => {
        if (v.id !== id) return v;

        let supervisorReview = v.supervisorReview;
        if (['Confirmed', 'Under Review', 'Resolved'].includes(status) && currentUser?.role === 'ADMIN') {
          supervisorReview = {
            reviewer: currentUser.name,
            reviewedAt: new Date().toISOString(),
            remarks: reviewerRemarks || `Status updated to ${status} by administrator.`,
            approved: status === 'Confirmed',
          };
        }

        return {
          ...v,
          status,
          supervisorReview,
        };
      })
    );

    logAudit('STATUS_UPDATE', id, `Status updated to ${status}. Notes: ${reviewerRemarks || 'None'}`);
  };

  // Submit appeal (Owner or Admin)
  const submitAppeal = (violationId: string, reason: string, evidenceUrl?: string) => {
    setAllViolations(prev =>
      prev.map(v => {
        if (v.id !== violationId) return v;

        return {
          ...v,
          status: 'Appealed',
          appeal: {
            appealedAt: new Date().toISOString(),
            reason: reason.trim(),
            evidenceUrl,
            status: 'Pending',
          },
        };
      })
    );

    logAudit('SUBMIT_APPEAL', violationId, `Appeal submitted: "${reason.slice(0, 60)}..."`);
  };

  // Resolve appeal (Admin only)
  const resolveAppeal = (id: string, decision: 'Granted' | 'Denied', responseNotes: string) => {
    if (currentUser?.role !== 'ADMIN') {
      alert('Access Denied: Only Administrators can adjudicate citation appeals.');
      return;
    }

    setAllViolations(prev =>
      prev.map(v => {
        if (v.id !== id) return v;

        const updatedAppeal = v.appeal
          ? {
              ...v.appeal,
              status: decision,
              reviewedBy: currentUser.name,
              reviewedAt: new Date().toISOString(),
              responseNotes,
            }
          : {
              appealedAt: new Date().toISOString(),
              reason: 'Appeal adjudicated by supervisor',
              status: decision,
              reviewedBy: currentUser.name,
              reviewedAt: new Date().toISOString(),
              responseNotes,
            };

        const newStatus: ViolationStatus = decision === 'Granted' ? 'Resolved' : 'Fine Pending';

        return {
          ...v,
          status: newStatus,
          appeal: updatedAppeal,
        };
      })
    );

    logAudit('RESOLVE_APPEAL', id, `Appeal ${decision}. Decision notes: ${responseNotes}`);
  };

  // Payment settlement
  const recordPenaltyPayment = (id: string, amount: number, paymentMethod: string, notes?: any) => {
    setAllViolations(prev =>
      prev.map(v => {
        if (v.id !== id) return v;

        const orderId = (typeof notes === 'object' && notes?.orderId) || `order_${Date.now()}`;
        const paymentId = (typeof notes === 'object' && notes?.paymentId) || `pay_${Date.now()}`;
        const receiptNo = (typeof notes === 'object' && notes?.receiptNumber) || `PG-RCP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        const amountPaise = (typeof notes === 'object' && notes?.amountPaise) || (v.fineAmountPaise || Math.round(amount * 100));

        let methodType: 'Razorpay UPI' | 'Razorpay NetBanking' | 'Razorpay Card (Test Mode)' | 'Campus Bursar Desk' = 'Campus Bursar Desk';
        if (paymentMethod.toLowerCase().includes('upi')) methodType = 'Razorpay UPI';
        else if (paymentMethod.toLowerCase().includes('net')) methodType = 'Razorpay NetBanking';
        else if (paymentMethod.toLowerCase().includes('card')) methodType = 'Razorpay Card (Test Mode)';

        return {
          ...v,
          status: 'Paid',
          payment: {
            paidAt: new Date().toISOString(),
            paymentMethod: methodType,
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            razorpaySignature: typeof notes === 'object' ? notes?.signature : 'sim_sig_verified',
            receiptNumber: receiptNo,
            amountPaise,
            amountRupees: amount,
            currency: 'INR',
            isTestMode: true,
            verifiedByBackend: true,
            processedBy: currentUser?.name ? `${currentUser.name} (${currentUser.role})` : 'Razorpay Settlement Gateway',
          },
        };
      })
    );

    logAudit('RECORD_PAYMENT', id, `Payment of ₹${amount.toLocaleString('en-IN')} settled via ${paymentMethod}`);
  };

  const deleteViolation = (id: string) => {
    if (currentUser?.role !== 'ADMIN') {
      alert('Access Denied: Only administrators can delete records.');
      return;
    }
    setAllViolations(prev => prev.filter(v => v.id !== id));
    logAudit('DELETE_VIOLATION', id, 'Violation record purged by administrator');
  };

  const updateZone = (updatedZone: ParkingZone) => {
    if (currentUser?.role !== 'ADMIN') {
      alert('Access Denied: Zone configurations are restricted to Administrators.');
      return;
    }
    setZones(prev => prev.map(z => (z.id === updatedZone.id ? updatedZone : z)));
    logAudit('UPDATE_ZONE', updatedZone.id, `Zone ${updatedZone.name} settings modified`);
  };

  const addZone = (newZone: Omit<ParkingZone, 'id' | 'activeViolations'>) => {
    if (currentUser?.role !== 'ADMIN') {
      alert('Access Denied: Zone configurations are restricted to Administrators.');
      return;
    }
    const id = `zone-${Date.now()}`;
    setZones(prev => [...prev, { ...newZone, id, activeViolations: 0 }]);
    logAudit('CREATE_ZONE', id, `New zone ${newZone.name} added`);
  };

  // Vehicle profile builder
  const getVehicleProfile = (plate: string): VehicleProfile | null => {
    const clean = plate.trim().toUpperCase();

    // Privacy check for owner: Owners cannot view vehicles that are not theirs
    if (currentUser?.role === 'OWNER') {
      const ownsPlate = (currentUser.registeredPlates || []).some(p => p.toUpperCase() === clean);
      if (!ownsPlate) return null;
    }

    const vehicleViolations = allViolations.filter(
      v => v.vehiclePlate.trim().toUpperCase() === clean
    );

    if (vehicleViolations.length === 0 && !KNOWN_VEHICLES_REGISTRY[clean]) {
      return null;
    }

    const reg = KNOWN_VEHICLES_REGISTRY[clean];
    const latest = vehicleViolations[0];
    const oldest = vehicleViolations[vehicleViolations.length - 1];

    const confirmed = vehicleViolations.filter(v => ['Confirmed', 'Fine Pending', 'Paid'].includes(v.status)).length;
    const underReview = vehicleViolations.filter(v => ['Reported', 'Under Review', 'Appealed'].includes(v.status)).length;
    const resolved = vehicleViolations.filter(v => v.status === 'Resolved').length;

    const totalFinesAccrued = vehicleViolations.reduce((sum, v) => sum + (v.fineAmount || 0), 0);
    const totalFinesPaid = vehicleViolations
      .filter(v => v.status === 'Paid')
      .reduce((sum, v) => sum + (v.fineAmount || 0), 0);
    const unresolvedPenalties = vehicleViolations
      .filter(v => ['Confirmed', 'Fine Pending', 'Reported', 'Under Review'].includes(v.status))
      .reduce((sum, v) => sum + (v.fineAmount || 0), 0);

    const isRepeatOffender = confirmed >= 3 || vehicleViolations.length >= 3;
    const bootTowEligible = confirmed >= 4 || unresolvedPenalties >= 3000;

    return {
      plate: clean,
      state: reg?.state || latest?.vehicleState || 'CA',
      makeModel: reg?.makeModel || latest?.vehicleMakeModel || 'Unknown Model',
      type: reg?.type || latest?.vehicleType || 'Sedan',
      ownerName: reg?.ownerName || (currentUser?.role === 'OWNER' ? currentUser.name : 'Unregistered / Visitor'),
      ownerEmail: reg?.ownerEmail,
      ownerType: reg?.ownerType || 'Unregistered',
      permitNumber: reg?.permitNumber || currentUser?.studentOrEmployeeId,
      totalViolations: vehicleViolations.length,
      confirmedViolations: confirmed,
      underReviewViolations: underReview,
      resolvedViolations: resolved,
      unresolvedPenalties,
      totalFinesAccrued,
      totalFinesPaid,
      isRepeatOffender,
      bootTowEligible,
      firstSeen: oldest ? oldest.timestamp : new Date().toISOString(),
      lastViolation: latest ? latest.timestamp : new Date().toISOString(),
    };
  };

  const getAllVehicleProfiles = (): VehicleProfile[] => {
    // If owner, return only their vehicles
    if (currentUser?.role === 'OWNER') {
      const plates = currentUser.registeredPlates || [];
      return plates.map(p => getVehicleProfile(p)).filter(Boolean) as VehicleProfile[];
    }

    const plateSet = new Set<string>();
    allViolations.forEach(v => plateSet.add(v.vehiclePlate.trim().toUpperCase()));
    Object.keys(KNOWN_VEHICLES_REGISTRY).forEach(p => plateSet.add(p.toUpperCase()));

    const profiles: VehicleProfile[] = [];
    plateSet.forEach(p => {
      const prof = getVehicleProfile(p);
      if (prof) profiles.push(prof);
    });

    return profiles.sort((a, b) => b.totalViolations - a.totalViolations);
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEY_VIOLATIONS);
    localStorage.removeItem(STORAGE_KEY_ZONES);
    localStorage.removeItem(STORAGE_KEY_USERS);
    localStorage.removeItem(STORAGE_KEY_AUDIT_LOGS);
    setAllViolations(INITIAL_VIOLATIONS);
    setZones(INITIAL_ZONES);
    setUsers(INITIAL_USERS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    const officer = INITIAL_USERS.find(u => u.role === 'OFFICER') || INITIAL_USERS[0];
    setCurrentUser(officer);
    setActiveTab('dashboard');
  };

  const exportViolationsCSV = () => {
    const listToExport = visibleViolations;
    const headers = [
      'Violation ID',
      'Plate',
      'State',
      'Vehicle Type',
      'Make/Model',
      'Zone',
      'Specific Location',
      'Category',
      'Severity',
      'Date & Time',
      'Fine Amount (INR ₹)',
      'Status',
      'Officer Name',
      'Officer Badge',
      'Notes'
    ];

    const rows = listToExport.map(v => [
      `"${v.id}"`,
      `"${v.vehiclePlate}"`,
      `"${v.vehicleState}"`,
      `"${v.vehicleType}"`,
      `"${v.vehicleMakeModel}"`,
      `"${v.zoneName}"`,
      `"${v.specificLocation.replace(/"/g, '""')}"`,
      `"${v.category}"`,
      `"${v.severity}"`,
      `"${v.timestamp}"`,
      v.fineAmount,
      `"${v.status}"`,
      `"${v.officerName}"`,
      `"${v.officerBadge}"`,
      `"${v.notes.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ParkGuard_Violations_${currentUser?.role || 'EXPORT'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ParkingContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        switchUser,
        registerOwner,
        registerVehicleToCurrentOwner,
        violations: visibleViolations,
        allViolationsRaw: allViolations,
        zones,
        auditLogs,
        activeTab,
        setActiveTab,
        selectedViolationId,
        setSelectedViolationId,
        selectedVehiclePlate,
        setSelectedVehiclePlate,
        addViolation,
        updateViolationStatus,
        recordPenaltyPayment,
        submitAppeal,
        resolveAppeal,
        deleteViolation,
        updateZone,
        addZone,
        checkDuplicateCandidates,
        getVehicleProfile,
        getAllVehicleProfiles,
        resetToDemoData,
        exportViolationsCSV,
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
};
