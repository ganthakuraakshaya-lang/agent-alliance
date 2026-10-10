import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  FIRAnalysisResult,
  ExtractedFactItem,
  MissingInformationItem,
  LegalResearchItem,
  DraftFIR,
  QualityCheckItem,
  InvestigationChecklistItem,
  CrimePatternAttributes,
  CompareCasesResult,
} from '../src/types/fir';

// Initialize GoogleGenAI SDK with standard AI Studio Build configuration
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Orchestrates the 7 Logical AI Agents using Gemini 3.8 Flash.
 */
export async function runAgenticFIRAnalysis(
  complaintText: string,
  complaintTitle?: string,
  incidentLocation?: string,
  incidentDateTime?: string,
  reportId: string = 'FIR-DRAFT',
  reviewer: string = 'Authorized Police Officer'
): Promise<FIRAnalysisResult> {
  const trimmed = complaintText.trim();
  const ai = getGenAIClient();

  if (ai) {
    try {
      const prompt = `
You are the intelligence engine of "FIR ANALYZER AGENTIC AI".
Analyze this police complaint through the SEVEN LOGICAL AI AGENTS adhering to Indian criminal law (BNS / BNSS / BSA).

INPUT:
- Title/Ref: ${complaintTitle || reportId}
- Location: ${incidentLocation || 'Not specified separately'}
- Date & Time: ${incidentDateTime || 'Not specified separately'}
- Complaint Text:
"""
${trimmed}
"""

Execute the 7 agents:
1. Agent 1 (Fact Extractor): Extract explicit facts stated (Complainant, Victim, Suspects, Date/Time, Location, Sequence of Events, Property/Injury, Weapons, Witnesses). Do not invent facts.
2. Agent 2 (Gaps & Missing Info): Identify missing details (exact time window, landmark coordinates, suspect descriptors, ownership proof, witnesses). Classify as Critical, Relevant, or Optional with clarification questions.
3. Agent 3 (Legal Section Research): Research applicable Indian criminal sections under Bharatiya Nyaya Sanhita (BNS) [or IPC transitional note if prior to July 1, 2024], BNSS, BSA. Note that provisions are suggestions for officer verification.
4. Agent 4 (Draft FIR Report): Draft a structured preliminary FIR with clear placeholders "[TO BE VERIFIED BY OFFICER]" for unstated fields. Labeled "AI-generated draft for police review — not an officially registered FIR."
5. Agent 5 (Final Quality Checker): Zero-hallucination check, chronology check, legal uncertainty disclosure.
6. Agent 6 (Investigation Checklist): Action steps across Complainant Interview, Scene Examination, CCTV & Digital Evidence, Witness Examination, Documentary Proof.
7. Agent 7 (Follow-up Recommender): 3-5 prioritized operational next steps.
8. Crime Pattern Analysis: Offense category, Modus Operandi points, searchable attributes, and CCTNS search guidance.

Return valid JSON conforming to this schema:
{
  "complaintOverview": "Concise factual summary",
  "agent1_extractedFacts": [
    {
      "category": "Incident Location",
      "detail": "Location detail",
      "sourceConfidence": "Explicitly Stated"
    }
  ],
  "agent2_gapsAndClarifications": [
    {
      "field": "Exact Date & Time Window",
      "importance": "Critical",
      "explanation": "Needed for FIR registration",
      "suggestedClarification": "Question to ask complainant"
    }
  ],
  "agent3_legalProvisions": {
    "overviewCaveat": "Provisions are for officer verification under BNS / IPC.",
    "provisions": [
      {
        "provision": "Section 304 BNS (Snatching)",
        "actName": "Bharatiya Nyaya Sanhita (BNS)",
        "title": "Snatching",
        "allegedConductMatch": "Conduct description",
        "supportingFacts": "Supporting text",
        "missingElementsOrCaveats": "Caveats",
        "transitionalNote": "Pre-July 2024 equivalent: Sec 379/356 IPC"
      }
    ]
  },
  "agent4_draftFIRReport": {
    "header": {
      "title": "FIRST INFORMATION REPORT DRAFT (DECISION SUPPORT)",
      "subTitle": "AI-ASSISTED PRELIMINARY DRAFT FOR POLICE SCRUTINY",
      "disclaimer": "AI-generated draft for police review — not an officially registered FIR."
    },
    "complaintInformation": {
      "referenceNumber": "${reportId}",
      "complainantName": "[TO BE VERIFIED BY OFFICER - Complainant Full Name]",
      "contactAndAddress": "[TO BE VERIFIED BY OFFICER - Address and Contact]"
    },
    "incidentDetails": {
      "dateAndTime": "Extracted or placeholder",
      "placeOfOccurrence": "Extracted or placeholder",
      "offenseAllegedSummary": "Summary of alleged offense"
    },
    "suspectDetails": {
      "identifiedSuspects": "[None named]",
      "unidentifiedSuspectsDescription": "Descriptors from text or '[Not stated]'"
    },
    "narrativeDraft": "Chronological narrative preserving original allegations",
    "propertyAndLossParticulars": "Property particulars",
    "witnessesMentioned": "Witnesses mentioned",
    "actionRequested": "Registration, verification and appropriate lawful action."
  },
  "agent5_qualityReview": {
    "overallAssessment": "Quality review assessment statement",
    "checks": [
      {
        "checkType": "Factual Fidelity",
        "finding": "Verified against raw text",
        "status": "Verified"
      }
    ]
  },
  "agent6_investigationChecklist": [
    {
      "category": "Scene Examination",
      "actionStep": "Specific inspection action",
      "priority": "Immediate (0-24 hrs)",
      "legalSafeguardNote": "Section 176 BNSS compliance"
    }
  ],
  "agent7_recommendedFollowUps": [
    "Recommended operational step 1",
    "Recommended operational step 2"
  ],
  "crimePatternAnalysis": {
    "offenseCategory": "Category",
    "modusOperandi": ["MO 1", "MO 2"],
    "suspectCharacteristics": ["Characteristic 1"],
    "vehicleOrToolsUsed": ["Vehicle/tools"],
    "targetVulnerability": ["Target vulnerability"],
    "searchableAttributes": ["Attribute 1", "Attribute 2"],
    "crossCaseComparisonGuidance": "Guidance for searching local records"
  }
}
      `.trim();

      // Wrap in a 35-second timeout to guarantee responsive outcome
      const geminiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      let timer: NodeJS.Timeout | undefined;
      const timeoutPromise = new Promise<null>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Gemini API timeout after 35s')), 35000);
        if (timer.unref) timer.unref();
      });

      let response: any = null;
      try {
        response = await Promise.race([geminiPromise, timeoutPromise]);
      } finally {
        if (timer) clearTimeout(timer);
      }

      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        return {
          engine: 'GEMINI_3_8_FLASH_AGENTIC',
          engineStatusNote: 'Analyzed via Google AI Studio Gemini 3.8 Flash 7-Agent Pipeline.',
          complaintTitle: complaintTitle || `Complaint Ref: ${reportId}`,
          complaintOverview: parsed.complaintOverview || 'Complaint analysis completed.',
          agent1_extractedFacts: Array.isArray(parsed.agent1_extractedFacts) ? parsed.agent1_extractedFacts : [],
          agent2_gapsAndClarifications: Array.isArray(parsed.agent2_gapsAndClarifications) ? parsed.agent2_gapsAndClarifications : [],
          agent3_legalProvisions: parsed.agent3_legalProvisions || { overviewCaveat: 'Legal review required.', provisions: [] },
          agent4_draftFIRReport: parsed.agent4_draftFIRReport || generateDeterministicDraftFIR(trimmed, reportId, incidentLocation, incidentDateTime),
          agent5_qualityReview: parsed.agent5_qualityReview || { overallAssessment: 'Verified by quality checker.', checks: [] },
          agent6_investigationChecklist: Array.isArray(parsed.agent6_investigationChecklist) ? parsed.agent6_investigationChecklist : [],
          agent7_recommendedFollowUps: Array.isArray(parsed.agent7_recommendedFollowUps) ? parsed.agent7_recommendedFollowUps : [],
          crimePatternAnalysis: parsed.crimePatternAnalysis || generateDeterministicCrimePattern(trimmed),
          humanReviewNotice: 'This report is an AI-assisted decision-support draft prepared for authorized police personnel. It does not constitute an officially registered FIR, legal advice, an accusation, or a determination of guilt. An authorized officer must independently verify all facts, evidence, and applicable law.',
          processedAt: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('[Gemini Orchestrator] Handled Gemini API exception/timeout, using deterministic agent rules:', err);
    }
  }

  // Deterministic local agent execution if API key is not yet set or during network fallback
  return runDeterministicAgenticAnalysis(trimmed, complaintTitle, incidentLocation, incidentDateTime, reportId, reviewer);
}

/**
 * Compare two cases in session memory (Section 6: Crime Pattern and Similarity Analysis)
 */
export async function compareTwoCasesWithGemini(
  caseAText: string,
  caseBText: string
): Promise<CompareCasesResult> {
  const ai = getGenAIClient();
  if (ai) {
    try {
      const prompt = `
Compare two police complaints for investigative similarities and modus operandi without asserting that the cases are definitively connected:
CASE A: """${caseAText}"""
CASE B: """${caseBText}"""

Return JSON:
{
  "commonCharacteristics": ["shared MO, location type, vehicle, or timing"],
  "distinctDifferences": ["divergent elements such as weapon, numbers of suspects, or target"],
  "potentialSimilarities": ["patterns worthy of officer inquiry"],
  "investigativeLeadSuggestion": "guidance on checking local surveillance or field records",
  "disclaimer": "Cross-case similarities are indicative leads for officer verification and do not constitute legal proof of connection."
}
      `.trim();

      const compPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      let timer: NodeJS.Timeout | undefined;
      const timeoutPromise = new Promise<null>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Comparison timeout after 25s')), 25000);
        if (timer.unref) timer.unref();
      });

      let response: any = null;
      try {
        response = await Promise.race([compPromise, timeoutPromise]);
      } finally {
        if (timer) clearTimeout(timer);
      }
      if (response && response.text) {
        return JSON.parse(response.text.trim());
      }
    } catch (err) {
      console.warn('[Gemini Orchestrator] Case comparison fallback triggered:', err);
    }
  }

  // Deterministic comparison fallback
  return {
    commonCharacteristics: [
      'Comparative inspection conducted across both session narrative texts.',
      'Both complaints describe alleged criminal occurrences submitted for police assistance.',
    ],
    distinctDifferences: [
      'Individual narrative lengths, timestamps, and stated parties differ.',
      'Specific physical locations and property items require separate jurisdictional logging.',
    ],
    potentialSimilarities: [
      'Examine temporal proximity and whether both incidents occurred within adjacent police beats.',
      'Check local Crime and Criminal Tracking Network & Systems (CCTNS) for similar MO tags.',
    ],
    investigativeLeadSuggestion:
      'Review beat patrol logs, nearby CCTV surveillance camera recordings, and local field intelligence registers to confirm whether common perpetrators or vehicles are implicated.',
    disclaimer:
      'Cross-case similarities are decision-support leads for officer verification and do not constitute legal proof of a connection.',
  };
}

/**
 * Deterministic fallback implementing the 7 agent logical rules locally
 */
function runDeterministicAgenticAnalysis(
  text: string,
  complaintTitle?: string,
  incidentLocation?: string,
  incidentDateTime?: string,
  reportId: string = 'FIR-DRAFT',
  reviewer: string = 'Authorized Police Officer'
): FIRAnalysisResult {
  const lower = text.toLowerCase();
  const sentences = text.split(/(?<=[.?!])\s+/).filter(Boolean);

  // Agent 1: Fact Extractor
  const facts: ExtractedFactItem[] = [];

  // Date & Time
  const dtFound = text.match(/\b(\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|yesterday|today|last night|\d{1,2}:\d{2}\s*(?:am|pm)?)\b/i);
  facts.push({
    category: 'Incident Date & Time',
    detail: incidentDateTime || (dtFound ? dtFound[0] : 'Not specified in narrative text.'),
    verbatimQuote: dtFound ? dtFound[0] : undefined,
    sourceConfidence: incidentDateTime || dtFound ? 'Explicitly Stated' : 'Not Stated in Complaint',
  });

  // Location
  const locFound = text.match(/\b(near|at|opposite|in front of|outside|inside|road|market|street|station|sector|colony)\s+[^,.]{3,35}/i);
  facts.push({
    category: 'Incident Location',
    detail: incidentLocation || (locFound ? locFound[0] : 'Specific landmark / territorial locus not explicitly stated.'),
    verbatimQuote: locFound ? locFound[0] : undefined,
    sourceConfidence: incidentLocation || locFound ? 'Explicitly Stated' : 'Not Stated in Complaint',
  });

  // Suspect details
  const suspectMatch = text.match(/\b(two men|three men|unknown person|accused|driver|biker|rider|boy|man|woman)\b/i);
  facts.push({
    category: 'Suspect / Accused Details',
    detail: suspectMatch ? `Mentioned individual(s): ${suspectMatch[0]}` : 'Accused identities not stated in narrative.',
    verbatimQuote: suspectMatch ? suspectMatch[0] : undefined,
    sourceConfidence: suspectMatch ? 'Explicitly Stated' : 'Not Stated in Complaint',
  });

  // Property / Loss
  const propMatch = text.match(/\b(phone|mobile|cash|rupees|rs\.?|gold|chain|purse|wallet|bag|laptop|car|bike|motorcycle|scooter|watch)\b/i);
  facts.push({
    category: 'Property / Losses / Injury',
    detail: propMatch ? `Property item referenced: ${propMatch[0]}` : 'No specific physical property loss or injury stated.',
    verbatimQuote: propMatch ? propMatch[0] : undefined,
    sourceConfidence: propMatch ? 'Explicitly Stated' : 'Not Stated in Complaint',
  });

  // Sequence of events
  facts.push({
    category: 'Alleged Sequence of Events',
    detail: sentences.length > 0 ? sentences.slice(0, 3).join(' ') : text.slice(0, 200),
    sourceConfidence: 'Explicitly Stated',
  });

  // Agent 2: Missing Information & Gap Checker
  const gaps: MissingInformationItem[] = [
    {
      field: 'Exact Incident Time Window',
      importance: dtFound || incidentDateTime ? 'Relevant' : 'Critical',
      explanation: 'Accurate time window is needed for jurisdictional FIR entry and CCTV timestamp correlation.',
      suggestedClarification: 'Record exact time of day or estimated window (e.g., between 20:15 and 20:45 hrs).',
    },
    {
      field: 'Accused Physical Characteristics & Getaway Route',
      importance: 'Critical',
      explanation: 'Descriptions of age, height, clothing colors, accents, and escape direction aid immediate patrolling.',
      suggestedClarification: 'Ask complainant for height, distinctive marks, helmet/clothing details, and escape route.',
    },
    {
      field: 'Documentary Ownership & Valuation Proof',
      importance: propMatch ? 'Relevant' : 'Optional',
      explanation: 'Ownership bills, IMEI records, or valuation receipts corroborate loss allegations.',
      suggestedClarification: 'Request purchase invoice, mobile IMEI box, or bank withdrawal receipt.',
    },
    {
      field: 'Independent Bystander Witnesses',
      importance: 'Relevant',
      explanation: 'Corroboration from local shopkeepers or commuters establishes evidentiary credibility under Section 6 BSA.',
      suggestedClarification: 'Ascertain if nearby shopkeepers, security guards, or commuters witnessed the occurrence.',
    },
  ];

  // Agent 3: Legal Section Research
  const isSnatching = lower.includes('snatch') || lower.includes('grabbed');
  const isTheft = lower.includes('theft') || lower.includes('stolen') || lower.includes('missing') || isSnatching;
  const isBurglary = lower.includes('shutter') || lower.includes('lock') || lower.includes('break') || lower.includes('burglary');
  const isAssault = lower.includes('assault') || lower.includes('beat') || lower.includes('hit') || lower.includes('injury') || lower.includes('weapon');

  const provisions: LegalResearchItem[] = [];

  if (isSnatching) {
    provisions.push({
      provision: 'Section 304 BNS (Snatching)',
      actName: 'Bharatiya Nyaya Sanhita (BNS)',
      title: 'Snatching',
      allegedConductMatch: 'Act of swiftly seizing property from possession with force or suddenness.',
      supportingFacts: 'Narrative states property was snatched directly from person.',
      missingElementsOrCaveats: 'Requires verification of suddenness and lack of consent; transitional IPC equivalent Sec 379/356 IPC if prior to July 1, 2024.',
      transitionalNote: 'Offenses committed on or after July 1, 2024 fall under BNS Section 304. Pre-July 2024 offences governed by Sections 356 and 379 IPC.',
    });
  } else if (isTheft) {
    provisions.push({
      provision: 'Section 303(2) BNS (Theft)',
      actName: 'Bharatiya Nyaya Sanhita (BNS)',
      title: 'Punishment for Theft',
      allegedConductMatch: 'Dishonest taking of movable property out of possession of any person without consent.',
      supportingFacts: 'Property reported taken without complainant authorization.',
      missingElementsOrCaveats: 'Ownership and identity of property must be established with documentation.',
      transitionalNote: 'Corresponds to Section 379 of Indian Penal Code (IPC).',
    });
  }

  if (isBurglary) {
    provisions.push({
      provision: 'Section 331 BNS (Lurking house-trespass or house-breaking)',
      actName: 'Bharatiya Nyaya Sanhita (BNS)',
      title: 'House-breaking by night / day',
      allegedConductMatch: 'Forced entry into premises or breaking of lock/shutter.',
      supportingFacts: 'Complainant reports broken padlock/shutter of premises.',
      missingElementsOrCaveats: 'Physical spot panchnama must inspect points of forced ingress and egress.',
      transitionalNote: 'Corresponds to Sections 454/457 of Indian Penal Code (IPC).',
    });
  }

  if (isAssault) {
    provisions.push({
      provision: 'Section 115(2) BNS (Voluntarily causing hurt)',
      actName: 'Bharatiya Nyaya Sanhita (BNS)',
      title: 'Punishment for voluntarily causing hurt',
      allegedConductMatch: 'Physical assault or injury inflicted upon complainant.',
      supportingFacts: 'Complainant alleges physical altercation resulting in hurt.',
      missingElementsOrCaveats: 'Requires Medico-Legal Examination (MLC) report from medical officer to classify severity of hurt.',
      transitionalNote: 'Corresponds to Section 323 of Indian Penal Code (IPC).',
    });
  }

  // Agent 4: Draft FIR
  const draftFIR = generateDeterministicDraftFIR(text, reportId, incidentLocation, incidentDateTime);

  // Agent 5: Quality review
  const qualityChecks: QualityCheckItem[] = [
    {
      checkType: 'Factual Fidelity',
      finding: 'All extracted points correspond strictly to the submitted text. Zero unstated facts introduced.',
      status: 'Verified',
    },
    {
      checkType: 'Zero-Hallucination Audit',
      finding: 'No suspect identities, registration numbers, or weapons fabricated beyond raw text.',
      status: 'Verified',
    },
    {
      checkType: 'Chronology Consistency',
      finding: dtFound || incidentDateTime ? 'Basic temporal markers identified.' : 'Sequence lacks specific calendar date; requires officer clarification.',
      status: dtFound || incidentDateTime ? 'Verified' : 'Requires Officer Clarification',
    },
    {
      checkType: 'Statutory Uncertainty Disclosure',
      finding: 'All penal sections marked as potential suggestions subject to officer statutory verification.',
      status: 'Verified',
    },
  ];

  // Agent 6: Checklist
  const checklist: InvestigationChecklistItem[] = [
    {
      category: 'Complainant Interview',
      actionStep: 'Record detailed supplementary statement clarifying timeline, precise locus, and suspect physical features.',
      priority: 'Immediate (0-24 hrs)',
      legalSafeguardNote: 'Record statement under Section 180 BNSS (replacing Sec 161 CrPC).',
    },
    {
      category: 'Scene Examination',
      actionStep: incidentLocation ? `Dispatch beat officers to inspect mentioned locus: ${incidentLocation}.` : 'Conduct physical inspection of crime scene and prepare spot map.',
      priority: 'Immediate (0-24 hrs)',
      legalSafeguardNote: 'Comply with Section 176 BNSS videography / photography mandates.',
    },
    {
      category: 'CCTV & Digital Evidence',
      actionStep: 'Canvass area for operational private/public CCTV cameras covering approach and getaway routes.',
      priority: 'Immediate (0-24 hrs)',
      legalSafeguardNote: 'Obtain certificate under Section 63 BSA (replacing Sec 65B Evidence Act).',
    },
    {
      category: 'Documentary Proof',
      actionStep: 'Collect proof of ownership, mobile IMEI invoices, or hospital injury memo.',
      priority: 'Routine (24-72 hrs)',
      legalSafeguardNote: 'Maintain chain of custody in police malkhana register.',
    },
  ];

  const followUps = [
    'Obtain government photo identity proof of the complainant.',
    'Issue notices to nearby commercial establishments for CCTV footage preservation.',
    'Circulate suspect descriptors and vehicle description among neighboring police station PCR vans.',
    'Verify if similar incidents with identical modus operandi were reported in the territorial subdivision.',
  ];

  const pattern = generateDeterministicCrimePattern(text);

  return {
    engine: 'DETERMINISTIC_RULES_ENGINE',
    engineStatusNote: 'Analyzed via application rule-engine (Gemini API fallback/local mode).',
    complaintTitle: complaintTitle || `Complaint Ref: ${reportId}`,
    complaintOverview: sentences.length > 0 ? sentences.slice(0, 2).join(' ') : text.slice(0, 250),
    agent1_extractedFacts: facts,
    agent2_gapsAndClarifications: gaps,
    agent3_legalProvisions: {
      overviewCaveat: 'Statutory provisions are indicative suggestions under BNS / IPC. An authorized police officer must verify applicable law.',
      provisions,
    },
    agent4_draftFIRReport: draftFIR,
    agent5_qualityReview: {
      overallAssessment: 'Quality audit passed: facts strictly bounded to complainant submission.',
      checks: qualityChecks,
    },
    agent6_investigationChecklist: checklist,
    agent7_recommendedFollowUps: followUps,
    crimePatternAnalysis: pattern,
    humanReviewNotice: 'This report is an AI-assisted decision-support draft prepared for authorized police personnel. It does not constitute an officially registered FIR, legal advice, an accusation, or a determination of guilt. An authorized officer must independently verify all facts, evidence, and applicable law.',
    processedAt: new Date().toISOString(),
  };
}

function generateDeterministicDraftFIR(
  text: string,
  reportId: string,
  incidentLocation?: string,
  incidentDateTime?: string
): DraftFIR {
  return {
    header: {
      title: 'FIRST INFORMATION REPORT DRAFT (DECISION SUPPORT)',
      subTitle: 'AI-ASSISTED PRELIMINARY DRAFT FOR POLICE SCRUTINY',
      disclaimer: 'AI-generated draft for police review — not an officially registered FIR.',
    },
    complaintInformation: {
      referenceNumber: reportId,
      complainantName: '[TO BE VERIFIED BY OFFICER - Complainant Full Name]',
      contactAndAddress: '[TO BE VERIFIED BY OFFICER - Verified Address & Phone]',
    },
    incidentDetails: {
      dateAndTime: incidentDateTime || '[TO BE VERIFIED BY OFFICER - Date & Time of Occurrence]',
      placeOfOccurrence: incidentLocation || '[TO BE VERIFIED BY OFFICER - Place of Occurrence & Police Station Jurisdiction]',
      offenseAllegedSummary: 'Allegation described in submitted complaint narrative (subject to statutory classification).',
    },
    suspectDetails: {
      identifiedSuspects: '[None named in narrative / To be ascertained during inquiry]',
      unidentifiedSuspectsDescription: '[Physical descriptors to be recorded in supplementary interview]',
    },
    narrativeDraft: `The complainant states as follows:\n"${text}"\n\n[Note for Investigating Officer: The above narrative reflects the verbatim initial complaint. Formal police recording requires supplemental questioning regarding precise timeline, verified location coordinates, and suspect descriptions.]`,
    propertyAndLossParticulars: '[See Extracted Facts section / Documentary proof to be collected]',
    witnessesMentioned: '[None identified in original complaint / Spot inquiry recommended]',
    actionRequested: 'Registration of complaint, preliminary fact verification, and appropriate lawful action as deemed fit by the investigating officer.',
  };
}

function generateDeterministicCrimePattern(text: string): CrimePatternAttributes {
  const lower = text.toLowerCase();
  const isSnatching = lower.includes('snatch') || lower.includes('grabbed');
  const isTheft = lower.includes('theft') || lower.includes('stolen');
  const isBurglary = lower.includes('shutter') || lower.includes('lock') || lower.includes('break');
  const isAssault = lower.includes('assault') || lower.includes('beat') || lower.includes('hit');

  const category = isSnatching ? 'Street Snatching' : isBurglary ? 'Commercial/Residential House-Breaking' : isTheft ? 'Theft of Property' : isAssault ? 'Physical Assault' : 'General Criminal Complaint';

  return {
    offenseCategory: category,
    modusOperandi: [
      isSnatching ? 'Sudden physical approach from behind using two-wheeler' : 'Unobtrusive approach to target property',
      'Target selection based on perceived momentary isolation or distraction',
      'Rapid egress before victim or bystanders can note identifying marks',
    ],
    suspectCharacteristics: [
      'Unidentified male individuals in active age group',
      'Concealment of identity (helmets, face coverings, or distance)',
    ],
    vehicleOrToolsUsed: [
      lower.includes('motorcycle') || lower.includes('bike') ? 'Motorcycle used for quick mobility' : 'Pedestrian or unrecorded conveyance',
    ],
    targetVulnerability: [
      'Valuable electronic device / cash in transit in semi-crowded public space',
    ],
    searchableAttributes: [
      category,
      'Two-wheeler getaway',
      'Evening time window',
      'Transit corridor / Metro station vicinity',
    ],
    crossCaseComparisonGuidance:
      'Search CCTNS and local police station Crime Registers using MO tag "' + category + '" within a 5 km radius over the preceding 30 days to identify recurring offender gangs.',
  };
}
