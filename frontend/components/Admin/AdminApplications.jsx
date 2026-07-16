"use client";
import { useEffect, useState } from "react";
import { hasPermission } from "../utils/permissions";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canEdit = hasPermission("applications", "edit");
  const canDelete = hasPermission("applications", "delete");

  const getAuthHeaders = (jsonHeaders = false) => {
    const token = localStorage.getItem("zmsAdminToken");

    return {
      ...(jsonHeaders ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
    };
  };

  // Convert stored resume path into a full browser-openable URL.
  const getResumeUrl = (resume) => {
    if (!resume) return "";

    if (resume.startsWith("http://") || resume.startsWith("https://")) {
      return resume;
    }

    if (resume.startsWith("/uploads")) {
      return `${API_BASE}${resume}`;
    }

    if (resume.startsWith("uploads")) {
      return `${API_BASE}/${resume}`;
    }

    return resume;
  };

  // Open external link safely.
  const getSafeLink = (url) => {
    if (!url) return "";

    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    return `https://${url}`;
  };

  // Format submitted date.
  const formatDateTime = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fetch all applications from the backend.
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/applications`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load applications");
      }

      setApplications(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Download applications data as an Excel-openable CSV file.
  const handleDownloadExcel = () => {
    if (applications.length === 0) {
      setError("No applications available to download.");
      return;
    }

    const headers = [
      "S.No",
      "Applicant Name",
      "Email",
      "Phone",
      "Position",
      "Experience",
      "Portfolio URL",
      "LinkedIn URL",
      "Cover Letter",
      "Resume Link",
      "Status",
      "Submitted Date",
    ];

    const rows = applications.map((application, index) => [
      index + 1,
      application.fullName || "",
      application.email || "",
      application.phone || "",
      application.jobTitle || "",
      application.experience || "",
      application.portfolioUrl || "",
      application.linkedinUrl || "",
      application.coverLetter || application.message || "",
      getResumeUrl(application.resume),
      application.status || "",
      formatDateTime(application.createdAt),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "zms-job-applications.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // Update application status.
  const handleStatusChange = async (applicationId, status) => {
    try {
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_BASE}/api/applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: getAuthHeaders(true),
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update status");
      }

      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application._id === applicationId
            ? { ...application, status }
            : application
        )
      );

      setMessage(data?.message || "Application status updated successfully.");
    } catch (statusError) {
      setError(statusError.message);
    }
  };

  // Delete one application.
  const handleDelete = async (applicationId) => {
    const confirmed = window.confirm("Delete this application?");

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_BASE}/api/applications/${applicationId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete application");
      }

      setApplications((currentApplications) =>
        currentApplications.filter(
          (application) => application._id !== applicationId
        )
      );

      setMessage(data?.message || "Application deleted successfully.");
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[26px] font-bold text-[#111c2e]">Applications</h1>

        <button
          type="button"
          onClick={handleDownloadExcel}
          className="w-fit rounded-md bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
        >
          Download Excel
        </button>
      </div>

      {(message || error) && (
        <div
          className={`mt-4 rounded-lg border px-4 py-3 text-sm font-medium ${error
            ? "border-red-200 bg-red-50 text-red-600"
            : "border-green-200 bg-green-50 text-green-700"
            }`}
        >
          {error || message}
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full min-w-[1500px] text-left">
          <thead className="bg-[#111c2e] text-white">
            <tr>
              <th className="px-4 py-4 text-sm">S.No</th>
              <th className="px-4 py-4 text-sm">Applicant Name</th>
              <th className="px-4 py-4 text-sm">Email</th>
              <th className="px-4 py-4 text-sm">Phone</th>
              <th className="px-4 py-4 text-sm">Position</th>
              <th className="px-4 py-4 text-sm">Experience</th>
              <th className="px-4 py-4 text-sm">Portfolio</th>
              <th className="px-4 py-4 text-sm">LinkedIn</th>
              <th className="px-4 py-4 text-sm">Cover Letter</th>
              <th className="px-4 py-4 text-sm">Resume</th>
              <th className="px-4 py-4 text-sm">Status</th>
              <th className="px-4 py-4 text-sm">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="12"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Loading applications...
                </td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td
                  colSpan="12"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No applications received yet.
                </td>
              </tr>
            ) : (
              applications.map((application, index) => {
                const resumeUrl = getResumeUrl(application.resume);
                const portfolioUrl = getSafeLink(application.portfolioUrl);
                const linkedinUrl = getSafeLink(application.linkedinUrl);
                const coverLetter =
                  application.coverLetter || application.message || "";

                return (
                  <tr key={application._id} className="border-t border-gray-100">
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {index + 1}
                    </td>

                    <td className="px-4 py-4 text-sm font-semibold text-[#111c2e]">
                      {application.fullName || "-"}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-600">
                      {application.email || "-"}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-600">
                      {application.phone || "-"}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-600">
                      {application.jobTitle || "-"}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-600">
                      {application.experience || "-"}
                    </td>

                    <td className="px-4 py-4">
                      {application.portfolioUrl ? (
                        <a
                          href={portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="whitespace-nowrap rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                        >
                          View Portfolio
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {application.linkedinUrl ? (
                        <a
                          href={linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="whitespace-nowrap rounded-full bg-orange-50 px-4 py-2 text-xs font-bold text-orange-600 transition hover:bg-orange-100"
                        >
                          View LinkedIn
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-600">
                      {coverLetter ? (
                        <span className="block max-w-[220px] truncate">
                          {coverLetter}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {resumeUrl ? (
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="whitespace-nowrap rounded-full bg-orange-50 px-4 py-2 text-xs font-bold text-orange-600 transition hover:bg-orange-100"
                        >
                          View Resume
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {/* RBAC CHANGE: Allow status updates only when applications.edit permission is true. */}
                      {canEdit ? (
                        <select
                          value={application.status}
                          onChange={(event) =>
                            handleStatusChange(
                              application._id,
                              event.target.value
                            )
                          }
                          className="rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-[#111c2e] outline-none"
                        >
                          <option value="New">New</option>
                          <option value="Reviewed">Reviewed</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      ) : (
                        <span className="text-sm text-gray-600">
                          {application.status || "New"}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {/* RBAC CHANGE: Show Delete button only when applications.delete permission is true. */}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(application._id)}
                          className="rounded-full bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminApplications;
