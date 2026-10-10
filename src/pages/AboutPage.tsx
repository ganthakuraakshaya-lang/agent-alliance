import React from 'react';
import { Shield, Layers, Scale, AlertCircle, Cpu, CheckSquare, Search } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Header */}
      <div className="border-b-2 border-black pb-4">
        <div className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#A38F58] mb-1">
          <Shield className="w-3.5 h-3.5" />
          <span>System Information & Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black uppercase">
          About FIR Analyzer Agentic AI
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-black/70 italic font-serif">
          AI-assisted complaint analysis, legal research, investigation support, and crime-pattern intelligence.
        </p>
      </div>

      {/* Purpose & Boundary */}
      <div className="border border-black/15 bg-white p-6 space-y-3">
        <h2 className="text-sm font-bold text-black uppercase tracking-wider">
          System Purpose & Legal Safeguards
        </h2>
        <p className="text-xs text-black/80 leading-relaxed">
          FIR Analyzer Agentic AI is an autonomous, standalone decision-support application developed for authorized police officers. Powered by Google AI Studio and the Gemini API, it assists officers in converting unstructured, citizen-submitted complaint narratives into actionable, structured First Information Report (FIR) drafts and investigation roadmaps.
        </p>
        <div className="p-3 bg-[#F8F6F0] border-l-2 border-black text-xs text-black space-y-1">
          <div className="font-bold uppercase tracking-wider text-[11px]">Strict Operational Invariants:</div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-black/80">
            <li>Does <strong>not</strong> autonomously register an FIR into official police books.</li>
            <li>Does <strong>not</strong> determine guilt or declare any person an accused without officer verification.</li>
            <li>Does <strong>not</strong> use external third-party workflow automation platforms (no n8n).</li>
            <li>Does <strong>not</strong> store data in external databases (no Firebase, Firestore, or cloud databases).</li>
            <li>Final legal classification, penal section determination, and FIR approval rest exclusively with the authorized officer.</li>
          </ul>
        </div>
      </div>

      {/* The 7-Agent Architecture */}
      <div className="border border-black/15 bg-white p-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-black/10 pb-3">
          <Layers className="w-4 h-4 text-[#A38F58]" />
          <h2 className="text-sm font-bold text-black uppercase tracking-wider">
            Seven Logical AI Agents Architecture
          </h2>
        </div>
        <p className="text-xs text-black/70">
          The pipeline partitions analysis into seven clearly defined, verifiable stages orchestrated by application logic:
        </p>

        <div className="space-y-3 text-xs">
          <div className="p-3 border border-black/10 bg-white">
            <span className="font-mono font-bold text-[#A38F58]">Agent 1 &mdash; FIR Fact Extractor Agent:</span>
            <p className="text-black/80 mt-0.5">
              Extracts strictly explicit facts from the complaint narrative: complainant, victim, suspects, date, time, location, alleged events, property loss, weapons, and witnesses. Audits source confidence with zero extrapolation.
            </p>
          </div>

          <div className="p-3 border border-black/10 bg-white">
            <span className="font-mono font-bold text-[#A38F58]">Agent 2 &mdash; Missing Information & Gap Checker:</span>
            <p className="text-black/80 mt-0.5">
              Identifies chronological ambiguities, unspecified locations, missing physical suspect descriptors, and lack of ownership documentation. Classifies gaps as Critical, Relevant, or Optional and provides specific follow-up questions.
            </p>
          </div>

          <div className="p-3 border border-black/10 bg-white">
            <span className="font-mono font-bold text-[#A38F58]">Agent 3 &mdash; Legal Section Research Assistant:</span>
            <p className="text-black/80 mt-0.5">
              Researches applicable provisions under Indian criminal law, specifically the Bharatiya Nyaya Sanhita (BNS), Bharatiya Nagarik Suraksha Sanhita (BNSS), and Bharatiya Sakshya Adhiniyam (BSA), with transitional notes for pre-July 2024 IPC/CrPC offenses. Highlights proof caveats without drawing definitive conclusions.
            </p>
          </div>

          <div className="p-3 border border-black/10 bg-white">
            <span className="font-mono font-bold text-[#A38F58]">Agent 4 &mdash; FIR Report Generator:</span>
            <p className="text-black/80 mt-0.5">
              Drafts an organized preliminary First Information Report structure combining complainant facts and legal findings. Prominently labeled: <em>"AI-generated draft for police review &mdash; not an officially registered FIR."</em>
            </p>
          </div>

          <div className="p-3 border border-black/10 bg-white">
            <span className="font-mono font-bold text-[#A38F58]">Agent 5 &mdash; Final Quality Checker:</span>
            <p className="text-black/80 mt-0.5">
              Conducts a strict zero-hallucination audit to ensure that no unstated facts were fabricated, timeline consistency is checked, and legal uncertainty is fully disclosed.
            </p>
          </div>

          <div className="p-3 border border-black/10 bg-white">
            <span className="font-mono font-bold text-[#A38F58]">Agent 6 &mdash; Final Response Formatter & Investigation Checklist:</span>
            <p className="text-black/80 mt-0.5">
              Organizes validated outputs into structured dashboard cards, procedural evidence checklists (complainant interview, scene inspection, CCTV canvassing), and enables instant copying, downloading, and printing.
            </p>
          </div>

          <div className="p-3 border border-black/10 bg-white">
            <span className="font-mono font-bold text-[#A38F58]">Agent 7 &mdash; Action & Follow-up Recommender:</span>
            <p className="text-black/80 mt-0.5">
              Generates neutral, prioritized operational steps for the investigating officer to advance inquiry and preserve time-sensitive evidence.
            </p>
          </div>
        </div>
      </div>

      {/* Crime Pattern & Similarity Analysis (Section 6) */}
      <div className="border border-black/15 bg-white p-6 space-y-3">
        <div className="flex items-center space-x-2 border-b border-black/10 pb-3">
          <Search className="w-4 h-4 text-[#A38F58]" />
          <h2 className="text-sm font-bold text-black uppercase tracking-wider">
            Crime Pattern & Similarity Intelligence (Section 6)
          </h2>
        </div>
        <p className="text-xs text-black/80 leading-relaxed">
          The application isolates Modus Operandi (MO) characteristics, suspect traits, vehicle types, and target vulnerabilities into structured searchable attributes. Officers can also evaluate multi-complaint cross-case similarities in the current session without exposing sensitive police data to external cloud databases.
        </p>
      </div>

      {/* Standalone Implementation Details */}
      <div className="border border-black/15 bg-white p-6 space-y-3">
        <div className="flex items-center space-x-2 border-b border-black/10 pb-3">
          <Cpu className="w-4 h-4 text-[#A38F58]" />
          <h2 className="text-sm font-bold text-black uppercase tracking-wider">
            Execution & Privacy Architecture
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 border border-black/20 bg-white space-y-1.5">
            <div className="font-bold text-black uppercase font-mono">Google AI Studio & Gemini API</div>
            <p className="text-black/70 text-[11px] leading-relaxed">
              Analysis is performed via server-side Google GenAI SDK integration using <code>gemini-3.8-flash</code>. Credentials remain securely on the server and are never exposed to browser bundles.
            </p>
          </div>

          <div className="p-4 border-2 border-black bg-[#F8F6F0] space-y-1.5">
            <div className="font-bold text-black uppercase font-mono">Zero External DB Dependency</div>
            <p className="text-black/70 text-[11px] leading-relaxed">
              No Firebase, Firestore, n8n, or third-party databases are utilized. Session records are preserved in local application memory and verified with HMAC-SHA256 authenticated sessions.
            </p>
          </div>
        </div>
      </div>

      {/* Evaluation Disclaimers */}
      <div className="p-4 border border-black/20 bg-black/5 text-xs text-black/80 space-y-1.5">
        <div className="flex items-center space-x-1.5 font-bold uppercase tracking-wider text-black">
          <AlertCircle className="w-4 h-4 text-[#A38F58]" />
          <span>Evaluation Notice</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          This system is an academic engineering prototype. It does not possess governmental affiliation, official police certification, or legal authority. All demonstration accounts and records use synthetic complaint narratives.
        </p>
      </div>
    </div>
  );
};
