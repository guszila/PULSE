import { LoginClient } from "@/components/login-client";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginClient />
      </div>
    </div>
  );
}
