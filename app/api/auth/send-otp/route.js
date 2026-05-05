import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import { createClient } from "../../../../lib/supabase/server";
import { validateIndianMobile } from "../../../../lib/utils/credentials";

const MAX_RESENDS = 5;          // max resend attempts per identity
const LOCK_DURATION_HOURS = 24; // lockout duration after exhausting resends
const RESEND_COOLDOWN_SECONDS = 30; // min wait between resends

export async function POST(request) {
  try {
    const { identity } = await request.json();

    if (!identity || typeof identity !== "string") {
      return NextResponse.json({ error: "Identity is required" }, { status: 400 });
    }

    const trimmed = identity.trim();
    const normalized = trimmed.toLowerCase();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
    const mobileCheck = validateIndianMobile(trimmed);

    if (!isEmail && !mobileCheck.valid) {
      return NextResponse.json(
        { error: "Please enter a valid email address or 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    const phoneIdentity = mobileCheck.valid ? mobileCheck.normalized : normalized;

    // ── Rate limit check ─────────────────────────────────────────────────────
    const { data: rateLimit, error: rlFetchError } = await supabaseAdmin
      .from("otp_rate_limits")
      .select("*")
      .eq("identity", normalized)
      .single();

    const now = new Date();

    if (rateLimit) {
      // Check if currently locked
      if (rateLimit.locked_until) {
        const lockedUntil = new Date(rateLimit.locked_until);
        if (now < lockedUntil) {
          return NextResponse.json(
            {
              error: "Too many OTP requests. Please try again after 24 hours.",
              locked: true,
              lockedUntil: rateLimit.locked_until,
            },
            { status: 429 }
          );
        } else {
          // Lock expired — reset the record
          await supabaseAdmin
            .from("otp_rate_limits")
            .update({ resend_count: 0, locked_until: null, first_sent_at: now.toISOString(), last_sent_at: null })
            .eq("identity", normalized);
        }
      }

      // Enforce cooldown between resends
      if (rateLimit.last_sent_at) {
        const lastSent = new Date(rateLimit.last_sent_at);
        const secondsSinceLast = (now - lastSent) / 1000;
        if (secondsSinceLast < RESEND_COOLDOWN_SECONDS) {
          return NextResponse.json(
            {
              error: `Please wait ${Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLast)} seconds before requesting another OTP.`,
              cooldown: true,
              waitSeconds: Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLast),
            },
            { status: 429 }
          );
        }
      }

      // Check max resends
      const freshCount = rateLimit.locked_until ? 0 : (rateLimit.resend_count ?? 0);
      if (freshCount >= MAX_RESENDS) {
        const lockedUntil = new Date(now.getTime() + LOCK_DURATION_HOURS * 60 * 60 * 1000);
        await supabaseAdmin
          .from("otp_rate_limits")
          .update({ locked_until: lockedUntil.toISOString() })
          .eq("identity", normalized);

        return NextResponse.json(
          {
            error: "You have exhausted all OTP resend attempts. Try again after 24 hours.",
            locked: true,
            lockedUntil: lockedUntil.toISOString(),
          },
          { status: 429 }
        );
      }
    }

    // ── Send OTP via Supabase ────────────────────────────────────────────────
    const supabase = await createClient();
    
    let otpError;
    if (isEmail) {
      const resp = await supabase.auth.signInWithOtp({
        email: normalized,
        options: { shouldCreateUser: true },
      });
      otpError = resp.error;
    } else {
      const resp = await supabase.auth.signInWithOtp({
        phone: phoneIdentity,
        options: { shouldCreateUser: true },
      });
      otpError = resp.error;
    }

    if (otpError) {
      console.error("[send-otp] Supabase error:", otpError);
      return NextResponse.json({ error: otpError.message }, { status: 500 });
    }

    // ── Update rate limit record ─────────────────────────────────────────────
    const newCount = (rateLimit?.resend_count ?? 0) + 1;

    if (rateLimit && !rlFetchError) {
      await supabaseAdmin
        .from("otp_rate_limits")
        .update({
          resend_count: newCount,
          last_sent_at: now.toISOString(),
        })
        .eq("identity", normalized);
    } else {
      await supabaseAdmin.from("otp_rate_limits").insert({
        identity: normalized,
        resend_count: 1,
        first_sent_at: now.toISOString(),
        last_sent_at: now.toISOString(),
      });
    }

    const remainingResends = Math.max(0, MAX_RESENDS - newCount);

    return NextResponse.json({
      success: true,
      remainingResends,
      lastSentAt: now.toISOString(),
    });
  } catch (err) {
    console.error("[send-otp] unexpected error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
