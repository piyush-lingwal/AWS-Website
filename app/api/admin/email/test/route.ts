import { NextRequest, NextResponse } from "next/server";
import { verifyEmailConfig, sendCertificateEmail } from "@/lib/email";
import type { ApiResponse } from "@/types/certificate";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const configStatus = await verifyEmailConfig();
    return NextResponse.json({
      success: true,
      data: configStatus,
    } satisfies ApiResponse);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to check email status" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: { targetEmail?: string };
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const adminEmail = process.env.GMAIL_USER || "piyushcode.z1@gmail.com";
    const target = body.targetEmail?.trim() || adminEmail;

    // Send a lightweight test email
    const dummyPdf = Buffer.from(
      "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF"
    );

    const result = await sendCertificateEmail({
      to: target,
      recipientName: "Admin Tester",
      eventName: "AWS SBG System Test",
      eventDate: new Date().toISOString().split("T")[0],
      certificateId: "AWS-SBG-TEST-000001",
      verificationUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/verify`,
      pdfBuffer: dummyPdf,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Email delivery failed",
          data: { provider: result.provider },
        } satisfies ApiResponse,
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test email dispatched successfully to ${target} via ${result.provider}.`,
      data: {
        provider: result.provider,
        messageId: result.messageId,
        details: result.details,
      },
    } satisfies ApiResponse);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to dispatch test email" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
