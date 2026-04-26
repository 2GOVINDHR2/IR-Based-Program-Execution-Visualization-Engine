"use server";
/**
 * Fetch execution trace for a program from the backend.
 * @param {string} programId
 * @param {object} input
 */
export async function getExecutionTrace(programId, input = { n: 1 }) {
  console.log(`Fetching execution trace for program: ${programId} with input:`, input);
  const res = await fetch("http://localhost:5000/execute/preset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ program: programId, input }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to fetch execution trace");
  }
  return await res.json();
}


/**
 * Fetch all programs from the backend.
 * Replace the URL and logic with your actual API endpoint.
 */
export async function getPrograms() {
  // Update this URL if your backend runs on a different port or host
  const res = await fetch("http://localhost:5000/programs", {
    cache: "no-store", // or "force-cache" / revalidate: 60
  });
  if (!res.ok) throw new Error("Failed to fetch programs");
  const data = await res.json();
  // The backend returns { programs: [...] }
  return data.programs;
}

/**
 * Fetch lab statistics from the backend.
 */
export async function getLabStats() {
  // TODO: replace with your real API endpoint
  // const res = await fetch(`${process.env.API_BASE_URL}/stats`, { cache: "no-store" });
  // if (!res.ok) throw new Error("Failed to fetch lab stats");
  // return res.json();

  return {
    avgExecutionSync: "12.4ms",
    heapAllocationCap: "1.2GB",
  };
}
