import { redirect } from "next/navigation";

// /entry_page → instantly redirects to /entry_page/signup
export default function EntryPageRoot() {
  redirect("/entry_page/signup");
}
