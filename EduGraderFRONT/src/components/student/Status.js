import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/student/Status.css";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Status = () => {
    const [uploads, setUploads] = useState([]);
    const [expandedCard, setExpandedCard] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState({});
    const [revertVersions, setRevertVersions] = useState({});
    const navigate = useNavigate();


    const fetchUploads = async () => {
        try {
            const response = await axios.get(`http://localhost:8845/student/${email}/allUploads`);
            const sortedUploads = response.data.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
            setUploads(sortedUploads);
        } catch (error) {
            toast.error("Failed to load or student does`t uploads");
        }
    };



    const email = sessionStorage.getItem("email");

    useEffect(() => {
        fetchUploads();
        const interval = setInterval(() => {
            fetchUploads();
        }, 2000); // osvežava na svakih 2 sekunde

        return () => clearInterval(interval);
    }, [email]);

    const toggleEditSection = (uploadId) => {
        setExpandedCard(prev => (prev === uploadId ? null : uploadId));
    };

    const handleDownload = async (uploadId, title) => {
        if (!uploadId || uploadId.length !== 24) {
            toast.error("Invalid Upload ID");
            return;
        }

        try {
            const res = await axios.get(`http://localhost:8845/student/getUpload/${uploadId}`);
            const activeVersion = res.data.activeVersion ?? 0;
            const version = res.data.versions?.[activeVersion];

            if (!version || !version.file || typeof version.file !== "string") {
                toast.error("File not available or invalid format.");
                return;
            }

            const base64Data = version.file;
            const fileName = version.fileName || `${title}`;
            const extension = fileName.split('.').pop().toLowerCase();

            const mimeTypes = {
                pdf: "application/pdf",
                doc: "application/msword",
                docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                txt: "text/plain",
                jpg: "image/jpeg",
                jpeg: "image/jpeg",
                png: "image/png",
                gif: "image/gif",
                xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                csv: "text/csv",
                zip: "application/zip"
            };

            const mimeType = mimeTypes[extension] || "application/octet-stream";

            const byteCharacters = atob(base64Data);
            const byteNumbers = Array.from(byteCharacters, c => c.charCodeAt(0));
            const byteArray = new Uint8Array(byteNumbers);

            const blob = new Blob([byteArray], { type: mimeType });

            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();

            toast.success("Download successful!");
        } catch (error) {
            console.err
        }
    }



    const handleUpdate = async (e, uploadId) => {
        const file = e.target.files[0];
        if (!file) {
            toast.error("Please select a file first.");
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        try {
            await axios.put(`http://localhost:8845/student/update?uploadId=${uploadId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }

            });
            toast.success("New version uploaded!");
            setTimeout(() => window.location.reload(), 2000);

        } catch (err) {
            console.error("Upload failed:", err);
            toast.error("Upload failed.");
        }
    };

    const handleRevert = async (uploadId, version) => {
        try {
            await axios.put(`http://localhost:8845/student/changeVersion?uploadId=${uploadId}&verison=${version - 1}`);
            toast.success("Version reverted!");
            fetchUploads();
            setTimeout(() => window.location.reload(), 2000);

        } catch {
            toast.error("Revert failed.");
        }
    };



    const formatStatus = (status) => {
        switch (status) {
            case 0:
                return <span className="status-under-review">Under review</span>;
            case 1:
                return <span className="status-feedback">Feedback ready</span>;
            case 2:
                return <span className="status-rejected">Rejected</span>;
            default:
                return <span>Unknown</span>;
        }
    };


    const formatDate = (dateString) => {
        if (!dateString) return "Not yet estimated";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "Invalid date" : date.toLocaleString();
    };


    const formatReviewTime = (milliseconds) => {
        if (!milliseconds || isNaN(milliseconds)) return "N/A";

        const totalSeconds = Math.floor(milliseconds / 1000);
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        const parts = [];
        if (hrs > 0) parts.push(`${hrs}h`);
        if (mins > 0) parts.push(`${mins}m`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

        return parts.join(" ");
    };



    return (
        <div>
        <div className="status-container">
            <h2>Status of All Student Works </h2>
            {uploads.length === 0 ? (
                <p>No uploads found.</p>
            ) : (
                <div className="status-list">
                    {uploads.map((upload) => (
                        <div key={upload.id} className="status-card">
                            <h3>{upload.title}</h3>
                            <p><strong>Course:</strong> {upload.course}</p>
                            <p><strong>Total versions:</strong> {upload.versions?.length ?? 0}</p>
                            <p><strong>Current Active version:</strong> {upload.activeVersion + 1}</p>
                            <p><strong>Status:</strong> {formatStatus(upload.status)}</p>
                            <p><strong>Upload date:</strong> {formatDate(upload.uploadDate)}</p>
                            <p><strong>Estimated review time:</strong> {formatReviewTime(upload.usualReviewTime)}</p>

                            <button className="status-edit-toggle" onClick={() => toggleEditSection(upload.id)}>
                                {expandedCard === upload.id ? "Close Edit Panel" : "Edit Upload"}
                            </button>

                            {expandedCard === upload.id && (
                                <div className="status-edit-section">
                                    {/* Download */}
                                    <label>Download Current File </label>
                                    <div className="upload-new-version ">
                                        <button onClick={() => handleDownload(upload.id, upload.title)}>Download</button>

                                    </div>

                                    {/* Upload new version */}
                                    <label>Upload New Version</label>
                                    <div className="upload-new-version">
                                        <input
                                            className="upload-input"
                                            type="file"
                                            accept=".pdf,.doc,.docx"

                                            onChange={(e) =>
                                                setSelectedFiles((prev) => ({
                                                    ...prev,
                                                    [upload.id]: e.target.files[0]
                                                }))
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                const fileInputEvent = { target: { files: [selectedFiles[upload.id]] } };
                                                handleUpdate(fileInputEvent, upload.id);
                                            }}
                                        >
                                            Upload
                                        </button>
                                    </div>

                                    {/* Revert version */}
                                    <label>Revert to Version</label>
                                    <div className="revert-version">
                                        <input
                                            type="number"
                                            placeholder="e.g. 1"
                                            value={revertVersions[upload.id] || ""}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (!isNaN(val) && val >= 1 && val <= (upload.versions?.length || 1)) {
                                                    setRevertVersions((prev) => ({
                                                        ...prev,
                                                        [upload.id]: val
                                                    }));
                                                }
                                            }}
                                        />

                                        <button onClick={() => handleRevert(upload.id, revertVersions[upload.id])}>
                                            Revert
                                        </button>

                                    </div>
                                </div>
                            )}


                        </div>
                    ))}
                </div>
            )}
            
        </div>
        <ToastContainer
                position="top-center"
                autoClose={2000}
                style={{ marginTop: "55px" }} />
        </div>
    );
};

export default Status;
