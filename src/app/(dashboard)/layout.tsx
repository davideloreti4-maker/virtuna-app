import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <main className="lg:ml-[240px] min-h-screen p-4 md:p-6 pb-24 lg:pb-6">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
