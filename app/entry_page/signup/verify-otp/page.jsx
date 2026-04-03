import { Suspense } from "react";
import { AuthLayout } from "../../../../components/auth/AuthLayout";
import { OtpForm } from "../../../../components/auth/OtpForm";

export const metadata = {
  title: "Verify OTP — Celestique",
};

export default function VerifyOtpPage() {
  return (
    <AuthLayout
      title={<><span className="text-[28px] sm:text-[32px] md:text-[44px]">Create a</span><br/><span className="text-[28px] sm:text-[32px] md:text-[44px]">Wholesaler Account</span></>}
      subtitle={null}
      imageSrc="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1774883373/authImg_ivftu7.png"
    >
      <Suspense>
        <OtpForm />
      </Suspense>
    </AuthLayout>
  );
}
