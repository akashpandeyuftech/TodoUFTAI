"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { getExportData } from "@/app/lib/actions/todos";
import { getHistory } from "@/app/lib/actions/history";
import { TodoPDFDocument } from "@/app/components/pdf/todo-pdf-document";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false }
);

interface Member { id: string; displayName: string; }

interface ExportClientProps {
  userId: string;
  teamId: string;
  teamName: string;
  userName: string;
  members: Member[];
}

export function ExportClient({ userId, teamId, teamName, userName, members }: ExportClientProps) {
  const [includeMyTodos, setIncludeMyTodos] = useState(true);
  const [myTodosFilter, setMyTodosFilter] = useState("both");
  const [includeTeamTodos, setIncludeTeamTodos] = useState(false);
  const [includeMemberTodos, setIncludeMemberTodos] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [includeHistory, setIncludeHistory] = useState(false);
  const [pdfData, setPdfData] = useState<React.ComponentProps<typeof TodoPDFDocument> | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleMember(id: string) {
    setSelectedMembers((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);
  }

  function handleGenerate(preview: boolean) {
    startTransition(async () => {
      const exportData = await getExportData({ userId, teamId, includeMyTodos, myTodosFilter, includeTeamTodos, includeMemberTodos, memberIds: selectedMembers });
      let historyEntries;
      if (includeHistory) {
        const h = await getHistory({ userId, teamId, mode: "mine", page: 1, limit: 100 });
        historyEntries = h.entries;
      }
      const data: React.ComponentProps<typeof TodoPDFDocument> = {
        teamName, userName, date: new Date().toLocaleDateString(),
        myTodos: exportData.myTodos as React.ComponentProps<typeof TodoPDFDocument>["myTodos"],
        teamTodos: exportData.teamTodos as React.ComponentProps<typeof TodoPDFDocument>["teamTodos"],
        memberTodos: exportData.memberTodos?.map((m) => ({ memberName: m.memberName, todos: m.todos as unknown as React.ComponentProps<typeof TodoPDFDocument>["myTodos"] & object[] })),
        historyEntries: historyEntries as React.ComponentProps<typeof TodoPDFDocument>["historyEntries"],
      };
      setPdfData(data);
      setShowPreview(preview);
    });
  }

  const checkboxClass = "w-4 h-4 accent-primary rounded cursor-pointer";

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Select what to include</h2>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={includeMyTodos} onChange={(e) => setIncludeMyTodos(e.target.checked)} className={checkboxClass} />
          <span className="text-sm text-foreground">My Tasks</span>
        </label>
        {includeMyTodos && (
          <select value={myTodosFilter} onChange={(e) => setMyTodosFilter(e.target.value)} className="ml-7 text-xs bg-surface border border-border rounded-lg px-3 py-1.5 text-muted">
            <option value="both">All</option>
            <option value="active">Active only</option>
            <option value="completed">Completed only</option>
          </select>
        )}

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={includeTeamTodos} onChange={(e) => setIncludeTeamTodos(e.target.checked)} className={checkboxClass} />
          <span className="text-sm text-foreground">Team Tasks</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={includeMemberTodos} onChange={(e) => setIncludeMemberTodos(e.target.checked)} className={checkboxClass} />
          <span className="text-sm text-foreground">Member Tasks</span>
        </label>
        {includeMemberTodos && (
          <div className="ml-7 space-y-1">
            {members.map((m) => (
              <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={selectedMembers.includes(m.id)} onChange={() => toggleMember(m.id)} className="w-3.5 h-3.5 accent-primary" />
                <span className="text-xs text-muted">{m.displayName}</span>
              </label>
            ))}
          </div>
        )}

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={includeHistory} onChange={(e) => setIncludeHistory(e.target.checked)} className={checkboxClass} />
          <span className="text-sm text-foreground">History Log</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button onClick={() => handleGenerate(true)} disabled={isPending} className="px-4 py-2 bg-surface border border-border text-sm font-medium rounded-lg text-muted hover:text-foreground disabled:opacity-50 cursor-pointer transition-colors">
          {isPending && showPreview ? "Loading..." : "Preview"}
        </button>
        <button onClick={() => handleGenerate(false)} disabled={isPending} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50 cursor-pointer transition-colors">
          {isPending && !showPreview ? "Generating..." : "Generate PDF"}
        </button>
      </div>

      {pdfData && !showPreview && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <PDFDownloadLink document={<TodoPDFDocument {...pdfData} />} fileName={`uftech-tasks-${new Date().toISOString().split("T")[0]}.pdf`}>
            {({ loading }) => (
              <span className="text-sm font-medium text-emerald-400 cursor-pointer">{loading ? "Preparing download..." : "Click here to download PDF"}</span>
            )}
          </PDFDownloadLink>
        </div>
      )}

      {pdfData && showPreview && (
        <div className="border border-border rounded-xl overflow-hidden" style={{ height: 600 }}>
          <PDFViewer width="100%" height="100%"><TodoPDFDocument {...pdfData} /></PDFViewer>
        </div>
      )}
    </div>
  );
}
