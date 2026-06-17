export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest animate-pulse">
          Loading Workspace...
        </p>
      </div>
    </div>
  );
}
