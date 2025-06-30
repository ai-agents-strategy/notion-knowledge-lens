import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <SignUp routing="path" path="/sign-up" />
    </div>
  );
};

export default SignUpPage;
