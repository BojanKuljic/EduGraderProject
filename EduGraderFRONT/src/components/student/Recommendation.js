import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/student/Recommendation.css";
import { toast, ToastContainer } from "react-toastify";

const Recommendation = () => {
  const [uploads, setUploads] = useState([]);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const email = sessionStorage.getItem("email");

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const res = await axios.get(`http://localhost:8845/student/${email}/allUploads`);
         const sortedUploads = res.data.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        setUploads(sortedUploads || []);
      } catch (error) {
        toast.error("Failed to load uploads.");
      }
    };

    fetchUploads();
  }, [email]);

  const handleSelectUpload = async (uploadId) => {
    setSelectedUpload(uploadId);

    if (!uploadId) {
      setRecommendations(null);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:8845/upload/${uploadId}/review`);
      setRecommendations(res.data?.recommendations || "No recommendations found.");
    } catch (error) {
      setRecommendations(null);
      toast.error("No recommendations available for this work.");
    }
  };

  return (
    <div className="recommendation-container">
      <h2>Personalized Recommendations</h2>

      <label>Select an upload:</label>
      <select onChange={(e) => handleSelectUpload(e.target.value)} defaultValue="">
        <option value="" disabled>Select...</option>
        {uploads.map((upload) => (
          <option key={upload.id} value={upload.id}>
            {upload.title} - {upload.course}
          </option>
        ))}
      </select>

      {recommendations && (
        <div className="recommendation-box">
          <h3>Recommended Resources:</h3>
          <p>{recommendations}</p>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={2000} style={{ marginTop: "0px" }} />
    </div>
  );
};

export default Recommendation;
