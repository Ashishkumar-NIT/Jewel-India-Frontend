import { supabaseAdmin } from "../../../../lib/supabase/admin.js";
import { createClient } from "../../../../lib/supabase/server.js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const supabaseServer = await createClient();
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: `Unauthorized — ${authError?.message || "Please sign in again"}` },
        { status: 401 }
      );
    }

    const uid = user.id;
    const formData = await req.formData();
    const fullName = formData.get("name") || "";
    const aadharNumber = formData.get("aadhar") || "";
    const businessName = formData.get("businessName") || "";
    const state = formData.get("state") || "";
    const city = formData.get("city") || "";
    const referralCode = formData.get("referralCode") || null;

    const aadharFront = formData.get("aadharFront");
    const aadharBack = formData.get("aadharBack");
    const panCard = formData.get("panCard");
    const gstCertificate = formData.get("gstCertificate");
    const businessLogo = formData.get("businessLogo");

    // Reject dead invitations before uploading sensitive documents. The final
    // claim still happens transactionally after the retailer row is written.
    if (referralCode) {
      const { data: link, error: linkError } = await supabaseAdmin
        .from("referral_links")
        .select("id, expires_at, accepted_by, uses_count, is_active")
        .eq("code", referralCode)
        .maybeSingle();

      const unavailable = linkError || !link || !link.is_active || link.accepted_by
        || link.uses_count >= 1 || !link.expires_at
        || new Date(link.expires_at).getTime() <= Date.now();

      if (unavailable) {
        return NextResponse.json(
          { error: "This invitation is invalid, expired, or has already been used." },
          { status: 410 }
        );
      }

      const { data: existingRetailer } = await supabaseAdmin
        .from("retailers")
        .select("id, referred_by, referral_code")
        .eq("user_id", uid)
        .maybeSingle();

      if (existingRetailer
          && existingRetailer.referral_code !== referralCode) {
        return NextResponse.json(
          { error: "Existing retailer accounts cannot accept a new invitation." },
          { status: 409 }
        );
      }
    }

    async function uploadFile(bucket, filePath, file) {
      if (!file || !(file instanceof File)) return null;

      const buffer = Buffer.from(await file.arrayBuffer());
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (error) {
        console.error("Upload error [" + bucket + "/" + filePath + "]:", error.message);
        return null;
      }

      const { data: urlData } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return urlData?.publicUrl || null;
    }

    const timestamp = Date.now();
    const [
      aadharFrontUrl,
      aadharBackUrl,
      panCardUrl,
      gstCertificateUrl,
      businessLogoUrl,
    ] = await Promise.all([
      uploadFile("aadhaar-documents", uid + "/aadhaar-front-" + timestamp, aadharFront),
      uploadFile("aadhaar-documents", uid + "/aadhaar-back-" + timestamp, aadharBack),
      uploadFile("pan-documents", uid + "/pan-card-" + timestamp, panCard),
      uploadFile("gst-documents", uid + "/gst-certificate-" + timestamp, gstCertificate),
      uploadFile("business-logos", uid + "/business-logo-" + timestamp, businessLogo),
    ]);

    const { data: retailer, error: dbError } = await supabaseAdmin
      .from("retailers")
      .upsert(
        {
          user_id: uid,
          email: user.email,
          full_name: fullName,
          aadhar_number: aadharNumber,
          business_name: businessName,
          state: state,
          city: city,
          aadhaar_front_url: aadharFrontUrl,
          aadhaar_back_url: aadharBackUrl,
          pan_card_url: panCardUrl,
          gst_certificate_url: gstCertificateUrl,
          business_logo_url: businessLogoUrl,
          referral_code: referralCode,
          verification_status: "pending",
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError.message);
      return NextResponse.json(
        { error: dbError.message },
        { status: 500 }
      );
    }

    if (referralCode) {
      const { data: claim, error: claimError } = await supabaseAdmin.rpc(
        "claim_retailer_referral",
        { p_code: referralCode, p_retailer_user: uid }
      );

      if (claimError || !claim?.ok) {
        console.error("Referral claim failed:", claimError?.message || claim?.error);
        await supabaseAdmin
          .from("retailers")
          .update({ referral_code: null })
          .eq("user_id", uid)
          .is("referred_by", null);

        return NextResponse.json(
          { error: "This invitation was just used or is no longer available." },
          { status: 409 }
        );
      }
    }

    return NextResponse.json({ success: true, data: retailer });
  } catch (err) {
    console.error("Onboard retailer submit error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
