import { BottomNav } from "./BottomNav";
import { Header } from "./Header";

export function AppShell({ children }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-shell px-4 pb-28 pt-8 sm:px-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
