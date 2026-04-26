"use client";

import { useSearchParams } from "next/navigation";

export default function useProgramParam() {
  const searchParams = useSearchParams();

  const programId =
    searchParams.get("program") ?? "factorial-iterative";

  return { programId };
}