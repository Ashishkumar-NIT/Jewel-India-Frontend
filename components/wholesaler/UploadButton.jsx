import Link from "next/link";

export default function UploadButton() {
  return (
    <Link
      href="/dashboard/wholesaler/add-product"
      className="inline-flex items-center gap-2 rounded-full cursor-pointer bg-celestique-dark px-8 py-3.5 text-s font-medium text-white shadow-md hover:bg-[#2a2a2a] active:scale-[0.97] transition-all duration-200"
    >
      <i className="bi bi-upload"></i>
      Upload Now
    </Link>
  );
}
