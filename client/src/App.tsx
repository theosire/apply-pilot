// Defines the main frontend routes and protects authenticated pages.

import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicOnlyRoute } from "./components/PublicOnlyRoute";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { Onboarding } from "./pages/auth/Onboarding";
import { Board } from "./pages/Board";
import { Profile } from "./pages/Profile";
import { ErrorPage } from "./pages/errors/ErrorPage";

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route 
          path="/login" 
          element={
            <PublicOnlyRoute redirectTo="/board">
              <Login />
            </PublicOnlyRoute>
          } 
        />

        <Route 
          path="/register" 
          element={
            <PublicOnlyRoute redirectTo="/onboarding">
              <Register />
            </PublicOnlyRoute>
          } />

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

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/400" 
          element={
            <ErrorPage 
              code="400"
              title="Bad Request"
              message="Something about the request was invalid."
              actionLabel="Back to board"
              actionTo="/board"
            />
          } 
        />

        <Route 
          path="/500" 
          element={
            <ErrorPage 
              code="500"
              title="Server Error"
              message="Something went wrong on our side. Please try again later."
              actionLabel="Back to board"
              actionTo="/board"
            />
          } 
        />

        <Route 
          path="*" 
          element={
            <ErrorPage 
              code="404"
              title="Page Not Found"
              message="The page you are looking for does not exist."
              actionLabel="Back to login"
              actionTo="/login"
            />
          } 
        />
      </Routes>
    </>
  );
}

export default App;