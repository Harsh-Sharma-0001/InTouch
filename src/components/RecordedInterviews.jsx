import React, { useEffect, useState } from "react";

// Assume isAdmin is available (replace with real auth context in production)
const isAdmin = true;

const RecordedInterviews = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [selectedInterviewId, setSelectedInterviewId] = useState("");
  const [file, setFile] = useState(null);

  const fetchRecordings = () => {
    setLoading(true);
    fetch("/api/interviews")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch recordings");
        return res.json();
      })
      .then((data) => {
        setRecordings(data.filter((i) => i.recordingUrl && i.recordingUrl !== ""));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this recording?")) return;
    await fetch(`/api/interviews/${id}/recording`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    fetchRecordings();
  };

  const handleDownload = (id) => {
    window.open(`/api/interviews/${id}/recording/download`, "_blank");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedInterviewId || !file) return;
    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("recording", file);
    await fetch(`/api/interviews/${selectedInterviewId}/recording`, {
      method: "POST",
      credentials: "include",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Upload failed");
        return res.json();
      })
      .then(() => {
        setFile(null);
        setSelectedInterviewId("");
        fetchRecordings();
      })
      .catch((err) => setUploadError(err.message))
      .finally(() => setUploading(false));
  };

  if (loading) {
    return (
      <div className="bg-dark-card rounded-lg p-6 border border-border-color">
        <h3 className="text-lg font-semibold mb-2">Recorded Interviews</h3>
        <p className="text-gray-text text-sm mb-6">Loading recordings...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-dark-card rounded-lg p-6 border border-border-color">
        <h3 className="text-lg font-semibold mb-2">Recorded Interviews</h3>
        <p className="text-red-500 text-sm mb-6">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-dark-card rounded-lg p-6 border border-border-color">
      <h3 className="text-lg font-semibold mb-2">Recorded Interviews</h3>
      <p className="text-gray-text text-sm mb-6">Browse past interview sessions and their recordings</p>
      {isAdmin && (
        <form className="mb-6 flex flex-col md:flex-row gap-2 items-center" onSubmit={handleUpload}>
          <select
            className="bg-dark-lighter border border-border-color rounded px-2 py-1 text-sm"
            value={selectedInterviewId}
            onChange={(e) => setSelectedInterviewId(e.target.value)}
            required
          >
            <option value="">Select Interview</option>
            {recordings.map((rec) => (
              <option key={rec._id} value={rec._id}>
                {rec.title} ({rec.candidate})
              </option>
            ))}
          </select>
          <input
            type="file"
            accept="video/*,audio/*"
            className="text-sm"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
          <button
            type="submit"
            className="bg-primary text-white rounded px-4 py-1 text-sm disabled:opacity-60"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Recording"}
          </button>
          {uploadError && <span className="text-red-500 text-xs ml-2">{uploadError}</span>}
        </form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recordings.length === 0 ? (
          <div className="col-span-full text-gray-text text-center py-8">No recordings found.</div>
        ) : (
          recordings.map((rec, index) => {
            let date = "-";
            if (rec.time) {
              const d = new Date(rec.time);
              date = d.toLocaleDateString();
            }
            return (
              <div
                key={rec._id || index}
                className="bg-dark-lighter rounded-lg overflow-hidden border border-border-color hover:border-primary/50 transition-colors cursor-pointer group"
                title="View Recording"
              >
            <div className="relative">
              <img
                    src={rec.thumbnail || `https://placehold.co/300x180/333333/FFFFFF?text=No+Image`}
                    alt={rec.title}
                className="w-full h-32 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://placehold.co/300x180/333333/FFFFFF?text=No+Image`;
                    }}
                    onClick={() => window.open(rec.recordingUrl, "_blank")}
                    style={{ cursor: "pointer" }}
              />
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {rec.duration}
                  </div>
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="bg-red-600 text-white rounded px-2 py-1 text-xs"
                        onClick={() => handleDelete(rec._id)}
                        title="Delete Recording"
                        type="button"
                      >
                        Delete
                      </button>
                      <button
                        className="bg-blue-600 text-white rounded px-2 py-1 text-xs"
                        onClick={() => handleDownload(rec._id)}
                        title="Download Recording"
                        type="button"
                      >
                        Download
                      </button>
              </div>
                  )}
            </div>
            <div className="p-4">
                  <h4 className="font-medium text-sm mb-1 text-white">{rec.title}</h4>
                  <p className="text-gray-text text-xs">{date}</p>
            </div>
          </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecordedInterviews;
