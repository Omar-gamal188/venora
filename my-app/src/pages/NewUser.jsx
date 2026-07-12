import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const NewUser = () => {
  const { user, logout } = useAuth();

  return (
    <div id="new-user" className="max-w-lg mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-[#31859c] mb-2">Welcome, {user?.fullName || user?.username}!</h1>
      <p className="text-gray-600 mb-6">
        Your account is active. This is the customer area — the admin dashboard is
        restricted to the store owner account.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/products"
          className="bg-[#31859c] text-white px-6 py-3 rounded-xl font-semibold"
        >
          Browse products
        </Link>
        <Link
          to="/"
          className="border border-gray-300 px-6 py-3 rounded-xl font-semibold"
        >
          Home
        </Link>
        <button
          type="button"
          onClick={logout}
          className="text-gray-600 underline text-sm self-center"
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default NewUser;
