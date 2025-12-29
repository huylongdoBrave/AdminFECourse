import React, { useState } from "react";

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const CORRECT_PASSWORD = "123123estuary";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn form submit và tải lại trang

    if (password === CORRECT_PASSWORD) {
      setError("");
      const session = { // Lưu thông tin phiên đăng nhập vào localStorage
        isLoggedIn: true,
        timestamp: new Date().getTime(), // Lưu thời điểm đăng nhập
      };
      localStorage.setItem("accessSession", JSON.stringify(session));

      onLoginSuccess();
    } else {
      setError("Mật khẩu không đúng.");
    }
  };


  return (
    <div className="fixed inset-0 bg-linear-to-b from-[rgb(125,126,119)] to-[rgb(147,126,206)] z-1000 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-md text-center">

        {/* Form đăng nhập */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border-2 border-white">
          <h1 className="text-2xl font-bold text-[#0e93d1] mb-2">
            Form đăng nhập Admin 
          </h1>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              className="w-full px-4 py-3 mb-4 text-lg border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-[#c3ee7f] focus:border-transparent outline-none transition"
            />

            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            <button
              type="submit"
              className="w-full h-14 text-xl"
            >
              Truy Cập
            </button>
          </form>
        </div>

        <p className="mt-8 text-white/70 text-sm">
          &copy; {new Date().getFullYear()} HL EstuarySolutions
        </p>
      </div>
    </div>
  );
};

export default Login;
