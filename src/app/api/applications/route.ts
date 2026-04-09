import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, generateRefNumber } from "@/lib/supabase/admin";
import { notifyAdmins } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { userId, benefitProgramId, applicantName, applicantContact, applicantBarangay, purpose, amountRequested, documents = [] } = body;

    if (!userId || !benefitProgramId || !purpose?.trim()) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const db = createAdminClient();

    // Verify ownership + residency
    const { data: dbUser } = await db
      .from("users")
      .select("id, residencyVerified")
      .eq("supabaseId", user.id)
      .single();

    if (!dbUser || dbUser.id !== userId) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    if (!dbUser.residencyVerified) {
      return NextResponse.json({ error: "Residency must be verified before applying." }, { status: 422 });
    }

    const now = new Date().toISOString();
    const appId = crypto.randomUUID();

    const { data: application, error: appError } = await db
      .from("applications")
      .insert({
        id: appId,
        referenceNumber: generateRefNumber(),
        userId,
        benefitProgramId,
        applicantName,
        applicantContact: applicantContact ?? null,
        applicantBarangay: applicantBarangay ?? null,
        applicantAddress: applicantBarangay ? `${applicantBarangay}, Makati City` : null,
        purpose: purpose.trim(),
        amountRequested: amountRequested ?? null,
        status: "PENDING",
        createdAt: now,
        updatedAt: now,
      })
      .select("id, referenceNumber")
      .single();

    if (appError) {
      console.error("[POST /api/applications]", appError);
      return NextResponse.json({ error: "Failed to submit application." }, { status: 500 });
    }

    // Upload document records
    if (documents.length > 0) {
      const docRows = documents.map((d: { url: string; fileName: string; fileSize: number; mimeType: string }) => ({
        id: crypto.randomUUID(),
        userId,
        applicationId: appId,
        type: "OTHER",
        status: "PENDING",
        fileName: d.fileName,
        fileUrl: d.url,
        fileSize: d.fileSize,
        mimeType: d.mimeType,
        createdAt: now,
        updatedAt: now,
      }));

      const { error: docError } = await db.from("documents").insert(docRows);
      if (docError) console.error("[POST /api/applications] doc insert:", docError);
    }

    // Notify all admin/super-admin staff about the new application (non-blocking)
    notifyAdmins({
      title: "New Application Submitted",
      message: `${applicantName} submitted application ${application.referenceNumber} — awaiting review.`,
      type: "APPLICATION_UPDATE",
    }).catch((e) => console.error("[notifyAdmins]", e));

    return NextResponse.json(
      { id: application.id, referenceNumber: application.referenceNumber },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/applications]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
