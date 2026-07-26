// app/login-error/page.tsx
import { Suspense } from "react";
import LoginErrorContent from "./login-error-content";

export default function LoginErrorPage() {
  return (
    <Suspense fallback={null}>
      <LoginErrorContent />
    </Suspense>
  );
}