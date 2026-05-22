import { cookies } from "next/headers";

/**
 * Validates whether the active session has authorized access to employee dashboard resources.
 * Supports both direct employees and retailer accounts who have toggled into Employee View context.
 *
 * @param {SupabaseClient} supabase - The active Supabase client instance.
 * @returns {Promise<{ user: any, role: string, employeeId: string } | { error: string, status: number }>}
 */
export async function validateEmployeeAccess(supabase) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: "Unauthenticated", status: 401 };
    }

    const role = user.user_metadata?.role;

    // 1. Direct Employee Access
    if (role === "employee") {
      // Find their employee record
      const { data: employee, error: empError } = await supabase
        .from("employees")
        .select("id, status")
        .eq("auth_user_id", user.id)
        .single();

      if (empError || !employee || employee.status !== "active") {
        return { error: "Forbidden: Inactive or missing employee record", status: 403 };
      }

      return { user, role, employeeId: employee.id, retailerId: employee.retailer_id };
    }

    // 2. Retailer Context Access (Switch Mode)
    if (role === "retailer") {
      const cookieStore = await cookies();
      const activeView = cookieStore.get("jewel_view_mode")?.value;

      if (activeView === "employee") {
        // Find their virtual employee record
        // Defensive: Check is_system_generated first, fallback to designation = 'Admin' if column missing
        let employeeQuery = supabase
          .from("employees")
          .select("id, retailer_id, designation")
          .eq("auth_user_id", user.id);

        const { data: employees, error: queryError } = await employeeQuery;

        if (queryError || !employees || employees.length === 0) {
          return { error: "Forbidden: Virtual employee profile not provisioned", status: 403 };
        }

        // Try to select the system-generated profile or designation = 'Admin'
        const sysEmployee = employees.find(emp => emp.is_system_generated === true) || 
                            employees.find(emp => emp.designation === "Admin");

        if (!sysEmployee) {
          return { error: "Forbidden: Admin context not found", status: 403 };
        }

        return { user, role, employeeId: sysEmployee.id, retailerId: sysEmployee.retailer_id };
      }
    }

    return { error: "Forbidden: Role not authorized for employee resources", status: 403 };
  } catch (err) {
    return { error: "Internal Server Error", status: 500 };
  }
}
