import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/student/Review.css";
import { toast, ToastContainer } from "react-toastify";

const Review = () => {
  const [uploads, setUploads] = useState([]);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [review, setReview] = useState(null);
  const email = sessionStorage.getItem("email");

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const res = await axios.get(`http://localhost:8845/student/${email}/allUploads`);
        setUploads(res.data || []);
      } catch (error) {
        toast.error("Failed to fetch uploads.");
      }
    };

    fetchUploads();
  }, [email]);

  const handleSelectUpload = async (uploadId) => {
    setSelectedUpload(uploadId);

      if (!uploadId) {
    setReview(null); // sakrij prethodni prikaz review-a
    return;
  }
    try {
      const res = await axios.get(`http://localhost:8845/upload/${uploadId}/review`);
      setReview(res.data);
    } catch (error) {
      setReview(null);
      toast.error("Review not available for this upload.");
    }
  };

  return (
    <div className="review-container">
      <h2>Review Feedback</h2>

          <label>Select an upload:</label>
          <select
              value={selectedUpload || " "}
              onChange={(e) => handleSelectUpload(e.target.value)}
          >
              <option value="" disabled>Select...</option>
              {uploads.map((upload) => (
                  <option key={upload.id} value={upload.id}>
                      {upload.title} - {upload.course}
                  </option>
              ))}
          </select>

          {review && (
              <div className="review-details">
          <h3>Grade: <span className="grade">{review.grade}</span></h3>
          <div className="review-section">
            <h4>Errors</h4>
            <p>{review.errors || "No errors reported."}</p>
          </div>
          <div className="review-section">
            <h4>Improvements</h4>
            <p>{review.improvements || "No suggestions for improvements."}</p>
          </div>
          <div className="review-section">
            <h4>Recommendations</h4>
            <p>{review.recommendations || "No recommendations provided."}</p>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={2000} style={{ marginTop: "80px" }} />
    </div>
  );
};

export default Review;
