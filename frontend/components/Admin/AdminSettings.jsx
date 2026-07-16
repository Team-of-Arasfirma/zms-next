"use client";

const AdminSettings = () => {
  return (
    <div>
      <h1 className="text-[26px] font-bold text-[#111c2e]">Settings</h1>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-[#111c2e]">
          Website Common Settings
        </h2>

        <form className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <input
            type="text"
            placeholder="Company Name"
            className="rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-orange-500"
          />

          <input
            type="text"
            placeholder="Phone Number"
            className="rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-orange-500"
          />

          <input
            type="email"
            placeholder="Email"
            className="rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-orange-500"
          />

          <input
            type="text"
            placeholder="WhatsApp Number"
            className="rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-orange-500"
          />

          <textarea
            placeholder="Address"
            rows="4"
            className="md:col-span-2 rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-orange-500"
          ></textarea>

          <button
            type="button"
            className="md:col-span-2 w-fit rounded-md bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600 transition"
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;