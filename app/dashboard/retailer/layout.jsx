import RetailerSidebar from "../../../components/retailer/RetailerSidebar";

export const metadata = {
  title: "Retailer Dashboard",
  description: "Manage your store and employees.",
};

export default function RetailerLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#FAFAFA" }}>
      <RetailerSidebar />
      <main style={{ flex: 1, marginLeft: "70px", minHeight: "100vh", display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  );
}
