// app/execution/[id]/page.jsx

import TopAppBar from "@/components/TopAppBar";
import SideNavBar from "@/components/SideNavBar";
import ExecutionClient from "@/app/execution/[id]/index.jsx";
import { getProgramData } from "@/app/execution/[id]/action";

export const metadata = {
  title: "The Precision Lab - Execution Workspace",
};

export default async function Page({ params }) {
  const { id: programId } = await params;

  const trace = await getProgramData(programId);

  return (
    <div className="text-on-background overflow-hidden h-screen flex flex-col">
      <TopAppBar />
      <SideNavBar activeItem="execution" />

      {/* Pass full data to client */}
      <ExecutionClient trace={trace} />
    </div>
  );
}