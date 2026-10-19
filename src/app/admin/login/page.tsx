import LoginForm from "@/components/Admin/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-5">
      <div aria-hidden className="absolute inset-0 bg-grid" />
      <div aria-hidden className="absolute top-1/4 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />
      <LoginForm />
    </main>
  );
}
