import { UserButton } from "@clerk/react-router";

export const UserButtonWrapper = () => {
  return (
    <UserButton afterSignOutUrl="/" />
  );
};

export default UserButtonWrapper;
