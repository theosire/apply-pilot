// Defines the main frontend routes and protects authenticated pages.

import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Onboarding } from "./pages/auth/Onboarding";
import { Board } from "./pages/Board";

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route 
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        <Route
          path="/board"
          element={
            <ProtectedRoute>
              <Board />
            </ProtectedRoute>
          }
        />

      </Routes>
    </>
  );
}

export default App;