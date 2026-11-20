"use client";

// ============================================================
// Admin → Team tab: manage the team roster (public.team_members)
// ============================================================
// List, search, add, edit, delete, plus a spreadsheet import. The data and the
// reload callback come from app/admin/page.tsx, which also needs the count for
// the Overview tab. Photos: members without a picture show the shared
// placeholder (TEAM_PLACEHOLDER_PICTURE). Uploading reuses the existing
// /api/admin/team-members/upload route (Supabase 'team-avatars' bucket).
// ============================================================

import { useMemo, useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { Briefcase, Camera, Edit3, GraduationCap, Layers, Loader2, Mail, Plus, Search, Table2, Trash2, Upload, UserPlus, Users, X } from "lucide-react";
import { DeleteAllButton } from "@/components/admin/DeleteAllButton";
import { TeamGridSkeleton } from "@/components/admin/Skeletons";
import { TEAM_PLACEHOLDER_PICTURE, type TeamMemberRow } from "@/lib/team/types";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "create" | "danger" | "info";
  onConfirm: () => void | Promise<void>;
};

interface TeamTabProps {
  members: TeamMemberRow[];
  loading: boolean;
  onChanged: () => Promise<void> | void;
  showConfirm: (opts: ConfirmOptions) => void;
}

interface FormState {
  name: string;
  email: string;
  course: string;
  branch: string;
  role: string;
  wing: string;
  pictureUrl: string;
}

const EMPTY_FORM: FormState = { name: "", email: "", course: "", branch: "", role: "", wing: "", pictureUrl: "" };

const INPUT =
  "ad-input h-11";
const LABEL = "ad-label";

type ImportRow = Record<"name" | "email" | "course" | "branch" | "role" | "wing" | "pictureUrl", string> & { _rowIndex: number };

export function TeamTab({ members, loading, onChanged, showConfirm }: TeamTabProps) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TeamMemberRow | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingPic, setUploadingPic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showImport, setShowImport] = useState(false);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importMode, setImportMode] = useState<"append" | "overwrite">("append");
  const [importing, setImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      [m.name, m.email, m.course, m.branch, m.role, m.wing].some((v) => (v ?? "").toLowerCase().includes(q))
    );
  }, [members, search]);

  // Lock body scroll while a modal is open
  const modalOpen = showForm || showImport;
  useEffect(() => {
    if (!modalOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [modalOpen]);

  // ── Add / edit ────────────────────────────────────────────
  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setUploadingPic(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startCreate = () => {
    closeForm();
    setShowForm(true);
  };

  const startEdit = (m: TeamMemberRow) => {
    setEditing(m);
    setForm({
      name: m.name,
      email: m.email,
      course: m.course,
      branch: m.branch ?? "",
      role: m.role ?? "",
      wing: m.wing ?? "",
      pictureUrl: m.picture_url ?? "",
    });
    setFormError("");
    setShowForm(true);
  };

  // TODO: photos are a plain URL (or an upload to the team-avatars bucket) for now.
  // Everyone shares the placeholder until real photos exist.
  const uploadPicture = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setFormError("Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image size must be less than 5MB.");
      return;
    }
    setUploadingPic(true);
    setFormError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/team-members/upload", { method: "POST", body });
      const json = await res.json();
      if (!json.success) {
        setFormError(json.error || "Failed to upload image.");
        toast.error(json.error || "Failed to upload image");
        return;
      }
      setForm((prev) => ({ ...prev, pictureUrl: json.url }));
      toast.success("Profile image uploaded successfully");
    } catch (err: any) {
      setFormError(err.message || "Failed to upload image.");
      toast.error("Failed to upload image");
    } finally {
      setUploadingPic(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.name.trim()) return setFormError("Name is required.");
    if (!form.email.trim()) return setFormError("Email is required.");
    if (!form.course.trim()) return setFormError("Course is required.");
    // Role, branch, wing and picture are optional.

    setSubmitting(true);
    try {
      const res = await fetch(editing ? `/api/admin/team-members/${editing.id}` : "/api/admin/team-members", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        const detail = json.data && typeof json.data === "object" ? Object.values(json.data).join(" ") : "";
        setFormError(detail || json.error || "Operation failed.");
        toast.error(detail || json.error || "Operation failed.");
        return;
      }
      toast.success(editing ? "Team member updated" : "Team member added");
      closeForm();
      await onChanged();
    } catch (err: any) {
      setFormError("Request failed: " + (err.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = (m: TeamMemberRow) => {
    showConfirm({
      title: "Remove Team Member",
      message: `Are you sure you want to remove "${m.name}"?\n\nThis will permanently delete their profile from the team.`,
      confirmLabel: "Remove Member",
      variant: "danger",
      onConfirm: async () => {
        setDeletingId(m.id);
        toast.loading(`Removing "${m.name}"…`, { id: "delete-team-member" });
        try {
          const res = await fetch(`/api/admin/team-members/${m.id}`, { method: "DELETE" });
          const json = await res.json();
          if (json.success) {
            toast.success(`"${m.name}" has been removed from the team.`, { id: "delete-team-member" });
            if (editing?.id === m.id) closeForm();
            await onChanged();
          } else {
            toast.error(json.error || "Failed to remove team member", { id: "delete-team-member" });
          }
        } catch (err: any) {
          toast.error(err.message || "Failed to remove team member", { id: "delete-team-member" });
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  // ── Spreadsheet import ────────────────────────────────────
  const closeImport = () => {
    if (importing) return;
    setShowImport(false);
    setImportRows([]);
    setImportErrors([]);
    setImportFileName("");
    setImportMode("append");
    if (importInputRef.current) importInputRef.current.value = "";
  };

  const parseImportFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv", "ods"].includes(ext || "")) {
      setImportErrors(["Unsupported file type. Please upload .xlsx, .xls, .csv, or .ods"]);
      return;
    }
    setImportRows([]);
    setImportErrors([]);
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const XLSX = await import("xlsx");
        const workbook = XLSX.read(e.target?.result, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        if (json.length === 0) {
          setImportErrors(["The file appears to be empty or has no data rows."]);
          return;
        }
        const rows: ImportRow[] = json.map((row, i) => {
          const k: Record<string, any> = {};
          Object.keys(row).forEach((key) => {
            k[key.toLowerCase().trim().replace(/\s+/g, "_")] = row[key];
          });
          const pick = (...keys: string[]) => {
            for (const key of keys) if (k[key] !== undefined && String(k[key]).trim()) return String(k[key]).trim();
            return "";
          };
          return {
            _rowIndex: i + 2,
            name: pick("name", "full_name"),
            email: pick("email", "email_id", "e-mail"),
            course: pick("course", "program"),
            branch: pick("branch", "department", "dept"),
            role: pick("role", "position", "designation"),
            wing: pick("wing", "team", "domain"),
            pictureUrl: pick("picture_url", "picture", "pic_url", "photo", "image"),
          };
        });
        const errors: string[] = [];
        rows.forEach((r) => {
          if (!r.name) errors.push(`Row ${r._rowIndex}: Name is missing`);
          if (!r.email) errors.push(`Row ${r._rowIndex}: Email is missing`);
          if (!r.course) errors.push(`Row ${r._rowIndex}: Course is missing`);
        });
        setImportErrors(errors);
        setImportRows(rows);
      } catch (err: any) {
        setImportErrors(["Failed to parse file: " + (err.message || "Unknown error")]);
      }
    };
    reader.readAsBinaryString(file);
  };

  const submitImport = () => {
    if (importRows.length === 0 || importErrors.length > 0) return;
    const run = async () => {
      setImporting(true);
      toast.loading(`Importing ${importRows.length} members…`, { id: "bulk-import" });
      try {
        const res = await fetch("/api/admin/team-members/bulk-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ members: importRows.map(({ _rowIndex, ...rest }) => rest), mode: importMode }),
        });
        const json = await res.json();
        if (!json.success) {
          setImportErrors(Array.isArray(json.data) ? json.data : [json.error || "Import failed."]);
          toast.error(json.error || "Import failed.", { id: "bulk-import" });
          return;
        }
        toast.success(`Imported ${json.data?.length ?? importRows.length} team members.`, { id: "bulk-import" });
        setImporting(false);
        closeImport();
        await onChanged();
      } catch (err: any) {
        toast.error(err.message || "Import request failed.", { id: "bulk-import" });
      } finally {
        setImporting(false);
      }
    };
    if (importMode === "overwrite") {
      showConfirm({
        title: "Replace the whole team?",
        message: `This permanently deletes all ${members.length} existing member(s) and replaces them with ${importRows.length} member(s) from "${importFileName}".\n\nThis cannot be undone.`,
        confirmLabel: "Yes, Replace & Import",
        variant: "danger",
        onConfirm: run,
      });
      return;
    }
    void run();
  };

  const modalShell = "fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4 flex items-center justify-center overscroll-contain";

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-lt-display text-xl sm:text-2xl font-semibold text-sbg-ink tracking-[-0.035em]">Team</h2>
          <p className="text-sm text-sbg-ink-2 mt-1">Manage the AWS Student Builder Group roster shown on the public Team page</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="ad-chip ad-chip-info font-lt-mono">
            {members.length} Total Members
          </span>
          <button
            onClick={() => setShowImport(true)}
            className="ad-btn ad-btn-ghost"
            title="Import team members from an Excel or CSV file"
          >
            <Table2 className="w-3.5 h-3.5" />
            <span>Import Excel</span>
          </button>
          <button
            onClick={startCreate}
            className="ad-btn ad-btn-primary"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 text-sbg-ink-3 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, role, wing…"
          className="ad-input pl-9 pr-10"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg flex items-center justify-center text-sbg-ink-3 hover:text-sbg-ink hover:bg-sbg-lilac-50 cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <TeamGridSkeleton />
      ) : filtered.length === 0 ? (
        <div className="ad-card ad-card-tint-lilac border-dashed">
          <div className="p-12 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white border border-sbg-lilac-200 flex items-center justify-center text-sbg-lilac-700">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-lt-display text-base font-semibold text-sbg-ink mb-1">
              {search ? "No matching team members found" : "No team members added yet"}
            </h3>
            <p className="text-sm text-sbg-ink-2 max-w-sm mx-auto mb-5">
              {search ? "Try clearing your search query." : "Start building the roster by adding your first member."}
            </p>
            {!search && (
              <button
                onClick={startCreate}
                className="ad-btn ad-btn-primary"
              >
                Add Member
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
          {filtered.map((m) => (
            <div
              key={m.id}
              data-testid="team-member-card"
              className="ad-card group p-4 transition-[border-color,box-shadow] duration-200 hover:border-sbg-lilac-300"
            >
              <div className="flex items-center justify-between gap-2.5">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-sbg-lilac-200 bg-sbg-lilac-50 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.picture_url || TEAM_PLACEHOLDER_PICTURE}
                    alt={m.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      if (!img.src.endsWith(TEAM_PLACEHOLDER_PICTURE)) img.src = TEAM_PLACEHOLDER_PICTURE;
                    }}
                  />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(m)}
                    title="Edit Team Member"
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-sbg-ink-2 hover:text-sbg-lilac-700 hover:bg-sbg-lilac-50 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(m)}
                    disabled={deletingId === m.id}
                    title="Remove Team Member"
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-sbg-ink-2 hover:text-[var(--ad-danger)] hover:bg-[var(--ad-danger-bg)] transition-colors cursor-pointer disabled:opacity-40"
                  >
                    {deletingId === m.id ? (
                      <div className="w-3 h-3 rounded-full border-2 border-[var(--ad-danger-line)] border-t-[var(--ad-danger)] animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-3 min-w-0">
                <h4 className="font-lt-display text-[15px] font-semibold text-sbg-ink truncate tracking-[-0.02em]">
                  {m.name}
                </h4>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {m.role && (
                    <span className="ad-chip ad-chip-info max-w-full">
                      <Briefcase className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{m.role}</span>
                    </span>
                  )}
                  {m.wing && (
                    <span className="ad-chip bg-sbg-lilac-100 text-sbg-lilac-700 max-w-full">
                      <Layers className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{m.wing}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-sbg-ink-2 pt-3 mt-3 border-t border-sbg-ink/10">
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="w-3.5 h-3.5 text-sbg-ink-3 shrink-0" />
                  <span className="truncate text-[11.5px]">{m.email}</span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <GraduationCap className="w-3.5 h-3.5 text-sbg-ink-3 shrink-0" />
                  <span className="truncate text-[11.5px]">{m.branch ? `${m.course} — ${m.branch}` : m.course}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Danger zone */}
      <div className="ad-danger-zone p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="ad-eyebrow">Danger zone</p>
        <div>
          <DeleteAllButton
            section="team"
            noun="team members"
            count={members.length}
            disabled={loading}
            consequences="Their profiles disappear from the public Team page."
            onDeleted={onChanged}
          />
        </div>
      </div>

      {/* Add / edit modal */}
      {showForm && (
        <div className={modalShell} data-lenis-prevent onWheel={(e) => e.stopPropagation()}>
          <div className="fixed inset-0 ad-backdrop" onClick={closeForm} />
          <div
            className="ad-modal relative w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto"
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="overflow-hidden flex flex-col max-h-[85vh]">
              <div className="px-6 sm:px-7 py-5 border-b border-sbg-ink/10 flex items-center justify-between shrink-0 gap-3">
                <div className="min-w-0">
                  <h3 className="font-lt-display text-lg font-semibold text-sbg-ink tracking-[-0.035em]">{editing ? "Edit Team Member" : "Add Team Member"}</h3>
                  <p className="text-sm text-sbg-ink-2 mt-0.5">
                    {editing ? "Update member details, photo, and role" : "Add a member to the team roster"}
                  </p>
                </div>
                <button
                  onClick={closeForm}
                  className="h-10 w-10 rounded-xl text-sbg-ink-2 hover:text-sbg-ink hover:bg-sbg-lilac-50 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col min-h-0 flex-1 overflow-hidden">
                <div
                  className="p-6 sm:p-7 space-y-5 overflow-y-auto overscroll-contain flex-1 min-h-0"
                  data-lenis-prevent
                  onWheel={(e) => e.stopPropagation()}
                >
                  <div className="space-y-2">
                    <label className={LABEL}>
                      Full Name <span className="text-sbg-lilac-700">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Piyush Rawat"
                      className={INPUT}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={LABEL}>
                      Email <span className="text-sbg-lilac-700">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="name@example.com"
                      className={INPUT}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className={LABEL}>
                        Course <span className="text-sbg-lilac-700">*</span>
                      </label>
                      <input
                        type="text"
                        name="course"
                        value={form.course}
                        onChange={(e) => setForm({ ...form, course: e.target.value })}
                        placeholder="e.g. B.Tech, BCA, MCA"
                        className={INPUT}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className={LABEL}>Branch</label>
                        <span className="text-[11px] text-sbg-ink-3">Optional</span>
                      </div>
                      <input
                        type="text"
                        name="branch"
                        value={form.branch}
                        onChange={(e) => setForm({ ...form, branch: e.target.value })}
                        placeholder="Leave blank if none"
                        className={INPUT}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className={LABEL}>Role</label>
                        <span className="text-[11px] text-sbg-ink-3">Optional</span>
                      </div>
                      <input
                        type="text"
                        name="role"
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        placeholder="Leave blank if a plain wing member"
                        className={INPUT}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className={LABEL}>Wing</label>
                        <span className="text-[11px] text-sbg-ink-3">Optional</span>
                      </div>
                      <input
                        type="text"
                        name="wing"
                        value={form.wing}
                        onChange={(e) => setForm({ ...form, wing: e.target.value })}
                        placeholder="Leave blank for leadership"
                        className={INPUT}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className={LABEL}>Picture URL</label>
                      <span className="text-[11px] text-sbg-ink-3">Blank = shared placeholder</span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) void uploadPicture(e.target.files[0]);
                      }}
                    />
                    <div className="flex gap-2.5">
                      <input
                        type="text"
                        name="pictureUrl"
                        value={form.pictureUrl}
                        onChange={(e) => setForm({ ...form, pictureUrl: e.target.value })}
                        placeholder="https://… or /members/name.png"
                        className={`${INPUT} flex-1 font-mono text-xs`}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPic}
                        className="ad-btn ad-btn-ghost h-11 shrink-0"
                      >
                        {uploadingPic ? <Loader2 className="w-3.5 h-3.5 animate-spin text-sbg-lilac-600" /> : <Camera className="w-3.5 h-3.5 text-sbg-lilac-600" />}
                        <span>Upload</span>
                      </button>
                      <div className="w-11 h-11 rounded-xl overflow-hidden border border-sbg-lilac-200 bg-sbg-lilac-50 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={form.pictureUrl.trim() || TEAM_PLACEHOLDER_PICTURE} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>

                  {formError && (
                    <div className="p-3.5 rounded-xl bg-[var(--ad-danger-bg)] border border-[var(--ad-danger-line)] text-xs text-[var(--ad-danger)]">{formError}</div>
                  )}
                </div>

                <div className="px-6 py-4 border-t border-sbg-ink/10 bg-sbg-mist flex items-center justify-between gap-2.5 shrink-0">
                  {editing ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(editing)}
                      className="ad-btn ad-btn-danger"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Member</span>
                    </button>
                  ) : (
                    <div />
                  )}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={closeForm}
                      className="ad-btn ad-btn-ghost"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="ad-btn ad-btn-primary"
                    >
                      {submitting ? "Saving…" : editing ? "Save Changes" : "Add Member"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Import modal */}
      {showImport && (
        <div className={modalShell} data-lenis-prevent onWheel={(e) => e.stopPropagation()}>
          <div className="fixed inset-0 ad-backdrop" onClick={closeImport} />
          <div
            className="ad-modal relative w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto"
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 sm:px-8 py-5 border-b border-sbg-ink/10 flex items-center justify-between shrink-0 gap-3">
                <div>
                  <h3 className="font-lt-display text-lg font-semibold text-sbg-ink tracking-[-0.035em]">Import Team Members</h3>
                  <p className="text-sm text-sbg-ink-2 mt-0.5">Upload an Excel (.xlsx/.xls), CSV, or ODS file, up to 200 members</p>
                </div>
                <button
                  onClick={closeImport}
                  className="h-10 w-10 rounded-xl text-sbg-ink-2 hover:text-sbg-ink hover:bg-sbg-lilac-50 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div
                className="p-6 sm:p-8 space-y-5 overflow-y-auto overscroll-contain flex-1 min-h-0"
                data-lenis-prevent
                onWheel={(e) => e.stopPropagation()}
              >
                <div className="p-4 rounded-2xl bg-sbg-mist border border-sbg-ink/10 space-y-3">
                  <p className="ad-eyebrow">Columns in your spreadsheet</p>
                  <div className="flex flex-wrap gap-2">
                    {["name", "email", "course"].map((c) => (
                      <span key={c} className="ad-chip ad-chip-ok font-lt-mono">
                        {c}
                      </span>
                    ))}
                    {["branch", "wing", "picture_url"].map((c) => (
                      <span key={c} className="ad-chip font-lt-mono">
                        {c} <span className="text-sbg-ink-3">(optional)</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(["append", "overwrite"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setImportMode(mode)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        importMode === mode
                          ? mode === "append"
                            ? "bg-[var(--ad-ok-bg)] border-[var(--ad-ok)] ring-1 ring-[var(--ad-ok)]/30"
                            : "bg-[var(--ad-danger-bg)] border-[var(--ad-danger)] ring-1 ring-[var(--ad-danger)]/30"
                          : "bg-white border-sbg-ink/15 hover:border-sbg-lilac-300"
                      }`}
                    >
                      <p className="text-sm font-semibold text-sbg-ink">{mode === "append" ? "Add to existing team" : "Replace the whole team"}</p>
                      <p className="text-xs text-sbg-ink-2 mt-1">
                        {mode === "append"
                          ? "Keeps current members. Emails already on the team are rejected."
                          : `Deletes all ${members.length} current member(s) first, then imports the file.`}
                      </p>
                    </button>
                  ))}
                </div>

                <input
                  ref={importInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.ods"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) parseImportFile(e.target.files[0]);
                  }}
                />
                <button
                  type="button"
                  onClick={() => importInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-sbg-lilac-300 bg-sbg-lilac-50/60 rounded-2xl p-6 text-center cursor-pointer hover:border-sbg-lilac-600 hover:bg-sbg-lilac-50 transition-colors flex flex-col items-center gap-2"
                >
                  <Upload className="w-5 h-5 text-sbg-lilac-700" />
                  <span className="text-sm font-medium text-sbg-ink">
                    {importFileName ? `${importFileName} — ${importRows.length} rows, click to replace` : "Click to choose a file"}
                  </span>
                </button>

                {importErrors.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-[var(--ad-danger-bg)] border border-[var(--ad-danger-line)] text-xs text-[var(--ad-danger)] space-y-1 max-h-40 overflow-y-auto">
                    <p className="font-semibold">
                      {importErrors.length} issue{importErrors.length === 1 ? "" : "s"} found. Fix them before importing.
                    </p>
                    {importErrors.map((err, i) => (
                      <p key={i}>{err}</p>
                    ))}
                  </div>
                )}

                {importRows.length > 0 && importErrors.length === 0 && (
                  <div className="rounded-2xl border border-sbg-ink/10 overflow-x-auto">
                    <table className="ad-table text-[12px]">
                      <thead className="">
                        <tr>
                          {["#", "Name", "Email", "Course", "Branch", "Role", "Wing"].map((h) => (
                            <th key={h} className="px-3 py-2">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="text-sbg-ink-2">
                        {importRows.slice(0, 50).map((r) => (
                          <tr key={r._rowIndex} className="">
                            <td className="px-3 py-2">{r._rowIndex}</td>
                            <td className="px-3 py-2 font-medium text-sbg-ink">{r.name}</td>
                            <td className="px-3 py-2">{r.email}</td>
                            <td className="px-3 py-2">{r.course}</td>
                            <td className="px-3 py-2">{r.branch || "—"}</td>
                            <td className="px-3 py-2">{r.role || "—"}</td>
                            <td className="px-3 py-2">{r.wing || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importRows.length > 50 && (
                      <p className="px-3 py-2 text-xs text-sbg-ink-3">Showing first 50 of {importRows.length} rows</p>
                    )}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-sbg-ink/10 bg-sbg-mist flex items-center justify-end gap-2.5 shrink-0">
                <button
                  onClick={closeImport}
                  disabled={importing}
                  className="ad-btn ad-btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={submitImport}
                  disabled={importing || importRows.length === 0 || importErrors.length > 0}
                  className={`ad-btn ${importMode === "overwrite" ? "bg-red-700 text-white hover:bg-red-800" : "ad-btn-primary"}`}
                >
                  {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>
                    {importMode === "overwrite" ? "Replace & Import" : "Import"}
                    {importRows.length > 0 ? ` (${importRows.length})` : ""}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
