import TopAppBar from "@/components/TopAppBar";
import SideNavBar from "@/components/SideNavBar";
import BottomNavBar from "@/components/BottomNavBar";
import ProgramsClient from "./index";
import { getPrograms, getLabStats } from "@/app/actions";

export const metadata = {
  title: "The Precision Lab - Program Selection",
};

export default async function Home() {
  // Both fetches run in parallel
  const [programs, stats] = await Promise.all([getPrograms(), getLabStats()]);

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <TopAppBar />
      <SideNavBar />

      <main className="ml-20 md:ml-64 pt-20 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-12">
            <p className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-primary mb-2">
              Program Selection
            </p>
            <h1 className="text-[2.25rem] font-bold text-on-background tracking-tight leading-none mb-4">
              Choose a computational model.
            </h1>
            <p className="text-on-surface-variant max-w-2xl leading-relaxed">
              Select a predefined algorithm from the library below to begin your execution
              visualization. Each model includes pre-mapped stack frames and data flow tracking.
            </p>
          </div>

          {/* Interactive Grid — handed off to CSR */}
          <ProgramsClient programs={programs} stats={stats} />
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
}
