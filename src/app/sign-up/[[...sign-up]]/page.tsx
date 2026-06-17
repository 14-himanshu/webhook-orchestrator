import { SignUp } from "@clerk/nextjs";
import BackgroundGrid from "@/app/components/BackgroundGrid";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0A0A0A]">
      <BackgroundGrid />

      {/* Auth Container */}
      <div className="relative z-10 w-full max-w-md p-6">
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Create an account
          </h1>
          <p className="text-zinc-400">
            Get started with Webhook Orchestrator
          </p>
        </div>

        <SignUp 
          appearance={{
            elements: {
              rootBox: "w-full flex justify-center",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
            }
          }}
        />
      </div>
    </div>
  );
}
