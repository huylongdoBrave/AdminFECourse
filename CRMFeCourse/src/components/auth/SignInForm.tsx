import { useState, useCallback, memo } from "react";
import { Link } from "react-router"; // Hoặc react-router-dom tùy version
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
// Giả sử các component này chưa được memo ở file gốc, ta memo tại đây để an toàn
import OriginalInput from "../form/input/InputField";
import OriginalCheckbox from "../form/input/Checkbox";

const Input = memo(OriginalInput);
const Checkbox = memo(OriginalCheckbox);

interface SignInFormProps {
  onLoginSuccess: () => void;
}

const SignIn: React.FC<SignInFormProps> = ({ onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const CORRECT_PASSWORD = "123123estuary";

  // Thêm onLoginSuccess vào dependency array
  const handleLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (password === CORRECT_PASSWORD) {
      setError("");
      
      const session = {
        isLoggedIn: true,
        timestamp: new Date().getTime(),
      };
      localStorage.setItem("accessSession", JSON.stringify(session));

      onLoginSuccess(); 
      
    } else {
      setError("Mật khẩu không đúng.");
    }
  }, [password, onLoginSuccess]); 


  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleCheckboxChange = useCallback((checked: boolean) => {
    setIsChecked(checked);
  }, []);

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Trở về Dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Xin chào Long
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
             Đăng nhập Admin FE Course
            </p>
          </div>
          
          {/* ... Phần Social Login giữ nguyên ... */}

          <form onSubmit={handleLogin}>
            <div className="space-y-6">
              <div>
                <Label>
                  Email <span className="text-error-500">*</span>
                </Label>
                {/* Input tĩnh -> Memo sẽ chặn render */}
                <Input disabled placeholder="AdminLong@gmail.com" />
              </div>
              <div>
                <Label>
                  Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Điền mật khẩu"
                    value={password}
                    onChange={handlePasswordChange} // Hàm đã useCallback
                  />
                  <span
                    onClick={toggleShowPassword} // Hàm đã useCallback
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
                    {error && (
                      <p className="text-red-500 text-sm mt-4 mb-2">{error}</p>
                    )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={isChecked} 
                    onChange={handleCheckboxChange} // Hàm đã useCallback
                  />
                  <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                    Ghi nhớ
                  </span>
                </div>
                <Link
                  to="/reset-password"
                  className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full btn btn-primary" // Class ví dụ
                >
                  Đăng nhập
                </button>
              </div>
            </div>
          </form>

          <div className="mt-5">
             {/* ... Link Sign up ... */}
          </div>
           
        </div>
      </div>
    </div>
  );
}

// 6. Export Memoized Component (Tối ưu khi App.tsx re-render)
export default memo(SignIn);