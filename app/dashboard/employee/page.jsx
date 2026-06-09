import { createClient } from "../../../lib/supabase/server";
import { supabaseAdmin } from "../../../lib/supabase/admin";
import { redirect } from "next/navigation";
import EmployeeHomeClient from "../../../components/employee/EmployeeHomeClient";
import { ensureVirtualEmployee } from "../../../lib/supabase/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EmployeeDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entry_page/signin");

  // Fetch employee record (auto-provisioning if retailer admin)
  const employee = await ensureVirtualEmployee(user);

  if (!employee) redirect("/entry_page/signin");

  let currentEmployee = { ...employee };

  // Deterministically assign a background image based on the employee's ID.
  // This ensures it is "randomly" assigned per employee, but stays the SAME forever for them,
  // without needing to add new columns to the database.
  const images = [
    "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1778318369/emp_static1_ywv9ro.svg",
    "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1778318368/emp_static2_vijtdd.svg",
    "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1778318368/emp_static3_xdapmt.svg",
    "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1778318368/emp_static4_q0ysjt.svg"
  ];
  
  // Create a seed by taking the last character of the employee's UUID (0-9, a-f)
  // This ensures a perfectly even and random distribution across the 4 images.
  const lastChar = currentEmployee.id ? currentEmployee.id.slice(-1) : '0';
  const seed = parseInt(lastChar, 16) || 0;
  
  currentEmployee.assigned_bg_image = images[seed % images.length];

  // Fetch parent retailer
  const { data: retailer } = await supabase
    .from("retailers")
    .select("id, business_name, business_logo_url")
    .eq("id", employee.retailer_id)
    .single();

  const businessName = retailer?.business_name || "Your Store";
  const businessLogoUrl = retailer?.business_logo_url || null;

  // Fetch non-archived designs for the Designer Collection using Admin to bypass RLS
  const { data: designs } = await supabaseAdmin
    .from("retailer_designs")
    .select("id, image_url, title, category, tags, is_archived, created_at, size, purity, net_weight, gross_weight, stone_weight, type, style_aesthetic, is_in_stock, production_time_days")
    .eq("retailer_id", employee.retailer_id)
    .eq("is_archived", false);

  // Shuffle designs server-side to avoid hydration mismatch
  let shuffledDesigns = [...(designs || [])];
  for (let i = shuffledDesigns.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDesigns[i], shuffledDesigns[j]] = [shuffledDesigns[j], shuffledDesigns[i]];
  }
  shuffledDesigns = shuffledDesigns.slice(0, 6);

  return (
    <EmployeeHomeClient
      employee={currentEmployee}
      businessName={businessName}
      businessLogoUrl={businessLogoUrl}
      designs={shuffledDesigns}
    />
  );
}
