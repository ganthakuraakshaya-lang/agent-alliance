import React, { useState } from 'react';
import {
  FileText,
  Send,
  RotateCcw,
  Copy,
  Download,
  Printer,
  Check,
  AlertTriangle,
  Scale,
  Shield,
  Layers,
  Sparkles,
  GitCompare,
  Clock,
  MapPin,
  Calendar,
  CheckSquare,
  ListOrdered,
  Search,
} from 'lucide-react';
import { FIRReport, FIRAnalysisResult, CompareCasesResult } from '../types/fir';
import { api } from '../services/api';

interface DashboardPageProps {
  onReportGenerated?: (report: FIRReport) => void;
  initialReport?: FIRReport | null;
}

const SAMPLE_COMPLAINTS = [
  {
    title: 'Metro Station Phone Snatching',
    location: 'Rajiv Chowk Metro Gate 3, New Delhi',
    dateTime: 'Yesterday around 8:30 PM',
    narrative: `Yesterday evening around 8:30 PM, I was walking towards Gate 3 of Rajiv Chowk Metro Station while speaking on my mobile phone. Suddenly, two unknown men riding a black motorcycle came from behind at high speed and snatched my phone directly from my hand. The pillion rider wore a dark helmet and black jacket. They immediately accelerated towards the outer circle before I could note down their registration plate. The phone is a OnePlus 11 (Black color, 256GB, IMEI not with me right now). I shouted for help but the crowd was moving quickly. Please register an FIR and recover my mobile.`,
  },
  {
    title: 'Commercial Electronics Shop Burglary',
    location: 'Shop No. 14, Main Market, Sector 18',
    dateTime: 'Between Saturday 21:00 hrs and Monday 09:00 hrs',
    narrative: `I am the proprietor of Raj Electronics. This morning at approximately 09:15 AM, when I arrived to open my shop, I discovered that the central padlock of the iron shutter had been broken with an iron cutter. Upon entering, I found that 12 boxed smartphones and cash amounting to approximately Rs. 65,000 kept in the cash drawer were missing. The incident occurred sometime over the weekend between closing on Saturday night and opening today. A CCTV camera is installed at the adjoining chemist shop which may have recorded the perpetrators.`,
  },
  {
    title: 'Vehicle Road Rage & Hurt Allegation',
    location: 'Near Community Center, Ring Road',
    dateTime: '12th July at approximately 19:45 hrs',
    narrative: `On 12th July at about 7:45 PM, while driving near the Ring Road flyover, another vehicle bearing registration DL-3C-XXXX brushed against my car. When I stopped to inspect the damage, the driver and two occupants got out, used abusive language, and physically assaulted me. One individual hit my left shoulder with a wooden stick, causing swelling and intense pain. Several motorists stopped and intervened, causing the assailants to drive off threatening to kill me if I approached police. I received first aid at City Civil Hospital.`,
  },
];

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onReportGenerated,
  initialReport,
}) => {
  // Input Workspace State
  const [complaintTitle, setComplaintTitle] = useState(initialReport?.complaintTitle || '');
  const [complaintText, setComplaintText] = useState(initialReport?.complaintText || '');
  const [incidentLocation, setIncidentLocation] = useState(initialReport?.incidentLocation || '');
  const [incidentDateTime, setIncidentDateTime] = useState(initialReport?.incidentDateTime || '');

  // Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [currentReport, setCurrentReport] = useState<FIRReport | null>(initialReport || null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'facts' | 'gaps' | 'legal' | 'draft' | 'checklist' | 'quality' | 'actions' | 'similarity'
  >('draft');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Comparison State (Section 6)
  const [comparisonText, setComparisonText] = useState('');
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<CompareCasesResult | null>(null);

  const characterCount = complaintText.length;
  const wordCount = complaintText.trim() ? complaintText.trim().split(/\s+/).length : 0;

  const handleClear = () => {
    setComplaintTitle('');
    setComplaintText('');
    setIncidentLocation('');
    setIncidentDateTime('');
    setErrorMessage(null);
  };

  const handleLoadSample = (sample: typeof SAMPLE_COMPLAINTS[0]) => {
    setComplaintTitle(sample.title);
    setIncidentLocation(sample.location);
    setIncidentDateTime(sample.dateTime);
    setComplaintText(sample.narrative);
    setErrorMessage(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = complaintText.trim();
    if (!trimmed) {
      setErrorMessage('Complaint narrative text is required before running AI analysis.');
      return;
    }

    setAnalyzing(true);
    setAnalysisStep('Initializing Gemini Agentic Orchestrator...');

    // Progress indications reflecting the 7 AI Agents
    const t1 = setTimeout(() => setAnalysisStep('Agent 1: Extracting explicit facts & verbatim statements...'), 500);
    const t2 = setTimeout(() => setAnalysisStep('Agent 2: Auditing chronology & information gaps...'), 1100);
    const t3 = setTimeout(() => setAnalysisStep('Agent 3: Researching Bharatiya Nyaya Sanhita (BNS) & statutory provisions...'), 1800);
    const t4 = setTimeout(() => setAnalysisStep('Agent 4: Generating preliminary FIR draft for officer review...'), 2600);
    const t5 = setTimeout(() => setAnalysisStep('Agent 5-7: Running zero-hallucination audit & compiling investigation checklist...'), 3400);

    try {
      const report = await api.analyzeComplaint({
        complaintText: trimmed,
        complaintTitle: complaintTitle.trim() || undefined,
        incidentLocation: incidentLocation.trim() || undefined,
        incidentDateTime: incidentDateTime.trim() || undefined,
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);

      setCurrentReport(report);
      setActiveTab('draft');
      if (onReportGenerated) {
        onReportGenerated(report);
      }
    } catch (err: unknown) {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred during agentic analysis.');
      }
    } finally {
      setAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const generateFullReportText = (rep: FIRReport): string => {
    const res = rep.analysisResult;
    const d = res.agent4_draftFIRReport;
    return `
================================================================================
FIR ANALYZER AGENTIC AI — COMPLAINT ANALYSIS DOSSIER
Reference: ${rep.id} | Engine: ${res.engine}
Date Processed: ${new Date(rep.submittedAt).toLocaleString()}
Reviewer: ${rep.reviewer}
================================================================================

[MANDATORY NOTICE]
${res.humanReviewNotice}

1. COMPLAINT INFORMATION
Title: ${rep.complaintTitle || 'N/A'}
Incident Location: ${rep.incidentLocation || 'Not specified separately'}
Incident Date/Time: ${rep.incidentDateTime || 'Not specified separately'}

ORIGINAL COMPLAINT STATEMENT (VERBATIM):
"${rep.complaintText}"

2. COMPLAINT OVERVIEW
${res.complaintOverview}

3. EXPLICIT FACTS EXTRACTED (AGENT 1)
${res.agent1_extractedFacts.map((f) => `- [${f.category}] (${f.sourceConfidence}): ${f.detail}`).join('\n')}

4. MISSING INFORMATION & CLARIFICATION GAPS (AGENT 2)
${res.agent2_gapsAndClarifications.map((g) => `- [${g.importance}] ${g.field}: ${g.explanation} -> Suggested question: ${g.suggestedClarification}`).join('\n')}

5. POTENTIAL LEGAL CONSIDERATIONS (AGENT 3 - BNS / BNSS / BSA)
Caveat: ${res.agent3_legalProvisions.overviewCaveat}
${res.agent3_legalProvisions.provisions
  .map(
    (p) =>
      `* ${p.provision} (${p.actName}) - ${p.title}\n  Conduct: ${p.allegedConductMatch}\n  Supporting Facts: ${p.supportingFacts}\n  Caveats: ${p.missingElementsOrCaveats}\n  Transitional: ${p.transitionalNote}`
  )
  .join('\n\n')}

6. DRAFT FIR REPORT (AGENT 4)
Header: ${d.header.title}
Notice: ${d.header.disclaimer}
Complainant: ${d.complaintInformation.complainantName} | ${d.complaintInformation.contactAndAddress}
Incident: ${d.incidentDetails.dateAndTime} | ${d.incidentDetails.placeOfOccurrence}
Offense Alleged: ${d.incidentDetails.offenseAllegedSummary}
Suspects: ${d.suspectDetails.identifiedSuspects} | ${d.suspectDetails.unidentifiedSuspectsDescription}
Property Details: ${d.propertyAndLossParticulars}
Witnesses: ${d.witnessesMentioned}

NARRATIVE DRAFT:
${d.narrativeDraft}

7. QUALITY & FIDELITY AUDIT (AGENT 5)
Overall: ${res.agent5_qualityReview.overallAssessment}
${res.agent5_qualityReview.checks.map((c) => `- [${c.status}] ${c.checkType}: ${c.finding}`).join('\n')}

8. INVESTIGATION CHECKLIST (AGENT 6)
${res.agent6_investigationChecklist.map((i) => `- [${i.priority}] (${i.category}): ${i.actionStep} (Procedural Note: ${i.legalSafeguardNote})`).join('\n')}

9. ACTION & FOLLOW-UP RECOMMENDATIONS (AGENT 7)
${res.agent7_recommendedFollowUps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

10. CRIME PATTERN & MODUS OPERANDI INTELLIGENCE
Offense Category: ${res.crimePatternAnalysis.offenseCategory}
Modus Operandi: ${res.crimePatternAnalysis.modusOperandi.join('; ')}
Suspect Characteristics: ${res.crimePatternAnalysis.suspectCharacteristics.join('; ')}
Searchable Attributes: ${res.crimePatternAnalysis.searchableAttributes.join(', ')}
Guidance: ${res.crimePatternAnalysis.crossCaseComparisonGuidance}
================================================================================
`.trim();
  };

  const handleCopyReport = () => {
    if (!currentReport) return;
    const text = generateFullReportText(currentReport);
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadReport = () => {
    if (!currentReport) return;
    const text = generateFullReportText(currentReport);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentReport.id}_ANALYSIS_REPORT.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRunComparison = async () => {
    if (!currentReport || !comparisonText.trim()) return;
    setComparing(true);
    try {
      const res = await api.compareCases(currentReport.complaintText, comparisonText.trim());
      setComparisonResult(res);
    } catch (err) {
      console.error('Comparison error:', err);
    } finally {
      setComparing(false);
    }
  };

  const res = currentReport?.analysisResult;

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Dashboard Main Heading */}
      <div className="border-b-2 border-black pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black uppercase">
              FIR ANALYZER AGENTIC AI
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-black/70 italic font-serif">
              AI-assisted complaint analysis, legal research, investigation support, and crime-pattern intelligence.
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 bg-black text-[#A38F58] text-[10px] font-mono uppercase tracking-wider font-bold">
              Standalone Agentic System
            </span>
          </div>
        </div>
      </div>

      {/* Primary Complaint Input Workspace */}
      <div className="no-print border border-black/20 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-black/10 pb-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-[#A38F58]" />
            <h2 className="text-xs font-bold text-black uppercase tracking-wider">
              Complaint Intake & Narrative Workspace
            </h2>
          </div>
          <span className="text-[11px] text-black/50">Primary Input Form</span>
        </div>

        {/* Sample Loaders for evaluation */}
        <div className="p-3 bg-[#F8F6F0] border border-black/10 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-black uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-[#A38F58]" />
              <span>Load Synthetic Evaluation Test Narrative</span>
            </span>
            <span className="text-[10px] text-black/50 font-mono">1-Click Loader</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
            {SAMPLE_COMPLAINTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadSample(sample)}
                disabled={analyzing}
                className="text-left p-2 border border-black/20 bg-white hover:border-[#A38F58] hover:bg-black/5 transition-colors text-xs"
              >
                <div className="font-semibold text-black text-[11px] line-clamp-1">{sample.title}</div>
                <div className="text-[10px] text-black/60 line-clamp-1 mt-0.5">{sample.location}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="complaintTitle" className="block text-[11px] font-semibold text-black uppercase tracking-wider mb-1">
                Complaint Title / Reference (Optional)
              </label>
              <input
                id="complaintTitle"
                type="text"
                value={complaintTitle}
                onChange={(e) => setComplaintTitle(e.target.value)}
                placeholder="e.g. Snatching outside Metro Gate 3"
                disabled={analyzing}
                className="w-full border border-black/25 px-3 py-2 text-xs text-black placeholder-black/40 focus:outline-none focus:border-[#A38F58] focus:ring-1 focus:ring-[#A38F58]"
              />
            </div>
            <div>
              <label htmlFor="incidentLocation" className="block text-[11px] font-semibold text-black uppercase tracking-wider mb-1 flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-[#A38F58]" />
                <span>Incident Location (Optional)</span>
              </label>
              <input
                id="incidentLocation"
                type="text"
                value={incidentLocation}
                onChange={(e) => setIncidentLocation(e.target.value)}
                placeholder="e.g. Rajiv Chowk Metro Gate 3"
                disabled={analyzing}
                className="w-full border border-black/25 px-3 py-2 text-xs text-black placeholder-black/40 focus:outline-none focus:border-[#A38F58] focus:ring-1 focus:ring-[#A38F58]"
              />
            </div>
            <div>
              <label htmlFor="incidentDateTime" className="block text-[11px] font-semibold text-black uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-[#A38F58]" />
                <span>Incident Date & Time (Optional)</span>
              </label>
              <input
                id="incidentDateTime"
                type="text"
                value={incidentDateTime}
                onChange={(e) => setIncidentDateTime(e.target.value)}
                placeholder="e.g. 14th Oct, 20:30 hrs"
                disabled={analyzing}
                className="w-full border border-black/25 px-3 py-2 text-xs text-black placeholder-black/40 focus:outline-none focus:border-[#A38F58] focus:ring-1 focus:ring-[#A38F58]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="complaintText" className="block text-xs font-bold text-black uppercase tracking-wider">
                Complaint Narrative (Primary Input &middot; Natural Language Unstructured Text)
              </label>
              <div className="text-[11px] font-mono text-black/60 space-x-2">
                <span>{wordCount} words</span>
                <span>&middot;</span>
                <span>{characterCount} chars</span>
              </div>
            </div>
            <textarea
              id="complaintText"
              rows={8}
              required
              value={complaintText}
              onChange={(e) => {
                setComplaintText(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              disabled={analyzing}
              placeholder="Paste or type the complete complaint narrative in natural language here. Unstructured text, citizen statements, and chronological accounts are accepted without requiring a rigid format..."
              className="w-full border border-black/30 p-3.5 text-xs sm:text-sm text-black placeholder-black/40 focus:outline-none focus:border-[#A38F58] focus:ring-1 focus:ring-[#A38F58] font-sans leading-relaxed disabled:bg-black/5"
            />
          </div>

          {errorMessage && (
            <div role="alert" className="p-3 border-2 border-black bg-black/5 text-xs text-black font-medium flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#A38F58] shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Real-time Agentic Progress */}
          {analyzing && (
            <div className="p-4 border border-[#A38F58] bg-[#F8F6F0] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-black flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#A38F58] animate-spin" />
                  <span>Executing 7-Agent AI Workflow via Google Gemini...</span>
                </span>
                <span className="text-[10px] font-mono text-black/60">PROCESSING</span>
              </div>
              <p className="text-xs text-black/80 font-mono pl-6">
                {analysisStep}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={analyzing || (!complaintText && !complaintTitle)}
              className="px-4 py-2 border border-black/20 text-xs font-semibold text-black hover:bg-black/5 disabled:opacity-40 transition-colors uppercase tracking-wider flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Input</span>
            </button>

            <button
              type="submit"
              disabled={analyzing || !complaintText.trim()}
              className="px-6 py-2.5 bg-[#A38F58] text-black hover:bg-black hover:text-white font-bold text-xs tracking-wider uppercase flex items-center space-x-2 border border-[#A38F58] transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{analyzing ? 'Analyzing Complaint...' : 'Analyze Complaint'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Results View */}
      {currentReport && res && (
        <div className="print-area space-y-6">
          {/* Dossier Header and Controls */}
          <div className="border border-black/20 bg-white p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/15 pb-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-black/60">
                  OFFICER DECISION SUPPORT DOSSIER
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-black mt-0.5">
                  {currentReport.complaintTitle || currentReport.id}
                </h2>
                <div className="text-xs text-black/60 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono">
                  <span>Ref: {currentReport.id}</span>
                  <span>Date: {new Date(currentReport.submittedAt).toLocaleString()}</span>
                  <span>Engine: {res.engine}</span>
                </div>
              </div>

              {/* Action Buttons: Copy, Download, Print */}
              <div className="no-print flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="px-3 py-1.5 border border-black/30 hover:border-black text-xs font-semibold text-black flex items-center space-x-1.5 transition-colors"
                  title="Copy full dossier text"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-[#A38F58]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Copied' : 'Copy Report'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="px-3 py-1.5 border border-black/30 hover:border-black text-xs font-semibold text-black flex items-center space-x-1.5 transition-colors"
                  title="Download report as .txt file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-[#A38F58] text-black hover:bg-black hover:text-white text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 transition-colors"
                  title="Print report or save as PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>

            {/* Human Review Disclaimer */}
            <div className="p-3 border-2 border-black bg-[#F8F6F0] text-xs leading-relaxed space-y-1">
              <div className="font-bold uppercase tracking-wider text-black flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-[#A38F58] shrink-0" />
                <span>MANDATORY STATUTORY DISCLAIMER</span>
              </div>
              <p className="text-black/80 text-[11px]">
                {res.humanReviewNotice}
              </p>
            </div>

            {/* Section Tabs */}
            <div className="no-print flex flex-wrap gap-1 border-b border-black/20 pt-2 text-xs">
              {[
                { id: 'draft', label: 'Draft FIR (Agent 4)' },
                { id: 'overview', label: 'Overview' },
                { id: 'facts', label: 'Facts (Agent 1)' },
                { id: 'gaps', label: 'Missing Gaps (Agent 2)' },
                { id: 'legal', label: 'Legal Sections (Agent 3)' },
                { id: 'checklist', label: 'Checklist (Agent 6)' },
                { id: 'quality', label: 'Quality Audit (Agent 5)' },
                { id: 'actions', label: 'Next Steps (Agent 7)' },
                { id: 'similarity', label: 'Crime Patterns & Similarity' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 font-semibold transition-colors border-b-2 text-xs ${
                    activeTab === tab.id
                      ? 'border-[#A38F58] text-black bg-[#F8F6F0]'
                      : 'border-transparent text-black/60 hover:text-black hover:border-black/20'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT AREAS */}

            {/* 1. DRAFT FIR REPORT (Agent 4) */}
            {activeTab === 'draft' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-black/10 pb-2">
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider flex items-center space-x-2">
                    <span className="font-mono text-[#A38F58]">AGENT 4</span>
                    <span>&middot; Draft First Information Report (FIR)</span>
                  </h3>
                  <span className="text-[11px] font-mono text-black/60">
                    AI-Generated Draft for Police Review
                  </span>
                </div>

                <div className="p-4 border-2 border-black bg-white space-y-4 font-sans text-xs">
                  <div className="text-center border-b border-black/20 pb-3">
                    <div className="font-bold text-sm uppercase tracking-wide text-black">
                      {res.agent4_draftFIRReport.header.title}
                    </div>
                    <div className="text-[11px] font-semibold text-[#A38F58] tracking-widest uppercase mt-0.5">
                      {res.agent4_draftFIRReport.header.subTitle}
                    </div>
                    <div className="text-[10px] text-black/70 italic mt-1 font-mono">
                      {res.agent4_draftFIRReport.header.disclaimer}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-[#F8F6F0] border border-black/10 font-mono text-[11px]">
                    <div>
                      <span className="font-bold uppercase text-black/60 block text-[10px]">Reference & Informant</span>
                      <div className="mt-1 font-semibold">{res.agent4_draftFIRReport.complaintInformation.referenceNumber}</div>
                      <div>{res.agent4_draftFIRReport.complaintInformation.complainantName}</div>
                      <div className="text-black/70">{res.agent4_draftFIRReport.complaintInformation.contactAndAddress}</div>
                    </div>
                    <div>
                      <span className="font-bold uppercase text-black/60 block text-[10px]">Occurrence Details</span>
                      <div className="mt-1 font-semibold">{res.agent4_draftFIRReport.incidentDetails.dateAndTime}</div>
                      <div>{res.agent4_draftFIRReport.incidentDetails.placeOfOccurrence}</div>
                      <div className="text-black/70">{res.agent4_draftFIRReport.incidentDetails.offenseAllegedSummary}</div>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold uppercase text-black/60 block text-[10px] mb-1">
                      Draft Narrative Section
                    </span>
                    <div className="p-3 border border-black/15 bg-white font-serif text-xs leading-relaxed whitespace-pre-wrap italic">
                      {res.agent4_draftFIRReport.narrativeDraft}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 border border-black/10">
                      <span className="font-bold uppercase text-black/50 block text-[10px]">Suspect Particulars</span>
                      <p className="mt-1 text-black/80">{res.agent4_draftFIRReport.suspectDetails.unidentifiedSuspectsDescription}</p>
                    </div>
                    <div className="p-2.5 border border-black/10">
                      <span className="font-bold uppercase text-black/50 block text-[10px]">Reported Loss / Injury</span>
                      <p className="mt-1 text-black/80">{res.agent4_draftFIRReport.propertyAndLossParticulars}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-4 pt-2">
                <div className="border border-black/15 p-4 space-y-2">
                  <h3 className="text-xs font-bold text-black uppercase tracking-wider">
                    Original Verbatim Complaint
                  </h3>
                  <div className="p-3 bg-[#F8F6F0] border border-black/10 text-xs italic font-serif whitespace-pre-wrap leading-relaxed">
                    "{currentReport.complaintText}"
                  </div>
                </div>

                <div className="border border-black/15 p-4 space-y-2">
                  <h3 className="text-xs font-bold text-black uppercase tracking-wider">
                    Executive Complaint Summary
                  </h3>
                  <p className="text-xs text-black/80 leading-relaxed">
                    {res.complaintOverview}
                  </p>
                </div>
              </div>
            )}

            {/* 3. FACTS (Agent 1) */}
            {activeTab === 'facts' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-black/10 pb-2">
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider flex items-center space-x-2">
                    <span className="font-mono text-[#A38F58]">AGENT 1</span>
                    <span>&middot; Explicit Facts Extracted</span>
                  </h3>
                  <span className="text-[10px] font-mono text-black/50">Zero-Extrapolation Audit</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-black/15">
                    <thead>
                      <tr className="bg-[#F8F6F0] border-b border-black/15 text-[10px] font-bold uppercase tracking-wider text-black">
                        <th className="py-2.5 px-3 w-1/4">Category</th>
                        <th className="py-2.5 px-3 w-1/2">Stated Fact Detail</th>
                        <th className="py-2.5 px-3 w-1/4">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10">
                      {res.agent1_extractedFacts.map((fact, idx) => (
                        <tr key={idx} className="hover:bg-black/5">
                          <td className="py-2.5 px-3 font-semibold text-black">{fact.category}</td>
                          <td className="py-2.5 px-3 text-black/80">{fact.detail}</td>
                          <td className="py-2.5 px-3 font-mono text-[11px]">
                            <span className="px-1.5 py-0.5 border border-black/20 text-black">
                              {fact.sourceConfidence}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. GAPS (Agent 2) */}
            {activeTab === 'gaps' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-black/10 pb-2">
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider flex items-center space-x-2">
                    <span className="font-mono text-[#A38F58]">AGENT 2</span>
                    <span>&middot; Missing Information and Gap Checker</span>
                  </h3>
                  <span className="text-[10px] font-mono text-black/50">Clarification Points</span>
                </div>

                <div className="space-y-2">
                  {res.agent2_gapsAndClarifications.map((gap, idx) => (
                    <div key={idx} className="p-3 border border-black/15 bg-white text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-black">{gap.field}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 border border-black/30 font-semibold text-black">
                          {gap.importance}
                        </span>
                      </div>
                      <p className="text-black/70 text-[11px]">{gap.explanation}</p>
                      <div className="pt-1 text-[11px] text-[#A38F58] font-medium">
                        Suggested Clarification: {gap.suggestedClarification}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. LEGAL (Agent 3) */}
            {activeTab === 'legal' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-black/10 pb-2">
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider flex items-center space-x-2">
                    <Scale className="w-4 h-4 text-[#A38F58]" />
                    <span className="font-mono text-[#A38F58]">AGENT 3</span>
                    <span>&middot; Legal Section Research Assistant</span>
                  </h3>
                  <span className="text-[10px] font-mono text-black/50">BNS &middot; BNSS &middot; BSA</span>
                </div>

                <div className="p-3 bg-[#F8F6F0] border-l-2 border-black text-xs text-black/80 font-medium">
                  {res.agent3_legalProvisions.overviewCaveat}
                </div>

                <div className="space-y-3">
                  {res.agent3_legalProvisions.provisions.map((prov, idx) => (
                    <div key={idx} className="p-4 border border-black/20 bg-white text-xs space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="font-bold text-black text-sm font-mono">{prov.provision}</div>
                        <span className="font-mono text-[10px] px-2 py-0.5 bg-black text-[#A38F58] font-bold">
                          {prov.actName}
                        </span>
                      </div>
                      <div className="font-semibold text-black/90">{prov.title}</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[11px]">
                        <div className="p-2 bg-[#F8F6F0] border border-black/10">
                          <span className="font-bold text-black/60 block text-[10px]">Matching Allegation Conduct:</span>
                          <span className="text-black/80">{prov.allegedConductMatch}</span>
                        </div>
                        <div className="p-2 bg-[#F8F6F0] border border-black/10">
                          <span className="font-bold text-black/60 block text-[10px]">Supporting Facts from Narrative:</span>
                          <span className="text-black/80">{prov.supportingFacts}</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-black/70 italic">
                        <strong>Caveat / Proof Elements:</strong> {prov.missingElementsOrCaveats}
                      </div>
                      {prov.transitionalNote && (
                        <div className="text-[10px] font-mono text-black/60 bg-black/5 p-1.5 border border-black/10">
                          Transitional Provision: {prov.transitionalNote}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. CHECKLIST (Agent 6) */}
            {activeTab === 'checklist' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-black/10 pb-2">
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider flex items-center space-x-2">
                    <CheckSquare className="w-4 h-4 text-[#A38F58]" />
                    <span className="font-mono text-[#A38F58]">AGENT 6</span>
                    <span>&middot; Evidence & Investigation Checklist</span>
                  </h3>
                  <span className="text-[10px] font-mono text-black/50">Investigative Procedure</span>
                </div>

                <div className="space-y-2">
                  {res.agent6_investigationChecklist.map((item, idx) => (
                    <div key={idx} className="p-3 border border-black/15 bg-white text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-black">{item.category}</span>
                        <span className="font-mono text-[10px] px-2 py-0.5 border border-black/20 text-black">
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-black/90 font-medium">{item.actionStep}</p>
                      <div className="text-[10px] text-black/60 font-mono">
                        Procedural Safeguard: {item.legalSafeguardNote}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. QUALITY AUDIT (Agent 5) */}
            {activeTab === 'quality' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-black/10 pb-2">
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider flex items-center space-x-2">
                    <span className="font-mono text-[#A38F58]">AGENT 5</span>
                    <span>&middot; Final Quality Checker & Zero-Hallucination Audit</span>
                  </h3>
                  <span className="text-[10px] font-mono text-black/50">Factual Integrity</span>
                </div>

                <div className="p-3 bg-[#F8F6F0] border border-black/15 text-xs text-black/80 font-medium">
                  {res.agent5_qualityReview.overallAssessment}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {res.agent5_qualityReview.checks.map((qc, idx) => (
                    <div key={idx} className="p-3 border border-black/15 bg-white space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-black">{qc.checkType}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 border border-black/20 text-black">
                          {qc.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-black/70">{qc.finding}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. NEXT STEPS (Agent 7) */}
            {activeTab === 'actions' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-black/10 pb-2">
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider flex items-center space-x-2">
                    <ListOrdered className="w-4 h-4 text-[#A38F58]" />
                    <span className="font-mono text-[#A38F58]">AGENT 7</span>
                    <span>&middot; Action & Follow-up Recommendations</span>
                  </h3>
                  <span className="text-[10px] font-mono text-black/50">Next Steps</span>
                </div>

                <div className="space-y-2">
                  {res.agent7_recommendedFollowUps.map((step, idx) => (
                    <div key={idx} className="p-3 border border-black/15 bg-white text-xs flex items-start space-x-3">
                      <span className="font-mono font-bold text-[#A38F58] text-sm shrink-0">{idx + 1}.</span>
                      <p className="text-black/90 font-medium">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. CRIME PATTERNS & SIMILARITY (Section 6) */}
            {activeTab === 'similarity' && (
              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between border-b border-black/10 pb-2">
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider flex items-center space-x-2">
                    <Search className="w-4 h-4 text-[#A38F58]" />
                    <span>Section 6 &middot; Crime Pattern & Similarity Intelligence</span>
                  </h3>
                  <span className="text-[10px] font-mono text-black/50">Modus Operandi Attributes</span>
                </div>

                {/* Pattern attributes card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 border border-black/20 bg-white space-y-2">
                    <span className="font-bold text-black uppercase text-[10px] block">Offense Classification & MO:</span>
                    <div className="font-bold text-sm text-[#A38F58]">{res.crimePatternAnalysis.offenseCategory}</div>
                    <ul className="list-disc list-inside space-y-1 text-black/80 text-[11px] pt-1">
                      {res.crimePatternAnalysis.modusOperandi.map((mo, i) => (
                        <li key={i}>{mo}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 border border-black/20 bg-white space-y-2">
                    <span className="font-bold text-black uppercase text-[10px] block">Searchable Incident Attributes:</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {res.crimePatternAnalysis.searchableAttributes.map((attr, i) => (
                        <span key={i} className="px-2 py-0.5 border border-black text-[11px] font-mono">
                          {attr}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-black/70 pt-2 leading-relaxed">
                      <strong>CCTNS / Database Guidance:</strong> {res.crimePatternAnalysis.crossCaseComparisonGuidance}
                    </p>
                  </div>
                </div>

                {/* Interactive Multi-Complaint Comparison in current session */}
                <div className="p-4 sm:p-5 border-2 border-black bg-[#F8F6F0] space-y-3">
                  <div className="flex items-center space-x-2 border-b border-black/15 pb-2">
                    <GitCompare className="w-4 h-4 text-[#A38F58]" />
                    <h4 className="text-xs font-bold text-black uppercase tracking-wider">
                      Compare With Another Complaint in Current Session
                    </h4>
                  </div>
                  <p className="text-[11px] text-black/70">
                    If another related complaint was submitted in this session, paste its narrative below to evaluate potential similarities, differences, and investigative correlations without external database access.
                  </p>

                  <textarea
                    rows={4}
                    value={comparisonText}
                    onChange={(e) => setComparisonText(e.target.value)}
                    placeholder="Paste second complaint narrative to compare with current dossier..."
                    className="w-full border border-black/30 p-2.5 text-xs text-black placeholder-black/40 focus:outline-none focus:border-[#A38F58] bg-white"
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={comparing || !comparisonText.trim()}
                      onClick={handleRunComparison}
                      className="px-4 py-2 bg-black text-white hover:bg-[#A38F58] hover:text-black text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                      {comparing ? 'Comparing Complaints...' : 'Run Comparative Analysis'}
                    </button>
                  </div>

                  {comparisonResult && (
                    <div className="mt-4 p-4 bg-white border border-black/20 space-y-3 text-xs">
                      <div className="font-bold text-black uppercase tracking-wider text-[11px] border-b border-black/10 pb-1">
                        Comparative Findings
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                        <div>
                          <strong className="block text-black">Common Characteristics:</strong>
                          <ul className="list-disc list-inside space-y-0.5 text-black/80 mt-1">
                            {comparisonResult.commonCharacteristics.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong className="block text-black">Distinct Differences:</strong>
                          <ul className="list-disc list-inside space-y-0.5 text-black/80 mt-1">
                            {comparisonResult.distinctDifferences.map((d, i) => (
                              <li key={i}>{d}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="p-2 bg-[#F8F6F0] border border-black/10 text-[11px]">
                        <strong>Investigative Lead Suggestion:</strong> {comparisonResult.investigativeLeadSuggestion}
                      </div>
                      <div className="text-[10px] text-black/60 italic font-mono">
                        {comparisonResult.disclaimer}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
