import { Suspense } from "react";
import Image from "next/image";
import { EmployeeLoginForm } from "../../components/auth/EmployeeLoginForm";

export const metadata = {
  title: "Employee Login — Jewels India",
  description: "Employee access to catalogue and order management.",
};

export default function EmployeeLoginPage() {
  return (
    <div className="theme-employee flex flex-col md:flex-row w-full min-h-screen bg-white overflow-hidden p-4">
      {/* Left Side — Full-height image */}
      <div className="relative w-full h-[40vh] md:w-[60%] lg:w-[65%] md:h-[calc(100vh-2rem)] flex-shrink-0 overflow-hidden">
        <Image
          src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1778315194/emp_invite_image_tlmjyv.svg"
          alt="Employee Invite"
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
        />
      </div>

      {/* Right Side — Login Form */}
      <div className="w-full md:w-[40%] lg:w-[35%] flex-shrink-0 flex flex-col bg-white px-[20px] pt-[16px] md:px-[24px] lg:px-[40px]">
        <div className="w-full max-w-[400px] mx-auto">
          <Suspense>
            <EmployeeLoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
