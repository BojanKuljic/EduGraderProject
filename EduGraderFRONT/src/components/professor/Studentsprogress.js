import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/professor/StudentsProgress.css";

function StudentsProgress() {
  const [uploads, setUploads] = useState([]);
  const [studentsProgress, setStudentsProgress] = useState([]);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [reportCourse, setReportCourse] = useState("");
  const [reportFrom, setReportFrom] = useState("");
  const [reportTo, setReportTo] = useState("");
  const [reportResult, setReportResult] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await axios.get("http://localhost:8845/professor/allUploads");
        const data = response.data.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        setUploads(data);

        const grouped = {};
        data.forEach(upload => {
          const email = upload.email;
          if (!grouped[email]) {
            grouped[email] = { email, total: 0, grades: [], uploads: [] };
          }
          grouped[email].total += 1;
          if (upload.review?.grade) grouped[email].grades.push(upload.review.grade);
          grouped[email].uploads.push(upload);
        });

        const result = Object.values(grouped).map(entry => ({
          email: entry.email,
          total: entry.total,
          average: entry.grades.length > 0
            ? (entry.grades.reduce((a, b) => a + b, 0) / entry.grades.length).toFixed(2)
            : "N/A",
          uploads: entry.uploads
        }));

        setStudentsProgress(result);
      } catch (error) {
        console.error("Error loading progress:", error);
      }
    };

    fetchProgress();
  }, []);

  const toggleStudent = (email) => {
    setExpandedStudent(prev => prev === email ? null : email);
    setReportCourse("");
    setReportFrom("");
    setReportTo("");
    setReportResult(null);
  };

  const generateReport = (uploads) => {
    if (!reportCourse || !reportFrom || !reportTo) return setReportResult("Please select all fields.");

    const filtered = uploads.filter(u =>
      u.course === reportCourse &&
      new Date(u.uploadDate) >= new Date(reportFrom) &&
      new Date(u.uploadDate) <= new Date(reportTo)
    );

    if (filtered.length === 0) {
      return setReportResult("No activity in selected range.");
    }

    const grades = filtered.map(u => u.review?.grade).filter(Boolean);
    const avg = grades.length ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;

    let status = "Satisfactory";
    if (avg < 6) status = "Poor";
    else if (avg > 8) status = "Excellent";

    setReportResult(`Uploads: ${filtered.length}, Average grade: ${avg.toFixed(2)} → Progress: ${status}`);
  };

  return (
    <div className="students-uploads-container">
      <h2>Students Progress Overview</h2>

      {studentsProgress.length === 0 ? (
        <p className="no-uploads-message">No data available.</p>
      ) : (
        <div className="uploads-list">
          {studentsProgress.map((student, index) => (
            <div className="upload-card" key={index}>
              <p><strong>Email:</strong> {student.email}</p>
              <p><strong>Total Uploads:</strong> {student.total}</p>
              <p><strong>Average Grade:</strong> {student.average}</p>

              <button className="details-button" onClick={() => toggleStudent(student.email)}>
                {expandedStudent === student.email ? "Hide Progress" : "Show Progress"}
              </button>

              {expandedStudent === student.email && (
                <div className="review-details-section">
                  <h3>Uploads</h3>
                  {student.uploads.map((u, i) => (
                    <div key={i} >
                      <p><strong>Course:</strong> {u.course}</p>
                      <p><strong>Upload Date:</strong> {new Date(u.uploadDate).toLocaleString()}</p>
                      <p><strong>Grade:</strong> {u.review?.grade ?? "Not graded"}</p>
                      <hr />
                    </div>
                  ))}

                  <div className="filters">
                    <select onChange={(e) => setReportCourse(e.target.value)} value={reportCourse}>
                      <option value="">Select Course</option>
                      {[...new Set(student.uploads.map(u => u.course))].map(course =>
                        <option key={course} value={course}>{course}</option>
                      )}
                    </select>
                    <input type="date" value={reportFrom} onChange={(e) => setReportFrom(e.target.value)} />
                    <input type="date" value={reportTo} onChange={(e) => setReportTo(e.target.value)} />
                    <button onClick={() => generateReport(student.uploads)}>Generate Report</button>
                  </div>

                  {reportResult && (
                    <div className="report-box">
                      <p>{reportResult}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentsProgress;
