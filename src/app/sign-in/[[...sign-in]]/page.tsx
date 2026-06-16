import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0A0A0A]">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0A0A0A]/80 to-[#0A0A0A] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 pointer-events-none mix-blend-overlay" />
      
      {/* Decorative blurry orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />

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
              card: "bg-[#0f0f13]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl w-full",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "border-white/10 hover:bg-white/5 text-zinc-300 transition-colors",
              formButtonPrimary: "bg-indigo-500 hover:bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-500/25 transition-all",
              formFieldInput: "bg-black/50 border-white/10 focus:border-indigo-500 text-white rounded-xl",
              formFieldLabel: "text-zinc-400 font-medium",
              dividerLine: "bg-white/10",
              dividerText: "text-zinc-500",
              footerActionLink: "text-indigo-400 hover:text-indigo-300 font-medium",
              identityPreview: "bg-black/50 border border-white/10",
              identityPreviewText: "text-zinc-300",
              identityPreviewEditButton: "text-indigo-400 hover:text-indigo-300"
            }
          }}
        />
      </div>
    </div>
  );
}
