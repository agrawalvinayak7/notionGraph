import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="bg-observatory flex min-h-full items-center justify-center px-6 py-16">
      <SignIn />
    </div>
  );
}
