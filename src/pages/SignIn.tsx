import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <SignIn 
        path="/sign-in" 
        routing="path" 
        signUpUrl="/sign-up" 
        afterSignInUrl="/"
        afterSignUpUrl="/"
        redirectUrl="/"
      />
    </div>
  );
};

export default SignInPage;
