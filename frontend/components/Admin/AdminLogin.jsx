"use client";

// useState stores form input values, loading/error status, and password show/hide status
import { useState } from "react";

// useNavigate redirects admin after successful login
import { useRouter } from "next/navigation";

// API base URL works locally and on Render
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const AdminLogin = () => {
  // navigate moves user to dashboard after login
  const router = useRouter();

  // form stores username and password values
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  // loading disables button while API request is running
  const [loading, setLoading] = useState(false);

  // error stores login error message
  const [error, setError] = useState("");

  // showPassword controls password visible / hidden
  const [showPassword, setShowPassword] = useState(false);

  // handleChange updates form values when user types
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    // Clear old error when user starts typing again
    setError("");
  };

  // handleLogin sends username and password to backend login API
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store token and admin login status in browser
      localStorage.setItem("zmsAdminToken", data.token);
      localStorage.setItem("zmsAdminLogin", "true");
      localStorage.setItem("zmsAdminUser", JSON.stringify(data.user));

      // Redirect to admin dashboard after successful login
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#f5f6fa] flex items-center justify-center px-5 font-['Poppins']">
      <div className="w-full max-w-[420px] rounded-xl bg-white p-7 shadow-xl border border-gray-100">
        <h1 className="font-['Bebas_Neue'] text-[42px] text-center text-[#111c2e] tracking-wide">
          ZMS Admin
        </h1>

        <p className="mt-1 text-center text-sm text-gray-500">
          Login to manage website content
        </p>

        <form onSubmit={handleLogin} className="mt-7 space-y-4">
          {/* Username input */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Username
            </label>

            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
              autoComplete="username"
              className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500"
            />
          </div>

          {/* Password input with show/hide option */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                autoComplete="current-password"
                className="w-full rounded-md border border-gray-300 px-4 py-3 pr-20 text-sm outline-none transition focus:border-orange-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-orange-500 hover:text-orange-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-orange-500 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AdminLogin;