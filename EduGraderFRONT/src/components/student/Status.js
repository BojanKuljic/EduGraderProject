import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/student/Status.css";
import { ToastContainer, toast } from "react-toastify";

const Status = () => {
    const [uploads, setUploads] = useState([]);
    const [expandedCard, setExpandedCard] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState({});



    const email = sessionStorage.getItem("email");

    useEffect(() => {
        const fetchUploads = async () => {
            try {
                const response = await axios.get(`http://localhost:8845/student/${email}/allUploads`);
                setUploads(response.data);
            } catch (error) {
                toast.error("Failed to load uploads");
            }
        };

        fetchUploads();
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
                console.log("Raw file object:", version?.file);
                return;
            }

            // Ovo je sada čist base64 string (PDF u base64)
            const base64Data = version.file;

            // Pretvori base64 string u bajtove
            const byteCharacters = atob(base64Data);
            const byteNumbers = Array.from(byteCharacters, c => c.charCodeAt(0));
            const byteArray = new Uint8Array(byteNumbers);

            // Napravi Blob i započni download
            const blob = new Blob([byteArray], { type: "application/pdf" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${title}.pdf`;
            link.click();
            toast.success("Download successful!");
        } catch (error) {
            toast.error("Download failed");
            console.error("Download error:", error);
        }
    };





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
        } catch(err) {
             console.error("Upload failed:", err);
            toast.error("Upload failed.");
        }
    };

    const handleRevert = async (uploadId, version) => {
        try {
            await axios.put(`http://localhost:8845/student/changeVersion?uploadId=${uploadId}&verison=${version}`);
            toast.success("Version reverted!");
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

    return (
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
                            <p><strong>Active version:</strong> {upload.activeVersion}</p>
                            <p><strong>Status:</strong> {formatStatus(upload.status)}</p>
                            <p><strong>Upload date:</strong> {formatDate(upload.uploadDate)}</p>
                            <p><strong>Estimated review time:</strong> {formatDate(upload.usualReviewTime)}</p>

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
                                            onChange={(e) => upload.revertVersion = e.target.value} />
                                        <button onClick={() => handleRevert(upload.id, upload.revertVersion)}>Revert</button>
                                    </div>
                                </div>
                            )}


                        </div>
                    ))}
                </div>
            )}
            <ToastContainer
                position="top-center"
                autoClose={2000}
                style={{ marginTop: "0px" }} />
        </div>
    );
};

export default Status;
