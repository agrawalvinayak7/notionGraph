import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="bg-background flex min-h-full items-center justify-center px-6 py-16">
      <SignUp />
    </div>
  );
}
