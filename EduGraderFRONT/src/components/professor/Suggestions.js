import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/professor/Suggestions.css";
import { ToastContainer, toast } from "react-toastify";

function Suggestions() {
    const [uploads, setUploads] = useState([]);
    const [selectedUploadId, setSelectedUploadId] = useState(null);
    const [additionalComment, setAdditionalComment] = useState("");
    const [visibleFeedbacks, setVisibleFeedbacks] = useState({});


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

    const toggleFeedback = (uploadId) => {
        setVisibleFeedbacks((prev) => ({
            ...prev,
            [uploadId]: !prev[uploadId],
        }));
    };

    const handleSubmit = async (uploadId) => {
  try {
    if (!additionalComment.trim()) {
      toast.info("Please enter feedback before submitting.");
      return;
    }

    const existingReview = uploads.find((u) => u.id === uploadId)?.review;
    const existingRecommendations = existingReview?.recommendations ?? "";
    const existingProfessorComments = existingRecommendations.match(/Professor's Comment #\d+:/g);
    const nextNumber = (existingProfessorComments?.length || 0) + 1;

    const updatedReview = {
      ...existingReview,
      recommendations: `${existingRecommendations}\n\nProfessor's Comment #${nextNumber}:\n ${additionalComment}`,
    };

    await axios.put(`http://localhost:8845/professor/review?uploadId=${uploadId}`, updatedReview);
    toast.success("Comment added successfully!");
    setAdditionalComment("");
    setSelectedUploadId(null);
  } catch (error) {
    console.error("Error updating review:", error);
    toast.error("Failed to submit comment.");
  }
};


    return (
        <div>
        <div className="suggestions-container">
            <h2>Professor Suggestions</h2>
            {uploads.length === 0 ? (
                <p className="no-data">No uploads found.</p>
            ) : (
                uploads.map((upload) => (
                    <div className="suggestion-list">
                        <div className="suggestion-card" key={upload.id}>
                            <p><strong>Student:</strong> {upload.email}</p>
                            <p><strong>Title:</strong> {upload.title}</p>
                            <button
                                className="ai-toggle-button"
                                onClick={() => toggleFeedback(upload.id)}
                            >
                                {visibleFeedbacks[upload.id] ? "Hide AI Feedback" : "Show AI Feedback"}
                            </button>

                            {visibleFeedbacks[upload.id] && (
                                <>
                                    <p><strong>AI Recommendations:</strong></p>
                                    <pre>{upload.review?.recommendations ?? "No recommendations yet."}</pre>
                                </>
                            )}


                            <label htmlFor={`comment-${upload.id}`}>Add your comment or suggestion:</label>
                            <textarea 
                                id={`comment-${upload.id}`}
                                placeholder="Enter professor's feedback..."
                                value={selectedUploadId === upload.id ? additionalComment : ""}
                                onChange={(e) => {
                                    setSelectedUploadId(upload.id);
                                    setAdditionalComment(e.target.value);
                                }}
                            />

                            <button className="submit-button" onClick={() => handleSubmit(upload.id)}>
                                Submit Comment
                            </button>
                            
                        </div>

                    </div>
                ))
            )}
        </div>
                      <ToastContainer position="top-center" style={{ marginTop: "60px" }} />

        </div> 
    );
}

export default Suggestions;
