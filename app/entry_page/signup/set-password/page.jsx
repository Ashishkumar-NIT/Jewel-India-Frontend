import { Suspense } from "react";
import { AuthLayout } from "../../../../components/auth/AuthLayout";
import { SetPasswordForm } from "../../../../components/auth/SetPasswordForm";

export const metadata = {
  title: "Create Password — Celestique",
};

export default function SetPasswordPage() {
  return (
    <AuthLayout
      title={<span className="text-[26px] md:text-[28px] xl:text-[36px] font-bold block mb-[10px] xl:mb-[12px] tracking-normal">Set Password</span>}
      subtitle={null}
      imageSrc="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1774883373/authImg_ivftu7.png"
    >
      <Suspense>
        <SetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
