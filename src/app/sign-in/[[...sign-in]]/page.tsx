import { SignIn } from "@clerk/nextjs";
import BackgroundGrid from "@/app/components/BackgroundGrid";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0A0A0A]">
      <BackgroundGrid />

      {/* Auth Container */}
      <div className="relative z-10 w-full max-w-md p-6">
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="text-zinc-400">
            Sign in to your Webhook Orchestrator account
          </p>
        </div>

        <SignIn 
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
