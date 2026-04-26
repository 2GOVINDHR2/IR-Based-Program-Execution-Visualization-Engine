"use client"
import { useRouter } from "next/navigation";

export default function ProgramCard({ program }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push("/execution?program=" + program.id)}
      className="group p-6 bg-white rounded-lg border hover:shadow cursor-pointer flex justify-between"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-lg">{program.title}</h3>
          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
            {program.type}
          </span>
        </div>

        <p className="text-sm text-slate-500 mb-3">
          {program.description}
        </p>

        <div className="flex gap-4 text-xs text-slate-400">
          <span>Time: {program.time}</span>
          <span>Space: {program.space}</span>
        </div>
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition">
        →
      </div>
    </div>
  );
}