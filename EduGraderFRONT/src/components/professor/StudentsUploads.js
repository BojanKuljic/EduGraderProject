import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/professor/StudentsUploads.css";

function StudentsUploads() {
    const [uploads, setUploads] = useState([]);
    const [expandedCard, setExpandedCard] = useState(null);

    function toggleDetailsSection(uploadId) {
        setExpandedCard((prevId) => (prevId === uploadId ? null : uploadId));
    }


    useEffect(() => {
        const fetchUploads = async () => {
            try {
                const response = await axios.get("http://localhost:8845/professor/allUploads");
                setUploads(response.data);
            } catch (error) {
                console.error("Error fetching uploads:", error);
            }
        };

        fetchUploads();
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

    const formatDate = (dateString) => {
        if (!dateString) return "Not yet estimated";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "Invalid date" : date.toLocaleString();
    };



    return (
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

                            <button className="details-button" onClick={() => toggleDetailsSection(upload.id)}>
                                {expandedCard === upload.id ? "Close Details" : "View Details / Grade"}
                            </button>

                            {expandedCard === upload.id && (
                                <div className="review-details-section">
                                    <h3>Review Details and System Feedback </h3>
                                    <h3 className="grade"
                                        style={{ color: upload.review?.grade <= 5 ? "#c84a4a" : "#35fcad", }}>
                                        <strong>Grade:</strong> {upload.review?.grade ?? "Not graded yet"}</h3>
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
    );

  
}

export default StudentsUploads;
