// app/execution/page.jsx
import TopAppBar from "@/components/TopAppBar";
import SideNavBar from "@/components/SideNavBar";
import ExecutionClient from "./index";
import { getExecutionTrace } from "@/app/actions";
import searchParams from "@/app/execution/SearchParamsClient";

export const metadata = {
  title: "The Precision Lab - Execution Workspace",
};
export default async function Page({ searchParams }) {
  const params = await searchParams;
  const programId = params?.program ?? "factorial_iterative";

  const input = { n: 5 };

  const trace = await getExecutionTrace(programId, input);

  return (
    <div className="text-on-background overflow-hidden h-screen flex flex-col">
      <TopAppBar />
      <SideNavBar activeItem="execution" />
      <ExecutionClient trace={trace} />
    </div>
  );
}