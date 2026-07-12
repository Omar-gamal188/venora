import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-10 py-20 text-center text-gray-600">
      Loading…
    </div>
  );
}

/** Any signed-in user (for future use). */
export function ProtectedRoute({ children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return <Loading />;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

/** Only dashboard admin (username matches server config, default omargamal404). */
export function AdminRoute({ children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return <Loading />;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (user.role !== "admin") {
    return <Navigate to="/new-user" replace />;
  }
  return children;
}

/** Signed-in shoppers (not admin) — e.g. after register. */
export function NewUserRoute({ children }) {
  const { user, ready } = useAuth();

  if (!ready) return <Loading />;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
