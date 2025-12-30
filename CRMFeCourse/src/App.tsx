import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { useEffect, useState } from "react";
import { AlertProvider } from "./context/AlertContext";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import Curriculum  from "./pages/Curriculum";
import Pricing from "./pages/PricingCourse";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
// import LoginAccess from './components/auth/LoginAccess';

 
export default function App() {

  //  === TRẠNG THÁI XÁC THỰC QUYỀN XEM TRANG ZOOTOPIA ===
  //  Quyền xem trang với 3 trạng thái: đang kiểm tra, đã xác thực, chưa xác thực
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAccessSession = () => {
      const sessionData = localStorage.getItem("accessSession");
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          const now = new Date().getTime();
          const sessionDuration = 5 * 60 * 1000; // Phiên truy cập hợp lệ trong 50 phút

          if (session.isLoggedIn && (now - session.timestamp < sessionDuration)) {
            setAuthStatus('authenticated'); 
          } else {
            localStorage.removeItem("accessSession"); 
            setAuthStatus('unauthenticated');
          }
        } catch (error) {
          localStorage.removeItem("accessSession"); 
          setAuthStatus('unauthenticated');
          console.error("Error parsing session data:", error);
        }
      } else {
        setAuthStatus('unauthenticated');
      }
    };
    checkAccessSession();
  }, []); // Chạy một lần khi component được mount

  // Chờ kiểm tra phiên hoàn tất
  if (authStatus === 'checking') {
    return 
    <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-600 border-t-transparent">
        </div>
    </div>;
  }
  // if (authStatus === 'unauthenticated') {
  //   return <LoginAccess onLoginSuccess={() => setAuthStatus('authenticated')} />
  // }
  //  === ENDING XỬ LÝ XÁC THỰC ===


  return (
    <>
    <AlertProvider>

      <Router>
        <ScrollToTop />
        <Routes>
                    {/* Dashboard Layout */}
          {/* <Route element={<AppLayout />}></Route> */}

          {/* Public Route: Nếu đã đăng nhập thì đẩy về Home, chưa thì hiện SignIn */}
          <Route path="/signin" element={
            authStatus === 'authenticated' ? <Navigate to="/" /> : <SignIn onSignInSuccess={() => setAuthStatus('authenticated')} />
          } />
          
          <Route path="/signup" element={<SignUp />} />

          {/* Protected Routes: Nếu chưa đăng nhập thì đẩy về SignIn */}
          <Route element={authStatus === 'authenticated' ? <AppLayout /> : <Navigate to="/signin" />}>
            <Route index path="/" element={<Home isLoggedIn={true} />} />                   

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />
            <Route path="/pricing-course" element={<Pricing />} />
            <Route path="/curriculum" element={<Curriculum />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          {/* <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} /> */}

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>

    </AlertProvider>
    </>
  );
}
