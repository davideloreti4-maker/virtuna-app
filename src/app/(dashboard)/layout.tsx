import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <main
        style={{ marginLeft: "240px", minHeight: "100vh", padding: "24px" }}
        className="max-lg:ml-0 max-lg:pb-24"
      >
        {children}
      </main>
      <MobileNav />
    </>
  );
}
