"use client";

import { useCallback, useEffect, useId, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, Check, FileImage, Film, Image as ImageIcon, Loader2, Minimize2, RotateCcw, UploadCloud, X } from "lucide-react";
import { SUPABASE_VIDEO_MAX_BYTES, type MediaPurpose, type MediaTarget } from "@/lib/media/policy";
import {
  buildQueueItem,
  chunkForInit,
  formatBytes,
  pickToStart,
  queueReducer,
  summarize,
  isBusy,
  type QueueItem,
} from "@/lib/media/upload-queue";
import { completeOne, initUploads, postToS3, putToSupabase } from "@/lib/media/client-upload";
import { isHeicFile } from "@/lib/media/heic";
import { canCompressImage } from "@/lib/media/client-compress";
import { convertHeicToJpeg } from "./convert-heic";
import { compressToWebp } from "./compress-image";

// HEIC (iPhone photos) is accepted by the picker and converted to JPEG in the browser first.
const HEIC_ACCEPT = "image/heic,image/heif,.heic,.heif";
const IMAGE_ACCEPT = `image/jpeg,image/png,image/webp,${HEIC_ACCEPT}`;
const ACCEPT = `${IMAGE_ACCEPT},video/mp4,video/webm`;

const STATUS_LABEL: Record<string, string> = {
  queued: "Waiting…",
  signing: "Preparing…",
  waiting: "Waiting for a free slot…",
  uploading: "Uploading…",
  // Server-side verification is part of the same "send" step from the user's
  // point of view; it must never read as a separate, unexplained delay.
  verifying: "Uploading…",
  processing: "Uploaded · being prepared for the site",
  live: "Uploaded · live",
};

/** A segmented control whose selected pill slides between options instead of snapping. */
function Segmented<T extends string>({
  value,
  options,
  onChange,
  disabled,
  label,
}: {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (v: T) => void;
  disabled?: boolean;
  label: string;
}) {
  const groupId = useId();
  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup id={groupId}>
        <div role="group" aria-label={label} className="relative isolate inline-flex gap-1 rounded-xl border border-sbg-ink/10 bg-white/60 p-1 text-xs">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              aria-pressed={value === o.value}
              disabled={disabled}
              onClick={() => onChange(o.value)}
              className={`relative isolate min-h-9 rounded-[9px] px-3.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                value === o.value ? "text-white" : "text-sbg-ink-2 transition-colors hover:text-sbg-ink"
              }`}
            >
              {value === o.value && (
                <motion.span
                  layoutId={`${groupId}-pill`}
                  className="absolute inset-0 rounded-[9px]"
                  style={{ zIndex: -1, background: "linear-gradient(180deg, #8b4ff2 0%, #7c3aed 100%)", boxShadow: "0 6px 14px -6px rgba(124,58,237,0.55)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 36 }}
                />
              )}
              <span className="relative z-[1]">{o.label}</span>
            </button>
          ))}
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}

export function Uploader({ eventId }: { eventId: string }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [items, dispatch] = useReducer(queueReducer, [] as QueueItem[]);
  const [purpose, setPurpose] = useState<MediaPurpose>("gallery");
  /** Where files are stored. Defaults to Supabase while S3 is not set up; switch to AWS S3 once it is. */
  const [target, setTarget] = useState<MediaTarget>("supabase");
  const [dragging, setDragging] = useState(false);
  /** Photos still being compressed to WebP in the browser (shown as a message). */
  const [compressing, setCompressing] = useState(0);
  /** Sub-step of the photo being prepared right now (drives the flow diagram); null when idle. */
  const [prep, setPrep] = useState<{ stage: "convert" | "compress" | "upload"; heic: boolean } | null>(null);
  const reduceRef = useRef(reduce);
  reduceRef.current = reduce;

  // Non-state bookkeeping: the File objects, signed forms, previews, and
  // "already started" guards (so React StrictMode's double effects cannot
  // start the same upload twice).
  const filesRef = useRef(new Map<string, File>());
  const signedRef = useRef(new Map<string, { url: string; fields: Record<string, string> }>());
  const previewsRef = useRef(new Map<string, string>());
  /** Items that started as HEIC (display only: the row diagram shows Convert as done). */
  const heicRef = useRef(new Set<string>());
  const signingStarted = useRef(new Set<string>());
  const uploadStarted = useRef(new Set<string>());
  const completing = useRef(new Set<string>());
  const purposeRef = useRef(purpose);
  purposeRef.current = purpose;
  const targetRef = useRef(target);
  targetRef.current = target;
  /** Which storage each queued file was signed for (the toggle may change later). */
  const itemTargetRef = useRef(new Map<string, MediaTarget>());

  const summary = summarize(items);
  const hasUnfinished = items.some((i) => i.state !== "live" && i.state !== "processing" && i.state !== "error");

  // ── 1. Sign queued files (one init request per group of up to 20) ──────
  useEffect(() => {
    const queued = items.filter((i) => i.state === "queued" && !signingStarted.current.has(i.id));
    if (queued.length === 0) return;
    const ids = queued.map((i) => i.id);
    ids.forEach((id) => signingStarted.current.add(id));
    dispatch({ type: "signing", ids });

    for (const group of chunkForInit(ids)) {
      const groupItems = group.map((id) => queued.find((q) => q.id === id)!);
      void initUploads(eventId, purposeRef.current, groupItems.map((i) => ({ type: i.mimeType, size: i.size })), targetRef.current).then((res) => {
        if (!res.ok) {
          for (const id of group) dispatch({ type: "fail", id, message: res.error, retryable: res.retryable });
          return;
        }
        const byIndex = new Map(res.uploads.map((u) => [u.index, u]));
        group.forEach((id, index) => {
          const u = byIndex.get(index);
          if (!u) {
            dispatch({ type: "fail", id, message: "Could not start the upload.", retryable: true });
            return;
          }
          signedRef.current.set(id, { url: u.url, fields: u.fields });
          itemTargetRef.current.set(id, targetRef.current);
          dispatch({ type: "signed", id, mediaId: u.mediaId });
        });
      });
    }
  }, [items, eventId]);

  // ── 2. Start uploads, at most 3 at a time ──────────────────────────────
  useEffect(() => {
    for (const id of pickToStart(items)) {
      if (uploadStarted.current.has(id)) continue;
      const file = filesRef.current.get(id);
      const signed = signedRef.current.get(id);
      if (!file || !signed) continue;
      uploadStarted.current.add(id);
      dispatch({ type: "start", id });
      const send = itemTargetRef.current.get(id) === "supabase" ? putToSupabase : postToS3;
      void send(signed, file, (p) => dispatch({ type: "progress", id, progress: p })).then((res) => {
        signedRef.current.delete(id); // a signature is single-use
        if (res.ok) dispatch({ type: "uploaded", id });
        else dispatch({ type: "fail", id, message: res.error, retryable: true });
      });
    }
  }, [items]);

  // ── 3. Ask the server to verify finished uploads ───────────────────────
  useEffect(() => {
    for (const item of items) {
      if (item.state !== "verifying" || !item.mediaId || completing.current.has(item.id)) continue;
      completing.current.add(item.id);
      void completeOne(item.mediaId).then((outcome) => {
        completing.current.delete(item.id);
        dispatch({ type: "completed", id: item.id, outcome });
      });
    }
  }, [items]);

  // ── 4. Refresh the list below when a batch finishes ────────────────────
  const wasBusy = useRef(false);
  useEffect(() => {
    const busy = summary.inFlight > 0;
    if (wasBusy.current && !busy && summary.done > 0) router.refresh();
    wasBusy.current = busy;
  }, [summary.inFlight, summary.done, router]);

  // ── Warn before leaving while uploads are running ──────────────────────
  useEffect(() => {
    if (summary.inFlight === 0) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [summary.inFlight]);

  // Free the preview URLs when leaving the page.
  useEffect(() => {
    const previews = previewsRef.current;
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const addFiles = useCallback(async (list: FileList | File[]) => {
    let files = Array.from(list);
    if (purposeRef.current === "cover") files = files.slice(0, 1); // one cover per event
    if (files.length === 0) return;

    // Photos are shrunk and converted to WebP here, before upload, one at a time
    // (each decode needs real memory). iPhone HEIC photos become JPEG first.
    // A file that fails to convert stays as it is and goes through the normal pre-check.
    const needsWork = (f: File) => isHeicFile(f) || canCompressImage(f);
    const workCount = files.filter(needsWork).length;
    const prepared: Array<{ file: File; originalSize: number; heic: boolean }> = [];
    let lastHeic = false;
    if (workCount > 0) setCompressing((n) => n + workCount);
    for (const original of files) {
      if (!needsWork(original)) {
        prepared.push({ file: original, originalSize: original.size, heic: false });
        continue;
      }
      let file = original;
      const heic = isHeicFile(file);
      lastHeic = heic;
      try {
        if (heic) {
          setPrep({ stage: "convert", heic });
          file = await convertHeicToJpeg(file);
        }
        // Flip to "compress" (this is what marks Convert as done) and hold one tick-animation
        // frame before the real compression work starts — otherwise, for a fast HEIC convert,
        // the state goes convert-active -> compress-active with no frame where Convert reads as
        // done, so its checkmark is never actually painted.
        setPrep({ stage: "compress", heic });
        if (heic) {
          await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
          if (!reduceRef.current) await new Promise<void>((r) => setTimeout(r, 350));
        }
        file = await compressToWebp(file);
      } catch {
        // keep whatever we have; the pre-check decides
      } finally {
        setCompressing((n) => n - 1);
      }
      prepared.push({ file, originalSize: original.size, heic });
    }
    if (workCount > 0) {
      // Same diagram instance moves on to "Upload" so the Compress tick is seen, then the block closes.
      // Hold ~400ms (tick animation only, not the real work); reduced motion skips the hold.
      setPrep({ stage: "upload", heic: lastHeic });
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      if (!reduceRef.current) await new Promise<void>((r) => setTimeout(r, 400));
    }

    const built = prepared.map(({ file, originalSize, heic }) => {
      const id = crypto.randomUUID();
      const item = buildQueueItem(
        id,
        { name: file.name, type: file.type, size: file.size, originalSize },
        purposeRef.current,
        targetRef.current
      );
      if (item.state !== "error") {
        if (heic) heicRef.current.add(id);
        filesRef.current.set(id, file);
        if (item.kind === "image") previewsRef.current.set(id, URL.createObjectURL(file));
      }
      return item;
    });
    dispatch({ type: "add", items: built });
    setPrep(null);
  }, []);

  const forget = (id: string) => {
    filesRef.current.delete(id);
    signedRef.current.delete(id);
    itemTargetRef.current.delete(id);
    const url = previewsRef.current.get(id);
    if (url) URL.revokeObjectURL(url);
    previewsRef.current.delete(id);
    heicRef.current.delete(id);
    signingStarted.current.delete(id);
    uploadStarted.current.delete(id);
    completing.current.delete(id);
  };

  const retry = (item: QueueItem) => {
    // Starting over needs fresh guards; re-verifying keeps them.
    if (!(item.uploaded && item.mediaId)) {
      signingStarted.current.delete(item.id);
      uploadStarted.current.delete(item.id);
    }
    completing.current.delete(item.id);
    dispatch({ type: "retry", id: item.id });
  };

  const remove = (item: QueueItem) => {
    if (isBusy(item.state)) return;
    forget(item.id);
    dispatch({ type: "remove", id: item.id });
  };

  const clearFinished = () => {
    items.filter((i) => i.state === "live" || i.state === "processing").forEach((i) => forget(i.id));
    dispatch({ type: "clearFinished" });
  };

  return (
    <section aria-labelledby="upload-heading" className="space-y-4 surface rounded-[28px] p-5">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <h2 id="upload-heading" className="mr-auto text-lg font-semibold">Upload</h2>
        <div>
          <p className="t-eyebrow mb-1.5" aria-hidden="true">Store in</p>
          <Segmented
            value={target}
            onChange={setTarget}
            disabled={hasUnfinished}
            label="Where to store the files"
            options={[
              { value: "s3", label: "AWS S3" },
              { value: "supabase", label: "Supabase" },
            ]}
          />
        </div>
        <div>
          <p className="t-eyebrow mb-1.5" aria-hidden="true">Uploading</p>
          <Segmented
            value={purpose}
            onChange={setPurpose}
            disabled={hasUnfinished}
            label="What are you uploading?"
            options={[
              { value: "gallery", label: "Photos & videos" },
              { value: "cover", label: "Event cover" },
            ]}
          />
        </div>
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-10 text-center transition-colors focus-within:ring-2 focus-within:ring-sbg-lilac-600 ${
          dragging ? "border-sbg-lilac-600 bg-sbg-lilac-100" : "border-sbg-lilac-300 bg-sbg-lilac-50 hover:border-sbg-lilac-500"
        }`}
      >
        <UploadCloud className="h-7 w-7 text-sbg-lilac-700" aria-hidden="true" />
        <span className="text-sm font-medium">
          {purpose === "cover" ? "Choose one cover image" : "Drop files here, or click to browse"}
        </span>
        <span className="text-xs text-sbg-ink-3">
          JPEG, PNG, WebP, iPhone HEIC · compressed to WebP before upload
          {purpose === "gallery" ? ` · MP4, WebM up to ${target === "supabase" ? SUPABASE_VIDEO_MAX_BYTES / (1024 * 1024) : 500} MB` : ""}
        </span>
        <input
          type="file"
          className="sr-only"
          accept={purpose === "cover" ? IMAGE_ACCEPT : ACCEPT}
          multiple={purpose === "gallery"}
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = ""; // allow picking the same file again
          }}
        />
      </label>

      <AnimatePresence initial={false}>
        {prep !== null && (
          <motion.div
            key="prep"
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, height: 0, transition: { duration: 0.25 } }}
            className="overflow-hidden"
          >
            <PrepFlow count={compressing} stage={prep.stage} heic={prep.heic} />
          </motion.div>
        )}
      </AnimatePresence>


      {items.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-3">
            <p aria-live="polite" className="text-xs text-sbg-ink-2">
              {summary.done} of {summary.total} done
              {summary.failed > 0 && <span className="text-red-700"> · {summary.failed} need attention</span>}
              {summary.inFlight > 0 && <span> · {summary.inFlight} in progress</span>}
            </p>
            {summary.done > 0 && (
              <button type="button" onClick={clearFinished} className="text-xs text-sbg-lilac-700 hover:underline">
                Clear finished
              </button>
            )}
          </div>

          <MotionConfig reducedMotion="user">
            {/* Always mounted so a row's exit animation still plays when the last one finishes. */}
            <ul className="space-y-2.5 empty:hidden">
              <AnimatePresence initial={false}>
                {items.filter((i) => !isDone(i)).map((item) => (
                  <UploadRow key={item.id} item={item} heic={heicRef.current.has(item.id)} preview={previewsRef.current.get(item.id)} onRetry={() => retry(item)} onRemove={() => remove(item)} />
                ))}
              </AnimatePresence>
            </ul>
            {items.some(isDone) && (
              <ul aria-label="Uploaded files" className="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] sm:gap-3">
                {items.filter(isDone).map((item) => (
                  <UploadedTile key={item.id} item={item} preview={previewsRef.current.get(item.id)} onRemove={() => remove(item)} />
                ))}
              </ul>
            )}
          </MotionConfig>
        </>
      )}
    </section>
  );
}
const PREP_NODES = [
  { key: "convert", label: "Convert", Icon: FileImage },
  { key: "compress", label: "Compress", Icon: Minimize2 },
  { key: "upload", label: "Upload", Icon: UploadCloud },
] as const;

/**
 * Pre-upload pipeline: Convert (HEIC only) → Compress → Upload. Shown while photos
 * are prepared in the browser. Upload is always the next step, never active here.
 */
function PrepFlow({ count, stage, heic }: { count: number; stage: "convert" | "compress" | "upload"; heic: boolean }) {
  return (
    <div role="status" className="rounded-2xl border border-sbg-lilac-200 bg-white/70 p-4">
      <p className="mb-3 text-xs font-medium text-sbg-ink-2">
        {stage === "upload" ? "Ready to upload…" : `Preparing ${count} ${count === 1 ? "photo" : "photos"}…`}
        <span className="sr-only">{` Step: ${stage === "convert" ? "converting HEIC" : stage === "compress" ? "compressing to WebP" : "uploading"}`}</span>
      </p>
      <PipelineDiagram stage={stage} heic={heic} />
    </div>
  );
}

/**
 * The 3-node diagram itself. `upload` = the file is ready and waiting to send (queued, signing,
 * waiting for a slot): Convert/Compress are finished and the Upload node pulses. `compact` is the
 * smaller always-horizontal version used inside a queue row.
 */
function PipelineDiagram({ stage, heic, compact = false, upload }: { stage: "convert" | "compress" | "upload" | null; heic: boolean; compact?: boolean; upload?: { progress: number; sent: boolean; sending: boolean } }) {
  const reduce = useReducedMotion();
  const status = (key: (typeof PREP_NODES)[number]["key"]): "done" | "active" | "pending" | "skipped" => {
    if (key === "convert") return stage === "convert" ? "active" : (stage === "compress" || stage === "upload") && heic ? "done" : stage === "compress" || stage === "upload" ? "skipped" : "pending";
    if (key === "compress") return stage === "compress" ? "active" : stage === "upload" ? "done" : "pending";
    return stage === "upload" ? (upload?.sent ? "done" : "active") : "pending";
  };
  const fill = (from: "convert" | "compress") => {
    if (from === "convert") return stage === "compress" || stage === "upload" ? 1 : stage === "convert" ? 0.5 : 0;
    return stage === "upload" ? 1 : stage === "compress" ? 0.5 : 0;
  };
  const node = compact ? "h-8 w-8" : "h-11 w-11";
  return (
    <div className={compact ? "mt-2 flex items-center" : "flex flex-col items-stretch gap-1 sm:flex-row sm:items-center sm:gap-0"}>
        {PREP_NODES.map((n, i) => {
          const s = status(n.key);
          const isActive = s === "active";
          return (
            <div key={n.key} className="contents">
              <div className={`flex items-center ${compact ? "w-14 flex-col gap-1" : "gap-3 sm:w-24 sm:flex-col sm:gap-1.5"} ${s === "skipped" ? "opacity-50" : ""}`}>
                <div className={`relative shrink-0 ${node}`}>
                  {isActive && !reduce && (
                    <motion.span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full border-2 border-[rgb(var(--sbg-lilac-400))]"
                      initial={{ scale: 1, opacity: 0.7 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                  <motion.div
                    animate={{ scale: isActive && !reduce ? 1.08 : 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`relative flex ${node} items-center justify-center rounded-full border-2 ${
                      s === "done"
                        ? "border-[rgb(var(--sbg-lilac-600))] bg-[rgb(var(--sbg-lilac-600))] text-white"
                        : isActive
                          ? "border-[rgb(var(--sbg-lilac-500))] bg-white text-[rgb(var(--sbg-lilac-600))] shadow-[0_0_14px_rgb(var(--sbg-lilac-400))]"
                          : `border-[rgb(var(--sbg-lilac-400))]/40 bg-white text-sbg-ink-2 ${s === "skipped" ? "border-dashed" : ""}`
                    }`}
                  >
                    {n.key === "upload" && isActive && upload?.sending && (
                      // Live transfer fill: left-to-right, width = real progress; shimmer sweeps over it.
                      <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
                        <motion.span
                          className="absolute inset-0 origin-left"
                          style={{
                            backgroundColor: "rgb(var(--sbg-lilac-300) / 0.55)",
                            backgroundImage: reduce ? undefined : "linear-gradient(110deg, transparent 30%, rgb(255 255 255 / 0.85) 50%, transparent 70%)",
                            backgroundSize: "250% 100%",
                          }}
                          initial={false}
                          animate={{ scaleX: Math.min(100, Math.max(0, upload.progress)) / 100, ...(reduce ? {} : { backgroundPosition: ["130% 0%", "-30% 0%"] }) }}
                          transition={{
                            scaleX: { duration: reduce ? 0 : 0.3, ease: "easeOut" },
                            backgroundPosition: { duration: 1.2, repeat: Infinity, ease: "linear" },
                          }}
                        />
                      </span>
                    )}
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={s === "done" ? "check" : "icon"}
                        initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={reduce ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
                        transition={reduce ? { duration: 0 } : s === "done" ? { type: "spring", stiffness: 420, damping: 16 } : { duration: 0.18 }}
                        className="relative flex"
                      >
                        {s === "done" ? <Check className={compact ? "h-4 w-4" : "h-5 w-5"} aria-hidden="true" /> : <n.Icon className={compact ? "h-4 w-4" : "h-5 w-5"} aria-hidden="true" />}
                      </motion.span>
                    </AnimatePresence>
                  </motion.div>
                </div>
                <span className={`${compact ? "text-[11px]" : "text-xs"} ${isActive ? "font-semibold text-[rgb(var(--sbg-lilac-800))]" : "text-sbg-ink-2"}`}>
                  {n.label}
                  {s === "skipped" && !compact && <span className="ml-1 text-[10px]">(not needed)</span>}
                </span>
              </div>
              {i < PREP_NODES.length - 1 && (
                <div aria-hidden="true" className={`relative overflow-hidden rounded-full bg-[rgb(var(--sbg-lilac-400))]/25 ${compact ? "mb-5 h-0.5 min-w-4 flex-1" : "ml-[1.3rem] h-5 w-0.5 sm:mx-0 sm:mb-6 sm:ml-0 sm:h-0.5 sm:w-auto sm:flex-1"}`}>
                  {((compact ? ["origin-left"] : ["sm:hidden origin-top", "hidden sm:block origin-left"]) as string[]).map((cls, k, arr) => (
                    <motion.div
                      key={cls}
                      className={`absolute inset-0 bg-[rgb(var(--sbg-lilac-500))] ${cls}`}
                      initial={false}
                      animate={k === 0 && arr.length > 1 ? { scaleY: fill(PREP_NODES[i].key as "convert" | "compress") } : { scaleX: fill(PREP_NODES[i].key as "convert" | "compress") }}
                      transition={{ duration: reduce ? 0 : 0.5, ease: "easeInOut" }}
                    />
                  ))}
                  {!reduce && fill(PREP_NODES[i].key as "convert" | "compress") > 0 && fill(PREP_NODES[i].key as "convert" | "compress") < 1 && (
                    <motion.span
                      className="absolute left-0 top-0 h-full w-3 rounded-full bg-white/80"
                      animate={{ x: ["-100%", "400%"] }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
  );
}

const isDone = (i: QueueItem) => i.state === "live" || i.state === "processing";

/** Thumbnail (or a file-type icon when the image cannot be decoded). */
function Thumb({ item, preview }: { item: QueueItem; preview: string | undefined }) {
  return (
    <>
      {item.kind === "video" ? (
        <Film className="h-5 w-5 text-sbg-ink-2" aria-hidden="true" />
      ) : (
        <ImageIcon className="h-5 w-5 text-sbg-ink-2" aria-hidden="true" />
      )}
      {preview && (
        // The icon above shows through if the file is not a decodable image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt=""
          className="absolute inset-0 h-full w-full bg-sbg-mist object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
    </>
  );
}

const RING_SIZE = 64;
const RING_R = 28;
const RING_C = 2 * Math.PI * RING_R;
const RING_STROKE = 4;
/**
 * Ring drawn around the thumbnail (64px box). A spinning arc while work is in
 * flight, solid red on failure.
 */
function ProgressRing({ tone }: { tone: "active" | "error" }) {
  const reduce = useReducedMotion();
  const gradId = `${useId()}-ring`;
  const indeterminate = tone === "active";
  const offset = tone === "error" ? 0 : RING_C * 0.72;
  return (
    <motion.svg
      viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
      className="pointer-events-none absolute inset-0 h-16 w-16"
      initial={{ rotate: -90 }}
      aria-hidden="true"
      animate={indeterminate && !reduce ? { rotate: [-90, 270] } : { rotate: -90 }}
      transition={indeterminate && !reduce ? { duration: 1.1, repeat: Infinity, ease: "linear" } : { duration: 0 }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgb(var(--sbg-lilac-400))" />
          <stop offset="55%" stopColor="rgb(var(--sbg-lilac-600))" />
          <stop offset="100%" stopColor="rgb(var(--sbg-lilac-800))" />
        </linearGradient>
      </defs>
      <circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_R}
        fill="none"
        strokeWidth={RING_STROKE}
        stroke={tone === "error" ? "rgb(254 202 202)" : "rgb(var(--sbg-lilac-100))"}
      />
      <motion.circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_R}
        fill="none"
        strokeWidth={RING_STROKE}
        strokeLinecap="round"
        stroke={tone === "error" ? "rgb(220 38 38)" : `url(#${gradId})`}
        strokeDasharray={RING_C}
        initial={false}
        animate={{ strokeDashoffset: offset }}
        transition={{ type: "spring", stiffness: 120, damping: 24 }}
        style={{ filter: tone === "error" ? undefined : "drop-shadow(0 0 3px rgb(var(--sbg-lilac-500) / 0.7))" }}
      />
    </motion.svg>
  );
}
function UploadRow({
  item,
  heic,
  preview,
  onRetry,
  onRemove,
}: {
  item: QueueItem;
  heic: boolean;
  preview: string | undefined;
  onRetry: () => void;
  onRemove: () => void;
}) {
  const reduce = useReducedMotion();
  const uploading = item.state === "uploading";
  const checking = item.state === "verifying";
  const failed = item.state === "error";
  /** Photo is ready and waiting to be sent: keep the pipeline diagram going with Upload active. */
  const pendingSend = item.kind === "image" && (item.state === "queued" || item.state === "signing" || item.state === "waiting" || uploading || checking);
  const working = uploading || checking || item.state === "signing" || item.state === "waiting" || item.state === "queued";
  const status = failed ? item.error : STATUS_LABEL[item.state];
  const sizeText =
    item.originalSize !== undefined && item.originalSize > item.size
      ? `${formatBytes(item.originalSize)} → ${formatBytes(item.size)}`
      : formatBytes(item.size);
  return (
    <motion.li
      layout={reduce ? false : "position"}
      initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
      animate={failed && !reduce ? { opacity: 1, y: 0, scale: 1, x: [0, -6, 6, -4, 4, 0] } : { opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={
        reduce
          ? { opacity: 0, transition: { duration: 0 } }
          : { opacity: 0, scale: 0.9, y: -8, filter: "blur(4px)", transition: { duration: 0.28 } }
      }
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-2xl border p-3 ${
        failed
          ? "border-red-200 bg-red-50/80"
          : working
            ? "border-sbg-lilac-300 bg-white shadow-[0_10px_30px_-14px_rgb(var(--sbg-lilac-600)/0.55)]"
            : "border-sbg-ink/10 bg-white"
      }`}
    >
      {working && !reduce && (
        // Soft lilac sheen sweeping across the whole card while work is in flight.
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(110deg, transparent 30%, rgb(var(--sbg-lilac-100)) 45%, rgb(var(--sbg-lilac-200) / 0.9) 50%, rgb(var(--sbg-lilac-100)) 55%, transparent 70%)",
            backgroundSize: "250% 100%",
          }}
          animate={{ backgroundPosition: ["130% 0%", "-30% 0%"] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
        />
      )}
      <div className="relative z-[1] flex items-center gap-3.5">
        <div className="relative h-16 w-16 shrink-0">
          {working && !reduce && (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full border-2 border-sbg-lilac-400"
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 1.28, opacity: 0 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          <div
            className={`absolute flex items-center justify-center overflow-hidden bg-sbg-mist transition-[inset,border-radius] duration-300 motion-reduce:transition-none ${
              working || failed ? "inset-[7px] rounded-full" : "inset-0 rounded-xl"
            }`}
          >
            <Thumb item={item} preview={preview} />
            {working && !reduce && (
              <motion.span
                className="absolute inset-0 bg-sbg-lilac-300/40"
                animate={{ opacity: [0.15, 0.7, 0.15] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            {failed && (
              <span className="absolute inset-0 flex items-center justify-center bg-red-600/60">
                <AlertCircle className="h-5 w-5 text-white" aria-hidden="true" />
              </span>
            )}
          </div>
          {(working || failed) && <ProgressRing tone={failed ? "error" : "active"} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{item.name}</p>
          <p className={`mt-0.5 flex items-center gap-1.5 text-xs ${failed ? "text-red-700" : "text-sbg-ink-2"}`}>
            {failed && <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
            {(item.state === "signing" || checking) && (
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-sbg-lilac-600" aria-hidden="true" />
            )}
            <span className="truncate">
              {status} · <span className="tabular-nums">{sizeText}</span>
            </span>
          </p>
          {/* The tick only means "actually confirmed live" — stay active through verifying too, since the row
              is removed the instant the server confirms it, so there is no later moment left to show a tick here. */}
          {pendingSend && <PipelineDiagram stage="upload" heic={heic} compact upload={{ progress: item.progress, sent: false, sending: uploading }} />}
        </div>
        {failed && item.retryable && (
          <button
            type="button"
            onClick={onRetry}
            aria-label={`Retry ${item.name}`}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 text-xs font-medium text-red-700 hover:bg-red-50"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Retry
          </button>
        )}
        {!isBusy(item.state) && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${item.name} from the list`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sbg-ink-3 hover:bg-sbg-lilac-50 hover:text-sbg-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </motion.li>
  );
}
const BURST = Array.from({ length: 12 }, (_, i) => i * 30);
const BURST_COLORS = ["#ffffff", "rgb(var(--sbg-lilac-300))", "rgb(var(--sbg-spark))"];
/** Square tile for a finished upload: thumbnail, a one-off celebration on arrival, then a corner badge. */
function UploadedTile({ item, preview, onRemove }: { item: QueueItem; preview: string | undefined; onRemove: () => void }) {
  const reduce = useReducedMotion();
  const processing = item.state === "processing";
  const badgeTone = processing ? "bg-sbg-lilac-600" : "bg-emerald-600";
  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, scale: 0.6, rotate: -4 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 360, damping: 22 }}
      title={`${item.name} · ${formatBytes(item.size)} · ${processing ? "uploaded, being prepared for the site" : "uploaded, live"}`}
      className="group relative aspect-square overflow-hidden rounded-2xl border border-sbg-ink/10 bg-sbg-mist shadow-sm"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <Thumb item={item} preview={preview} />
      </div>
      <span className="sr-only">{item.name}: {processing ? "uploaded, being prepared for the site" : "uploaded, live"}</span>
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
      {!reduce && (
        <>
          {/* Tint flash over the photo. */}
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-sbg-lilac-700"
            initial={{ opacity: 0.55 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.35 }}
          />
          {/* Glowing border that blooms outward and fades. */}
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl border-[3px] border-sbg-lilac-400"
            style={{ boxShadow: "inset 0 0 18px rgb(var(--sbg-lilac-400) / 0.9)" }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 }}
          />
          {/* Centered celebration: ripple, particle burst, big check pop. */}
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0">
            <motion.span
              className="absolute -left-5 -top-5 h-10 w-10 rounded-full border-2 border-white"
              initial={{ scale: 0.4, opacity: 1 }}
              animate={{ scale: 2.4, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
            />
            {BURST.map((deg, i) => {
              const dist = i % 2 === 0 ? 30 : 22;
              return (
                <motion.span
                  key={deg}
                  className="absolute -left-[3px] -top-[3px] h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: BURST_COLORS[i % BURST_COLORS.length], boxShadow: "0 0 6px rgba(255,255,255,0.9)" }}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                  animate={{
                    x: Math.round(Math.cos((deg * Math.PI) / 180) * dist),
                    y: Math.round(Math.sin((deg * Math.PI) / 180) * dist),
                    opacity: [0, 1, 1, 0],
                    scale: [0.4, 1.3, 1, 0.5],
                  }}
                  transition={{ duration: 0.75, ease: "easeOut", delay: 0.2 }}
                />
              );
            })}
            <motion.span
              className={`absolute -left-4 -top-4 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white ${badgeTone}`}
              initial={{ scale: 0, opacity: 0, rotate: -45 }}
              animate={{ scale: [0, 1.3, 1, 1, 0.4], opacity: [0, 1, 1, 1, 0], rotate: [-45, 0, 0, 0, 0] }}
              transition={{ duration: 1.5, times: [0, 0.22, 0.36, 0.8, 1], ease: "easeOut", delay: 0.05 }}
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" strokeWidth={3.5} />}
            </motion.span>
          </div>
        </>
      )}
      <motion.span
        aria-hidden="true"
        className={`absolute bottom-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full text-white shadow ring-2 ring-white/80 ${badgeTone}`}
        initial={reduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 16, delay: reduce ? 0 : 1.4 }}
      >
        {processing ? <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" /> : <Check className="h-3.5 w-3.5" strokeWidth={3.5} />}
      </motion.span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${item.name} from the list`}
        className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sbg-ink-2 shadow-sm backdrop-blur transition-opacity hover:text-sbg-ink focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-sbg-lilac-600 sm:opacity-0 sm:group-hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </motion.li>
  );
}
