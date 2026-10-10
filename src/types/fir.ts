/**
 * FIR Analyzer Agentic AI - Core Data Types & Schema
 */

export interface AuthSession {
  authenticated: boolean;
  username: string;
  role: string;
  badge?: string;
  loginTime: string;
}

export interface ExtractedFactItem {
  category:
    | 'Complainant & Informant'
    | 'Victim Information'
    | 'Suspect / Accused Details'
    | 'Incident Date & Time'
    | 'Incident Location'
    | 'Alleged Sequence of Events'
    | 'Property / Losses / Injury'
    | 'Weapons / Force Used'
    | 'Witnesses & Evidence';
  detail: string;
  verbatimQuote?: string;
  sourceConfidence: 'Explicitly Stated' | 'Inferred / Ambiguous' | 'Not Stated in Complaint';
}

export interface MissingInformationItem {
  field: string;
  importance: 'Critical' | 'Relevant' | 'Optional';
  explanation: string;
  suggestedClarification: string;
}

export interface LegalResearchItem {
  provision: string; // e.g. "Section 303(2) BNS / Section 379 IPC"
  actName: 'Bharatiya Nyaya Sanhita (BNS)' | 'Bharatiya Nagarik Suraksha Sanhita (BNSS)' | 'Bharatiya Sakshya Adhiniyam (BSA)' | 'Special & Local Laws';
  title: string;
  allegedConductMatch: string;
  supportingFacts: string;
  missingElementsOrCaveats: string;
  transitionalNote: string;
}

export interface DraftFIR {
  header: {
    title: string;
    subTitle: string;
    disclaimer: string;
  };
  complaintInformation: {
    referenceNumber: string;
    complainantName: string;
    contactAndAddress: string;
  };
  incidentDetails: {
    dateAndTime: string;
    placeOfOccurrence: string;
    offenseAllegedSummary: string;
  };
  suspectDetails: {
    identifiedSuspects: string;
    unidentifiedSuspectsDescription: string;
  };
  narrativeDraft: string;
  propertyAndLossParticulars: string;
  witnessesMentioned: string;
  actionRequested: string;
}

export interface QualityCheckItem {
  checkType: 'Factual Fidelity' | 'Zero-Hallucination Audit' | 'Chronology Consistency' | 'Statutory Uncertainty Disclosure' | 'Officer Verification Flag';
  finding: string;
  status: 'Verified' | 'Attention Required' | 'Requires Officer Clarification';
}

export interface InvestigationChecklistItem {
  category: 'Complainant Interview' | 'Scene Examination' | 'CCTV & Digital Evidence' | 'Witness Examination' | 'Documentary Proof';
  actionStep: string;
  priority: 'Immediate (0-24 hrs)' | 'Routine (24-72 hrs)' | 'Follow-up';
  legalSafeguardNote: string;
}

export interface CrimePatternAttributes {
  offenseCategory: string;
  modusOperandi: string[];
  suspectCharacteristics: string[];
  vehicleOrToolsUsed: string[];
  targetVulnerability: string[];
  searchableAttributes: string[];
  crossCaseComparisonGuidance: string;
}

export interface FIRAnalysisResult {
  engine: 'GEMINI_3_8_FLASH_AGENTIC' | 'DETERMINISTIC_RULES_ENGINE';
  engineStatusNote?: string;
  complaintTitle?: string;
  complaintOverview: string;

  // Agent 1: FIR Fact Extractor
  agent1_extractedFacts: ExtractedFactItem[];

  // Agent 2: Missing Information & Gap Checker
  agent2_gapsAndClarifications: MissingInformationItem[];

  // Agent 3: Legal Section Research Assistant
  agent3_legalProvisions: {
    overviewCaveat: string;
    provisions: LegalResearchItem[];
  };

  // Agent 4: FIR Report Generator
  agent4_draftFIRReport: DraftFIR;

  // Agent 5: Final Quality Checker
  agent5_qualityReview: {
    overallAssessment: string;
    checks: QualityCheckItem[];
  };

  // Agent 6 & 7: Formatted outputs & Investigation Checklist
  agent6_investigationChecklist: InvestigationChecklistItem[];
  agent7_recommendedFollowUps: string[];

  // Crime Pattern & Similarity Analysis (Section 6)
  crimePatternAnalysis: CrimePatternAttributes;

  humanReviewNotice: string;
  processedAt: string;
}

export interface FIRReport {
  id: string; // FIR-2026-XXXX
  complaintTitle?: string;
  complaintText: string;
  incidentLocation?: string;
  incidentDateTime?: string;
  submittedAt: string;
  reviewer: string;
  analysisStatus: 'COMPLETED' | 'FAILED';
  analysisResult: FIRAnalysisResult;
  processingError?: string;
  reviewStatus?: 'PENDING_OFFICER_REVIEW' | 'REVIEWED' | 'FLAGGED_FOR_FOLLOW_UP';
  officerNotes?: string;
}

export interface CompareCasesRequest {
  caseAText: string;
  caseBText: string;
}

export interface CompareCasesResult {
  commonCharacteristics: string[];
  distinctDifferences: string[];
  potentialSimilarities: string[];
  investigativeLeadSuggestion: string;
  disclaimer: string;
}

export interface SystemStatus {
  geminiConfigured: boolean;
  storageType: string;
  reportsCount: number;
}
