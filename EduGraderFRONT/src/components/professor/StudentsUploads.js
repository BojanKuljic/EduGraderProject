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
                            <p><strong>Status:</strong> {upload.status}</p>
                            <p><strong>Upload Date:</strong> {new Date(upload.uploadDate).toLocaleDateString()}</p>
                           
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

    function handleDetails(upload) {
        console.log("Selected upload:", upload);
        // TODO: Add modal for grading/review details
    }
}

export default StudentsUploads;
