import { BrowserRouter, Route, Routes } from "react-router-dom";
import BoardPage from "./features/board/BoardPage";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import ApplicationDetail from "./features/applications/ApplicationDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Board (Dashboard) */}
        <Route index element={<BoardPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Application Detail View */}
        <Route path="/applications/:id" element={<ApplicationDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
