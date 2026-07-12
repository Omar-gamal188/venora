import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../Context/AuthContext";

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error("Enter username and password");
      return;
    }
    setLoading(true);
    try {
      const u = await login(username.trim(), password);
      toast.success("Signed in");
      if (u?.role === "admin") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/new-user", { replace: true });
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password || !email.trim() || !fullName.trim()) {
      toast.error("Username, password, email, and full name are required");
      return;
    }
    setLoading(true);
    try {
      await register({
        username: username.trim(),
        password,
        email: email.trim(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      toast.success("Account created");
      navigate("/new-user", { replace: true });
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login" className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-center mb-2">
        {mode === "login" ? "Sign in" : "Create account"}
      </h1>
      <p className="text-center text-gray-500 text-sm mb-8">
        {mode === "login"
          ? "Store owner signs in here; other customers use the same form and go to their account page."
          : "Create a customer account (dashboard access is for the owner only)."}
      </p>

      <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
        <button
          type="button"
          className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${
            mode === "login" ? "bg-white shadow text-[#31859c]" : "text-gray-600"
          }`}
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          type="button"
          className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${
            mode === "register"
              ? "bg-white shadow text-[#31859c]"
              : "text-gray-600"
          }`}
          onClick={() => setMode("register")}
        >
          Register
        </button>
      </div>

      <form
        onSubmit={mode === "login" ? handleLogin : handleRegister}
        className="space-y-4 bg-white border border-gray-100 rounded-2xl shadow-sm p-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>

        {mode === "register" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full name
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 min-h-[72px]"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            className="w-full border rounded-lg px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#31859c] text-white py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Register"}
        </button>
      </form>

      <p className="text-center mt-6 text-sm text-gray-500">
        <Link to="/" className="text-[#31859c] font-medium">
          ← Back to home
        </Link>
      </p>
    </div>
  );
};

export default Login;
