"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "@/lib/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSignIn = async (data: LoginForm) => {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error: unknown) {
      const msg = (error as Error)?.message?.includes("Access denied")
        ? (error as Error).message
        : "Invalid email or password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #4A2463 0%, #9B6DAE 50%, #C69FD5 100%)" }}
    >
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full opacity-20"
          style={{ background: "#E8879C" }} />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full opacity-15"
          style={{ background: "#B8A9D1" }} />
        <div className="absolute top-1/2 left-1/4 h-48 w-48 rounded-full opacity-10"
          style={{ background: "#FDFDC9" }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl mb-4 shadow-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)" }}>
            <Image src="/icon.png" alt="The Spot App" width={64} height={64} className="object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-white">The Spot App</h1>
          <p className="mt-1 text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
            Admin Dashboard
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl shadow-2xl overflow-hidden"
          style={{ backgroundColor: "#FDFDC9", border: "1px solid #EFEFEF" }}>

          <div className="p-8">
            <h2 className="text-xl font-bold mb-1" style={{ color: "#2E2E2E" }}>
              Welcome back
            </h2>
            <p className="text-sm mb-6" style={{ color: "#B8A9D1" }}>
              Sign in to manage your content
            </p>
            <form onSubmit={loginForm.handleSubmit(onSignIn)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="admin@thespotapp.com"
                {...loginForm.register("email")}
                error={loginForm.formState.errors.email?.message}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                {...loginForm.register("password")}
                error={loginForm.formState.errors.password?.message}
              />
              <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
                Sign In
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
