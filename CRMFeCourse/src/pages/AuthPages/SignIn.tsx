import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
 

interface SignInProps {
  onSignInSuccess?: () => void;
}

export default function SignIn({ onSignInSuccess }: SignInProps) {

  return (
    <>
      <PageMeta
        title="React.js SignIn Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js SignIn Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <AuthLayout>
        {/* <SignInForm onLoginSuccess={()=> []} /> */}
        <SignInForm onLoginSuccess={onSignInSuccess || (() => {})} />
      </AuthLayout>
    </>
  );
}
