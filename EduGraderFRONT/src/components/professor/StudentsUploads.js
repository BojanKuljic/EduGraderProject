import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/professor/StudentsUploads.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function StudentsUploads() {
    const [uploads, setUploads] = useState([]);
    const [expandedCard, setExpandedCard] = useState(null);
    const [editMode, setEditMode] = useState(null);
    const [newGrade, setNewGrade] = useState("");

    function toggleDetailsSection(uploadId) {
        setExpandedCard((prevId) => {
            const isSame = prevId === uploadId;
            if (isSame) {
                setEditMode(null);
                setNewGrade("");
            }
            return isSame ? null : uploadId;
        });
    }


    const fetchUploads = async () => {
        try {
            const response = await axios.get("http://localhost:8845/professor/allUploads");
            const sortedUploads = response.data.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
            setUploads(sortedUploads);
        } catch (error) {
            console.error("Error fetching uploads:", error);
        }
    };

    useEffect(() => {
        fetchUploads();
        const interval = setInterval(fetchUploads, 2000);
        return () => clearInterval(interval);
    }, []);

    const formatStatus = (status) => {
        switch (status) {
            case 0:
                return <span className="status-under-review"> Pending analysis</span>;
            case 1:
                return <span className="status-feedback">Analized</span>;
            case 2:
                return <span className="status-rejected">Improvment needed</span>;
            default:
                return <span>Unknown</span>;
        }
    };

    const handleConfirmGrade = async (uploadId, grade) => {
        if (grade === undefined || grade === null) {
            toast.error("Grade is not VALID to confirm.");
            return;
        }
        toast.success("Professor approved system grade");
    };

    const handleSaveEditedGrade = async (uploadId) => {
        const parsedGrade = parseFloat(newGrade);
        if (isNaN(parsedGrade) || parsedGrade < 5 || parsedGrade > 10) {
            toast.error("Grade must be between 5 and 10");
            return;
        }

        try {
            await axios.put(`http://localhost:8845/professor/updateGrade/${uploadId}`, { grade: parsedGrade });
            toast.success("Professor updated student's grade");
            setEditMode(null);
            setNewGrade("");
            fetchUploads();
        } catch (error) {
            console.error("Error updating grade:", error);
            toast.error("Failed to update grade");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Not yet estimated";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "Invalid date" : date.toLocaleString();
    };

    const handleDownload = async (uploadId, title) => {
        if (!uploadId || uploadId.length !== 24) {
            alert("Invalid Upload ID");
            return;
        }

        try {
            const res = await axios.get(`http://localhost:8845/student/getUpload/${uploadId}`);
            const activeVersion = res.data.activeVersion ?? 0;
            const version = res.data.versions?.[activeVersion];

            if (!version || !version.file || typeof version.file !== "string") {
                alert("File not available or invalid format.");
                return;
            }

            const base64Data = version.file;
            const fileName = version.fileName || `${title}`;
            const extension = fileName.split('.').pop().toLowerCase();

            // Mapiranje ekstenzija na MIME tipove
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

            const mimeType = mimeTypes[extension] || "application/octet-stream"; // default 
            const byteCharacters = atob(base64Data);
            const byteNumbers = Array.from(byteCharacters, c => c.charCodeAt(0));
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
        } catch (error) {
            console.error("Download failed", error);
            alert("Download failed");
        }
    };


    return (
        <div>
            <div className="students-uploads-container">
                <h2>Student Uploads Overview</h2>
                {uploads.length === 0 ? (
                    <p className="no-uploads-message">No uploads available.</p>
                ) : (
                    <div className="uploads-list">
                        {uploads.map((upload) => (
                            <div className="upload-card" key={upload.UploadId}>
                                <p><strong>Student:</strong> {upload.email}</p>
                                <p><strong>Title:</strong> {upload.title}</p>
                                <p><strong>Course:</strong> {upload.course}</p>
                                <p><strong>Status:</strong> {formatStatus(upload.status)}</p>
                                <p><strong>Upload Date:</strong>  {formatDate(upload.uploadDate)}</p>
                                <button className="details-button" onClick={() => handleDownload(upload.id, upload.title)}> Download </button>
                                <span></span>
                                <button className="details-button" onClick={() => toggleDetailsSection(upload.id)}>
                                    {expandedCard === upload.id ? "Close Details" : "View Details"}
                                </button>
                                {expandedCard === upload.id && (
                                    <div className="review-details-section">
                                        <h3>Review Details and System Feedback </h3>
                                        <h3 className="grade"
                                            style={{
                                                color:
                                                    upload.review?.grade === undefined
                                                        ? "#b39802ff"
                                                        : upload.review.grade <= 5
                                                            ? "#c84a4a"
                                                            : "#35fcad",
                                            }}>
                                            <strong>Grade:</strong> {upload.review?.grade ?? "Not graded yet"}
                                        </h3>
                                        <div className="grade-actions">
                                            {editMode === upload.id ? (
                                                <>
                                                    <input type="number" min="5" max="10" step="1" value={newGrade}
                                                        onChange={(e) => setNewGrade(e.target.value)} placeholder="Enter new grade" className="grade-input" />
                                                    <button className="details-button button-edit" onClick={() => handleSaveEditedGrade(upload.id)}>Save</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="details-button button-accept" onClick={() => handleConfirmGrade(upload.id, upload.review?.grade)}>Accept</button>
                                                    <button className="details-button button-edit" onClick={() => { setEditMode(upload.id); setNewGrade(upload.review?.grade ?? ""); }}>Edit</button>
                                                </>
                                            )}
                                        </div>

                                        <p><strong>Errors:</strong></p>
                                        <pre>{upload.review?.errors ?? "No errors provided."}</pre>

                                        <p><strong>Improvements:</strong></p>
                                        <pre>{upload.review?.improvements ?? "No improvements listed."}</pre>

                                        <p><strong>Recommendations:</strong></p>
                                        <pre>{upload.review?.recommendations ?? "No recommendations available."}</pre>

                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <ToastContainer position="top-center" autoClose={2000} style={{ marginTop: "60px" }} />
        </div>
    );
}

export default StudentsUploads;
