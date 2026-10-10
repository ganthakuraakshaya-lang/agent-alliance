import React, { useState } from 'react';
import { Search, RefreshCw, FileText, ArrowRight } from 'lucide-react';
import { FIRReport } from '../types/fir';

interface ReportsPageProps {
  reports: FIRReport[];
  loading: boolean;
  onRefresh: () => void;
  onOpenReport: (reportId: string) => void;
  onGoToAnalyze: () => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  reports,
  loading,
  onRefresh,
  onOpenReport,
  onGoToAnalyze,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = reports.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      (r.complaintTitle && r.complaintTitle.toLowerCase().includes(q)) ||
      r.complaintText.toLowerCase().includes(q) ||
      r.reviewer.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black uppercase">
            Saved Complaint Records
          </h1>
          <p className="mt-1 text-xs text-black/70">
            Archived complaints and AI-assisted decision drafts processed during active authorized sessions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3 py-1.5 border border-black/30 hover:border-black text-xs font-semibold text-black flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            title="Reload from backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={onGoToAnalyze}
            className="px-4 py-1.5 bg-[#A38F58] text-black hover:bg-black hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            + New Analysis
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-black/40 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Report ID, title, complaint text, or reviewer..."
          className="w-full pl-9 pr-3 py-2 border border-black/20 text-xs text-black placeholder-black/40 focus:outline-none focus:border-[#A38F58] focus:ring-1 focus:ring-[#A38F58]"
        />
      </div>

      {/* Reports Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-black/60 font-mono border border-black/10">
          Retrieving records from application session memory...
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="p-12 text-center border border-black/15 bg-white space-y-3">
          <div className="w-12 h-12 mx-auto border border-black/20 rounded-full flex items-center justify-center text-black/40">
            <FileText className="w-6 h-6" />
          </div>
          <div className="text-sm font-bold text-black uppercase">
            {reports.length === 0 ? 'No Saved Reports' : 'No Matching Reports Found'}
          </div>
          <p className="text-xs text-black/60 max-w-md mx-auto">
            {reports.length === 0
              ? 'No complaint reports have been submitted or saved in this session. Enter a complaint narrative on the dashboard to generate the first structured report.'
              : 'No records matched your search query. Try searching for a different keyword.'}
          </p>
          {reports.length === 0 && (
            <div className="pt-2">
              <button
                onClick={onGoToAnalyze}
                className="px-5 py-2 bg-[#A38F58] text-black hover:bg-black hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Analyze FIR Now
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-black/20 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/20 bg-[#F8F6F0] text-[11px] font-bold uppercase tracking-wider text-black">
                  <th className="py-3 px-4">Report ID</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Complaint Title / Snippet</th>
                  <th className="py-3 px-4">AI Engine</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-black/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-black whitespace-nowrap">
                      {report.id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-black/70 whitespace-nowrap">
                      {new Date(report.submittedAt).toLocaleDateString()}{' '}
                      <span className="text-black/50">
                        {new Date(report.submittedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-black max-w-xs sm:max-w-md">
                      <div className="font-semibold text-black text-xs line-clamp-1">
                        {report.complaintTitle || 'General Criminal Complaint'}
                      </div>
                      <div className="line-clamp-1 italic text-black/70 text-[11px] mt-0.5">
                        "{report.complaintText}"
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 border border-black text-[10px] font-mono font-bold uppercase bg-black text-[#A38F58]">
                        {report.analysisResult?.engine === 'GEMINI_3_8_FLASH_AGENTIC' ? 'GEMINI 3.8 FLASH' : 'AGENTIC RULES'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onOpenReport(report.id)}
                        className="px-3 py-1.5 border border-black text-xs font-semibold text-black hover:bg-black hover:text-white transition-colors inline-flex items-center space-x-1"
                      >
                        <span>Open Report</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-black/10 bg-[#F8F6F0] flex items-center justify-between text-[11px] text-black/60">
            <span>Showing {filteredReports.length} of {reports.length} verified submissions</span>
            <span className="font-mono">Storage: Session / Application Memory</span>
          </div>
        </div>
      )}
    </div>
  );
};
