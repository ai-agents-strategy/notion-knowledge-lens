
import { CreateOrganization } from "@clerk/clerk-react";

const Onboarding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome!</h1>
          <p className="text-gray-600">Create your organization to get started</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <CreateOrganization 
            appearance={{
              elements: {
                card: "shadow-none border-none bg-transparent",
                headerTitle: "text-xl font-bold text-gray-900",
                headerSubtitle: "text-gray-600",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                footerActionLink: "text-blue-600 hover:text-blue-700"
              }
            }}
            afterCreateOrganizationUrl="/"
          />
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
