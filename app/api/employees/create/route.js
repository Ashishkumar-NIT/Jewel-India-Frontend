import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { supabaseAdmin } from "../../../../lib/supabase/admin";
import {
  generateEmployeeCredentials,
  isValidEmailFormat,
  validateIndianMobile,
} from "../../../../lib/utils/credentials";

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data: retailer } = await supabase
      .from("retailers")
      .select("id, business_name")
      .eq("user_id", user.id)
      .single();

    if (!retailer) {
      return NextResponse.json({ error: "Retailer profile not found" }, { status: 404 });
    }

    const { full_name, designation, phone, personal_email, login_email, password_plain, status } = await request.json();

    const fullName = typeof full_name === "string" ? full_name.trim() : "";
    const designationValue =
      typeof designation === "string" ? designation.trim() : "";

    let phoneValue = null;
    if (typeof phone === "string" && phone.trim().length > 0) {
      const mobileCheck = validateIndianMobile(phone.trim());
      if (!mobileCheck.valid) {
        return NextResponse.json(
          { error: "Please provide a valid 10-digit Indian mobile number." },
          { status: 400 }
        );
      }
      phoneValue = mobileCheck.normalized;
    }

    if (!fullName || !designationValue) {
      return NextResponse.json({ error: "Full name and designation are required" }, { status: 400 });
    }

    // Get existing emails to prevent duplicates
    const { data: existingEmployees } = await supabaseAdmin
      .from("employees")
      .select("email")
      .eq("retailer_id", retailer.id);
      
    const existingEmails = existingEmployees?.map(e => e.email) || [];

    // Generate credentials if not provided
    let finalEmail = login_email;
    let finalPassword = password_plain;

    if (!finalEmail || !finalPassword) {
      const { email, password } = generateEmployeeCredentials(
        fullName,
        retailer.business_name,
        existingEmails
      );
      finalEmail = finalEmail || email;
      finalPassword = finalPassword || password;
    }

    if (!isValidEmailFormat(finalEmail)) {
      console.error("[employees/create] Generated/Provided invalid email", {
        fullName,
        businessName: retailer.business_name,
        email: finalEmail,
      });
      return NextResponse.json(
        {
          error:
            "Could not generate a valid employee email from the current store/name values. Please update store name and try again.",
        },
        { status: 400 }
      );
    }

    // Create the auth user and explicitly confirm their email so they can login immediately
    const { data: newAuthUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: finalEmail,
      password: finalPassword,
      email_confirm: true,
      user_metadata: { role: 'employee' }
    });

    if (createUserError) {
      console.error("Supabase Admin Create User Error:", createUserError);
      return NextResponse.json(
        { error: createUserError.message },
        { status: createUserError.status || 500 }
      );
    }

    // Add to specific profiles table 
    await supabaseAdmin.from("profiles").upsert({
      id: newAuthUser.user.id,
      email: finalEmail,
      role: 'employee'
    });

    // Create the employee record
    const employeeBasePayload = {
      retailer_id: retailer.id,
      auth_user_id: newAuthUser.user.id,
      email: finalEmail,
      password_plain: finalPassword,
      full_name: fullName,
      designation: designationValue,
      phone: phoneValue,
      personal_email: personal_email || null,
    };

    let { data: newEmployee, error: employeeInsertError } = await supabaseAdmin
      .from("employees")
      .insert({
        ...employeeBasePayload,
        status: status || "active",
      })
      .select()
      .single();

    // Backward compatibility if the table uses is_active instead of status.
    if (
      employeeInsertError &&
      /column\s+"?status"?\s+does not exist/i.test(employeeInsertError.message || "")
    ) {
      ({ data: newEmployee, error: employeeInsertError } = await supabaseAdmin
        .from("employees")
        .insert({
          ...employeeBasePayload,
          is_active: true,
        })
        .select()
        .single());
    }

    if (employeeInsertError) {
       // Cleanup auth user if DB insert fails
       await supabaseAdmin.auth.admin.deleteUser(newAuthUser.user.id);
       console.error("Employee DB Insert Error:", employeeInsertError);
       return NextResponse.json({ error: employeeInsertError.message }, { status: 500 });
    }

    const normalizedEmployee = {
      ...newEmployee,
      is_active:
        typeof newEmployee?.is_active === "boolean"
          ? newEmployee.is_active
          : newEmployee?.status === "active",
    };

    return NextResponse.json({ data: normalizedEmployee });

  } catch (error) {
    console.error("Create employee error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
