import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  LabelList
} from "recharts";
import "../../styles/professor/GeneratedReport.css";

const GeneratedReport = () => {
  const [averageGrade, setAverageGrade] = useState(0);
  const [allUploads, setAllUploads] = useState([]);
  const [mistakes, setMistakes] = useState([]);
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [lastNWorks, setLastNWorks] = useState(0); // 0 = svi

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const avgRes = await axios.get("http://localhost:8845/professor/averageGrade");
      setAverageGrade(avgRes.data);

      const uploadsRes = await axios.get("http://localhost:8845/professor/allUploads");
      setAllUploads(uploadsRes.data);

      const mistakesRes = await axios.put("http://localhost:8845/professor/commonMistakeReport");
      setMistakes(mistakesRes.data);
    } catch (err) {
      console.error("Error fetching report data:", err);
    }
  };

  const generateReportMessage = () => {
    const totalWorks = allUploads.length;
    const formattedAvg = averageGrade.toFixed(2);
    let message = "";
    if (averageGrade >= 9) {
      message = `The generation is excellent. Great job!\nThey have submitted ${totalWorks} works with an average grade of ${formattedAvg}. \nThey work regularly and deliver on time. Hardworking and dedicated group.`;
    } else if (averageGrade >= 7) {
      message = `The generation is satisfactory.\nThey have submitted ${totalWorks} works with an average grade of ${formattedAvg}. \n Their pace is average, but there is room for improvement.`;
    } else {
      message = `The generation has poor performance.\nThey have submitted only ${totalWorks} works with an average grade of ${formattedAvg}. \n They are inactive and need to engage more if they want to pass the course.`;
    }
    setGeneratedMessage(message);
    setShowMessage(true);
  };

  const studentStats = {};
  allUploads
    .filter(u => u.review && u.review.grade >= 5 && u.review.grade <= 10)
    .sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate))
    .forEach(u => {
      if (!studentStats[u.email]) {
        studentStats[u.email] = [];
      }
      studentStats[u.email].push({ grade: u.review.grade, uploadDate: u.uploadDate });
    });

  const chartData = Object.entries(studentStats).map(([email, gradesWithDates]) => {
    const sortedGrades = gradesWithDates.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
    const selectedGrades = lastNWorks > 0 ? sortedGrades.slice(-lastNWorks) : sortedGrades;

    const avg =
      selectedGrades.reduce((sum, entry) => sum + entry.grade, 0) / selectedGrades.length;

    const name = email.split("@")[0];
    return {
      email: name,
      studentAvg: parseFloat(avg.toFixed(2)),
      generationAvg: averageGrade
    };
  });

  return (
    <div className="students-uploads-container">
      <h2>Class Performance Report</h2>

      <div className="review-details-section">
        <h3>Class Summary</h3>
        <div className="p-font">
          <p>Average Class Grade: {averageGrade}</p>
          <p>Total Works Submitted: {allUploads.length}</p>
          <p>Active Students: {Object.keys(studentStats).length}</p>
        </div>
      </div>
      {chartData.length > 0 && (
        <div className="chart-container-2">
          <h3>Student Progress Overview</h3>
          <div className="chart-filter">
            <label htmlFor="work-filter">Show progress for last:</label>
            <select id="work-filter" onChange={(e) => setLastNWorks(parseInt(e.target.value))}>
              <option value="0">All Works</option>
              <option value="1">Last 1 Work</option>
              <option value="3">Last 3 Works</option>
              <option value="5">Last 5 Works</option>
            </select>
          </div>

          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color class-line"></div>
              <span>Class Average</span>
            </div>
            <div className="legend-item">
              <div className="legend-color student-bar"></div>
              <span>Student Average</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={380}>
            <BarChart
              data={chartData}
              margin={{ top: 40, right: 30, left: 20, bottom: 50 }}
              barCategoryGap={20}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="email"
                angle={-30}
                textAnchor="end"
                interval={0}
                tick={{ fill: "#fff", fontSize: 14 }}
              />
              <YAxis
                domain={[4.9, 10]}
                tick={{ fill: "#fff" }}
                ticks={[5, 6, 7, 8, 9, 10]}
                allowDecimals={false}
              />
              <ReferenceLine
                y={averageGrade}
                stroke="#3c4ccb"
                strokeWidth={4}
              />
              <Bar dataKey="studentAvg" fill="#45f3ff" maxBarSize={40}>
                <LabelList dataKey="studentAvg" position="top" fill="#fff" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="review-details-section">
        <h3>Most Common Mistakes</h3>
        {mistakes.length > 0 ? (
          <ul>
            {mistakes.map((m, idx) => (
              <li key={idx}>{m}</li>
            ))}
          </ul>
        ) : (
          <p>No common mistakes found.</p>
        )}
      </div>

      <div className="review-details-section">
        <button className="details-button" onClick={generateReportMessage}>Generate Report</button>

        {showMessage && (
          <div className="report-box">
            <p>Generated System Statistical Report</p>
            <label>{generatedMessage}</label>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratedReport;
