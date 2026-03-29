import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 transition-all duration-300" style={{ backgroundColor: "var(--bg-secondary)" }}>
        {children}
      </main>
    </div>
  );
}
