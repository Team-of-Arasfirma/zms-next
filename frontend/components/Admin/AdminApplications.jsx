"use client";

import { useEffect, useState } from "react";
import { hasPermission } from "../utils/permissions";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumeLoadingId, setResumeLoadingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canEdit = hasPermission("applications", "edit");
  const canDelete = hasPermission("applications", "delete");

  const getAuthHeaders = (jsonHeaders = false) => {
    const token = localStorage.getItem("zmsAdminToken");

    return {
      ...(jsonHeaders
        ? {
            "Content-Type": "application/json",
          }
        : {}),
      Authorization: `Bearer ${token}`,
    };
  };

  // Convert stored resume path into a full URL.
  const getResumeUrl = (resume) => {
    if (!resume) {
      return "";
    }

    if (
      resume.startsWith("http://") ||
      resume.startsWith("https://")
    ) {
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

  // Convert optional URLs into safe external links.
  const getSafeLink = (url) => {
    if (!url) {
      return "";
    }

    if (
      url.startsWith("http://") ||
      url.startsWith("https://")
    ) {
      return url;
    }

    return `https://${url}`;
  };

  // Format the submitted date.
  const formatDateTime = (dateValue) => {
    if (!dateValue) {
      return "";
    }

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

  // Detect resume extension from URL or content type.
  const getResumeExtension = (
    resumeUrl,
    contentType = ""
  ) => {
    const cleanUrl = resumeUrl
      .split("?")[0]
      .toLowerCase();

    if (cleanUrl.endsWith(".pdf")) {
      return "pdf";
    }

    if (cleanUrl.endsWith(".docx")) {
      return "docx";
    }

    if (cleanUrl.endsWith(".doc")) {
      return "doc";
    }

    if (contentType.includes("application/pdf")) {
      return "pdf";
    }

    if (contentType.includes("application/msword")) {
      return "doc";
    }

    if (
      contentType.includes(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    ) {
      return "docx";
    }

    // Older resume URLs may not contain an extension.
    return "pdf";
  };

  // Create a readable downloaded resume filename.
  const getResumeFileName = (
    application,
    extension = "pdf"
  ) => {
    const candidateName = (
      application.fullName || "candidate"
    )
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "");

    return `${
      candidateName || "candidate"
    }-resume.${extension}`;
  };

  // Fetch resume file from Cloudinary or backend.
  const fetchResumeBlob = async (resumeUrl) => {
    const response = await fetch(resumeUrl);

    if (!response.ok) {
      throw new Error(
        `Resume request failed with status ${response.status}`
      );
    }

    const originalBlob = await response.blob();

    const responseContentType =
      response.headers.get("content-type") ||
      originalBlob.type ||
      "";

    const extension = getResumeExtension(
      resumeUrl,
      responseContentType
    );

    let finalContentType = responseContentType;

    if (
      !finalContentType ||
      finalContentType.includes(
        "application/octet-stream"
      )
    ) {
      if (extension === "pdf") {
        finalContentType = "application/pdf";
      }

      if (extension === "doc") {
        finalContentType = "application/msword";
      }

      if (extension === "docx") {
        finalContentType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      }
    }

    const normalizedBlob = new Blob(
      [await originalBlob.arrayBuffer()],
      {
        type:
          finalContentType ||
          "application/octet-stream",
      }
    );

    return {
      blob: normalizedBlob,
      extension,
      contentType: finalContentType,
    };
  };

  // Open PDF resume in a new browser tab.
  // DOC and DOCX files will be downloaded instead.
  const handleViewResume = async (application) => {
    const resumeUrl = getResumeUrl(
      application.resume
    );

    if (!resumeUrl) {
      setError("Resume URL is unavailable.");
      return;
    }

    setMessage("");
    setError("");
    setResumeLoadingId(application._id);

    // Open immediately to prevent popup blocking.
    const previewWindow = window.open("", "_blank");

    if (!previewWindow) {
      setResumeLoadingId("");

      setError(
        "Browser blocked the resume preview. Please allow popups for this website."
      );

      return;
    }

    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Loading Resume...</title>
          <style>
            body {
              margin: 0;
              display: flex;
              min-height: 100vh;
              align-items: center;
              justify-content: center;
              font-family: Arial, sans-serif;
              background: #f7f7f7;
            }
          </style>
        </head>

        <body>
          <p>Loading resume...</p>
        </body>
      </html>
    `);

    previewWindow.document.close();

    try {
      const {
        blob,
        extension,
        contentType,
      } = await fetchResumeBlob(resumeUrl);

      const isPdf =
        extension === "pdf" ||
        contentType.includes("application/pdf");

      // Browsers cannot reliably preview Word files.
      if (!isPdf) {
        previewWindow.close();

        const objectUrl =
          URL.createObjectURL(blob);

        const link =
          document.createElement("a");

        link.href = objectUrl;
        link.download = getResumeFileName(
          application,
          extension
        );

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => {
          URL.revokeObjectURL(objectUrl);
        }, 1000);

        setMessage(
          "Word documents cannot be previewed directly, so the resume was downloaded."
        );

        return;
      }

      // Force the correct PDF content type.
      const pdfBlob = new Blob(
        [await blob.arrayBuffer()],
        {
          type: "application/pdf",
        }
      );

      const objectUrl =
        URL.createObjectURL(pdfBlob);

      previewWindow.location.replace(objectUrl);

      // Keep the URL alive while the PDF viewer loads.
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 5 * 60 * 1000);
    } catch (viewError) {
      previewWindow.close();

      setError(
        viewError instanceof Error
          ? viewError.message
          : "Failed to open resume"
      );
    } finally {
      setResumeLoadingId("");
    }
  };

  // Download resume with proper filename and extension.
  const handleDownloadResume = async (
    application
  ) => {
    const resumeUrl = getResumeUrl(
      application.resume
    );

    if (!resumeUrl) {
      setError("Resume URL is unavailable.");
      return;
    }

    setMessage("");
    setError("");
    setResumeLoadingId(application._id);

    try {
      const { blob, extension } =
        await fetchResumeBlob(resumeUrl);

      const objectUrl =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = objectUrl;
      link.download = getResumeFileName(
        application,
        extension
      );

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 1000);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Resume download failed"
      );
    } finally {
      setResumeLoadingId("");
    }
  };

  // Fetch all applications.
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/applications`,
        {
          headers: getAuthHeaders(),
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to load applications"
        );
      }

      setApplications(
        Array.isArray(data) ? data : []
      );
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load applications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Download applications as CSV.
  const handleDownloadExcel = () => {
    if (applications.length === 0) {
      setError(
        "No applications available to download."
      );

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

    const rows = applications.map(
      (application, index) => [
        index + 1,
        application.fullName || "",
        application.email || "",
        application.phone || "",
        application.jobTitle || "",
        application.experience || "",
        application.portfolioUrl || "",
        application.linkedinUrl || "",
        application.coverLetter ||
          application.message ||
          "",
        getResumeUrl(application.resume),
        application.status || "",
        formatDateTime(application.createdAt),
      ]
    );

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replaceAll(
                '"',
                '""'
              )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "zms-job-applications.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  // Update application status.
  const handleStatusChange = async (
    applicationId,
    status
  ) => {
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
        throw new Error(
          data?.message ||
            "Failed to update status"
        );
      }

      setApplications(
        (currentApplications) =>
          currentApplications.map(
            (application) =>
              application._id === applicationId
                ? {
                    ...application,
                    status,
                  }
                : application
          )
      );

      setMessage(
        data?.message ||
          "Application status updated successfully."
      );
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Failed to update status"
      );
    }
  };

  // Delete one application.
  const handleDelete = async (
    applicationId
  ) => {
    const confirmed = window.confirm(
      "Delete this application?"
    );

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
        throw new Error(
          data?.message ||
            "Failed to delete application"
        );
      }

      setApplications(
        (currentApplications) =>
          currentApplications.filter(
            (application) =>
              application._id !==
              applicationId
          )
      );

      setMessage(
        data?.message ||
          "Application deleted successfully."
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete application"
      );
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[26px] font-bold text-[#111c2e]">
          Applications
        </h1>

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
          className={`mt-4 rounded-lg border px-4 py-3 text-sm font-medium ${
            error
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {error || message}
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full min-w-[1600px] text-left">
          <thead className="bg-[#111c2e] text-white">
            <tr>
              <th className="px-4 py-4 text-sm">
                S.No
              </th>

              <th className="px-4 py-4 text-sm">
                Applicant Name
              </th>

              <th className="px-4 py-4 text-sm">
                Email
              </th>

              <th className="px-4 py-4 text-sm">
                Phone
              </th>

              <th className="px-4 py-4 text-sm">
                Position
              </th>

              <th className="px-4 py-4 text-sm">
                Experience
              </th>

              <th className="px-4 py-4 text-sm">
                Portfolio
              </th>

              <th className="px-4 py-4 text-sm">
                LinkedIn
              </th>

              <th className="px-4 py-4 text-sm">
                Cover Letter
              </th>

              <th className="px-4 py-4 text-sm">
                Resume
              </th>

              <th className="px-4 py-4 text-sm">
                Status
              </th>

              <th className="px-4 py-4 text-sm">
                Action
              </th>
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
              applications.map(
                (application, index) => {
                  const portfolioUrl =
                    getSafeLink(
                      application.portfolioUrl
                    );

                  const linkedinUrl =
                    getSafeLink(
                      application.linkedinUrl
                    );

                  const coverLetter =
                    application.coverLetter ||
                    application.message ||
                    "";

                  const isResumeLoading =
                    resumeLoadingId ===
                    application._id;

                  return (
                    <tr
                      key={application._id}
                      className="border-t border-gray-100"
                    >
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {index + 1}
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-[#111c2e]">
                        {application.fullName ||
                          "-"}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {application.email ||
                          "-"}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {application.phone ||
                          "-"}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {application.jobTitle ||
                          "-"}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {application.experience ||
                          "-"}
                      </td>

                      <td className="px-4 py-4">
                        {application.portfolioUrl ? (
                          <a
                            href={portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="whitespace-nowrap rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                          >
                            View Portfolio
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">
                            -
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {application.linkedinUrl ? (
                          <a
                            href={linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="whitespace-nowrap rounded-full bg-orange-50 px-4 py-2 text-xs font-bold text-orange-600 transition hover:bg-orange-100"
                          >
                            View LinkedIn
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">
                            -
                          </span>
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
                        {application.resume ? (
                          <div className="flex min-w-[190px] flex-col gap-2">
                            <button
                              type="button"
                              disabled={
                                isResumeLoading
                              }
                              onClick={() =>
                                handleViewResume(
                                  application
                                )
                              }
                              className="whitespace-nowrap rounded-full bg-orange-50 px-4 py-2 text-xs font-bold text-orange-600 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isResumeLoading
                                ? "Loading..."
                                : "View Resume"}
                            </button>

                            <button
                              type="button"
                              disabled={
                                isResumeLoading
                              }
                              onClick={() =>
                                handleDownloadResume(
                                  application
                                )
                              }
                              className="whitespace-nowrap rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Download
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            -
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {canEdit ? (
                          <select
                            value={
                              application.status ||
                              "New"
                            }
                            onChange={(event) =>
                              handleStatusChange(
                                application._id,
                                event.target.value
                              )
                            }
                            className="rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-[#111c2e] outline-none"
                          >
                            <option value="New">
                              New
                            </option>

                            <option value="Reviewed">
                              Reviewed
                            </option>

                            <option value="Shortlisted">
                              Shortlisted
                            </option>

                            <option value="Rejected">
                              Rejected
                            </option>
                          </select>
                        ) : (
                          <span className="text-sm text-gray-600">
                            {application.status ||
                              "New"}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                application._id
                              )
                            }
                            className="rounded-full bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                }
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminApplications;