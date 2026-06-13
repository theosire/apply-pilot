import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type PublicOnlyRouteProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

export const PublicOnlyRoute = ({
  children,
  redirectTo = "/board",
}: PublicOnlyRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) return <Navigate to={redirectTo} replace />;

  return children;
};