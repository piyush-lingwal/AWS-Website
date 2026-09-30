"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Download,
  Eye,
  Copy,
  Check,
  Share2,
  Linkedin,
  ExternalLink,
} from "lucide-react";

interface VerificationActionToolbarProps {
  certificateId: string;
  eventName: string;
  issueDate: string;
  recipientName: string;
  pdfUrl?: string;
  verificationUrl?: string;
}

export function VerificationActionToolbar({
  certificateId,
  eventName,
  issueDate,
  recipientName,
  pdfUrl,
  verificationUrl,
}: VerificationActionToolbarProps) {
  const [copied, setCopied] = useState(false);

  const getFullVerificationUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/verify/${certificateId}`;
    }
    return verificationUrl || `https://awstulas.org/verify/${certificateId}`;
  };

  const handleCopyLink = () => {
    const url = getFullVerificationUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Verification link copied to clipboard", {
      description: url,
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    const url = getFullVerificationUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `AWS SBG Certificate - ${recipientName}`,
          text: `Verified official AWS Student Builder Group Certificate for ${eventName} awarded to ${recipientName}.`,
          url,
        });
        toast.success("Shared successfully");
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  // Pre-filled Add to LinkedIn URL
  const getLinkedInCertUrl = () => {
    const url = getFullVerificationUrl();
    const issueDateObj = new Date(issueDate || Date.now());
    const year = issueDateObj.getFullYear();
    const month = issueDateObj.getMonth() + 1;

    const params = new URLSearchParams({
      startTask: "CERTIFICATION_NAME",
      name: eventName || "AWS Student Builder Group Cloud Workshop",
      organizationName: "AWS Student Builder Group - Tula's University",
      issueYear: String(year),
      issueMonth: String(month),
      certUrl: url,
      certId: certificateId,
    });

    return `https://www.linkedin.com/profile/add?${params.toString()}`;
  };

  const downloadUrl = pdfUrl || `/api/certificates/${certificateId}`;
  const inlineViewUrl = `/api/certificates/${certificateId}?inline=true`;

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Download PDF Primary Button */}
      <a
        href={downloadUrl}
        download={`${certificateId}.pdf`}
        className="h-11 px-5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
      >
        <Download className="w-4 h-4" />
        <span>Download PDF</span>
      </a>

      {/* View Inline PDF */}
      <a
        href={inlineViewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="h-11 px-4 rounded-xl text-xs font-medium text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
        title="View Certificate PDF in new tab"
      >
        <Eye className="w-4 h-4 text-[#A1A1AA]" />
        <span className="hidden sm:inline">View PDF</span>
      </a>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className="h-11 px-4 rounded-xl text-xs font-medium text-[#D4D4D8] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
        title="Copy verification link to clipboard"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">Link Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 text-[#A1A1AA]" />
            <span>Copy Link</span>
          </>
        )}
      </button>

      {/* Add to LinkedIn Button */}
      <a
        href={getLinkedInCertUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="h-11 px-4 rounded-xl text-xs font-medium text-[#0A66C2] hover:text-white hover:bg-[#0A66C2] bg-[#0A66C2]/10 border border-[#0A66C2]/30 flex items-center gap-2 transition-all cursor-pointer"
        title="Add Certificate to your LinkedIn profile"
      >
        <Linkedin className="w-4 h-4" />
        <span className="hidden sm:inline">Add to LinkedIn</span>
      </a>

      {/* Share Button (Mobile/Web Share) */}
      <button
        onClick={handleShare}
        className="h-11 w-11 rounded-xl flex items-center justify-center text-[#A1A1AA] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer"
        title="Share credential"
      >
        <Share2 className="w-4 h-4" />
      </button>
    </div>
  );
}
