"use client";

import { useAuthState } from "@/hooks/useAuth";

function BellIcon() {
  return (
    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}
function SignOutIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}

export default function Header() {
  const { user, signOut } = useAuthState();

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "AD";

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="h-16 border-b flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30"
      style={{ backgroundColor: "#FDFDC9", borderColor: "#EFEFEF" }}>
      {/* Spacer for mobile hamburger */}
      <div className="lg:hidden w-10" />

      {/* Greeting */}
      <div className="hidden lg:block">
        <p className="text-sm font-semibold" style={{ color: "#9B6DAE" }}>
          {greeting()},{" "}
          <span style={{ color: "#C69FD5" }}>
            {user?.email?.split("@")[0] ?? "Admin"}
          </span>
        </p>
        <p className="text-xs mt-0.5" style={{ color: "#B8A9D1" }}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long", month: "long", day: "numeric",
          })}
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          className="relative h-9 w-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ backgroundColor: "#F5EEF8", color: "#9B6DAE", border: "1px solid #E8D5F0" }}
        >
          <BellIcon />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
            style={{ backgroundColor: "#E8879C" }} />
        </button>

        <div className="h-6 w-px hidden sm:block" style={{ backgroundColor: "#EFEFEF" }} />

        {/* User avatar + info */}
        <div className="flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #C69FD5, #9B6DAE)" }}
          >
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold leading-tight" style={{ color: "#2E2E2E" }}>
              {user?.email?.split("@")[0] ?? "Admin"}
            </p>
            <p className="text-[10px]" style={{ color: "#B8A9D1" }}>Administrator</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={signOut}
          className="h-8 w-8 rounded-xl flex items-center justify-center transition-all"
          style={{ backgroundColor: "#F5EEF8", color: "#9B6DAE", border: "1px solid #E8D5F0" }}
          title="Sign out"
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "#F2C4CE";
            (e.currentTarget as HTMLElement).style.color = "#E8879C";
            (e.currentTarget as HTMLElement).style.borderColor = "#F2C4CE";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "#F5EEF8";
            (e.currentTarget as HTMLElement).style.color = "#9B6DAE";
            (e.currentTarget as HTMLElement).style.borderColor = "#E8D5F0";
          }}
        >
          <SignOutIcon />
        </button>
      </div>
    </header>
  );
}
