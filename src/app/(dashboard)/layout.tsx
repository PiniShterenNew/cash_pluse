import { Sidebar } from "@/components/ui/Sidebar";
import { TopBar } from "@/components/ui/TopBar";
import { MobileBottomNav } from "@/components/ui/MobileBottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[var(--color-surface-base)]">
      {/* RTL: sidebar on the RIGHT */}
      <Sidebar />

      {/* Main content shifted left of the sidebar */}
      <div className="lg:pe-[280px] flex flex-col min-h-dvh">
        <TopBar />
        <main className="flex-1 p-6 pb-[calc(72px+24px)] lg:pb-6">
          {children}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
