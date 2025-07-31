import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/student/Progress.css";
import { toast } from "react-toastify";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Progress = () => {
  const [progress, setProgress] = useState(null);
  const [gradeHistory, setGradeHistory] = useState([]);
  const email = sessionStorage.getItem("email");

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await axios.get(`http://localhost:8845/student/${email}/progress`);
        setProgress(res.data);
      } catch {
        toast.error("Failed to load progress data.");
      }
    };

    const fetchGradeHistory = async () => {
      try {
        const res = await axios.get(`http://localhost:8845/student/${email}/allUploads`);
        const uploads = res.data || [];

        const graded = uploads
          .filter(u => u.review && u.review.grade && u.uploadDate)
          .map(u => ({
            date: new Date(u.uploadDate).toLocaleDateString("en-GB"),
            grade: u.review.grade
          }));

        setGradeHistory(graded);
      } catch {
        toast.error("Failed to load grade history.");
      }
    };

    fetchProgress();
    fetchGradeHistory();
  }, [email]);

  return (
    <div className="progress-container">
      <h2>Your Progress Overview</h2>

      {progress ? (
        <div className="progress-details">
          <p><strong>Email:</strong> {progress.email}</p>
          <p><strong>Total Submitted Works:</strong> {progress.totalWorks}</p>
          <p><strong>Average Grade:</strong> {progress.averageGrade} </p>
        </div>
      ) : (
        <p className="no-data">No progress data available.</p>
      )}

      {gradeHistory.length > 0 && (
        <div className="chart-container">
          <h3>Grade Evolution Over Time</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={gradeHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[5, 10]} />              
              <Line type="monotone" dataKey="grade" stroke="#45f3ff" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Progress;
