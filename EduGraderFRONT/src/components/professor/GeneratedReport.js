import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "../../styles/professor/GeneratedReport.css";

function GeneratedReport() {
  const [averageGrade, setAverageGrade] = useState(null);
  const [gradeTimeline, setGradeTimeline] = useState([]);
  const [commonMistakes, setCommonMistakes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [avgGradeRes, timelineRes, mistakesRes] = await Promise.all([
          axios.get("http://localhost:8845/professor/averageGrade"),
          axios.get("http://localhost:8845/professor/gradeTimeline"),
          axios.put("http://localhost:8845/professor/commonMistakeReport"),
        ]);

        setAverageGrade(avgGradeRes.data);
        const formattedTimeline = timelineRes.data.map((entry, index) => ({
          date: new Date(entry.timestamp).toLocaleDateString("en-GB"),
          grade: entry.grade,
          average: avgGradeRes.data,
        }));
        setGradeTimeline(formattedTimeline);
        setCommonMistakes(mistakesRes.data);
      } catch (err) {
        console.error("Error fetching report data", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="students-uploads-container">
      <h2>Class Performance Report</h2>

      <div className="report-box">
        <p>
          <strong>Average Grade (All Time):</strong>{" "}
          {averageGrade ?? "Loading..."}
        </p>
      </div>

      <div className="chart-container">
        <h3>Grade Timeline (All Reviewed Works)</h3>
        {gradeTimeline.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={gradeTimeline}>
              <CartesianGrid stroke="#444" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#ccc" />
              <YAxis domain={[5, 10]} ticks={[5, 6, 7, 8, 9, 10]} stroke="#ccc" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="grade"
                stroke="#45f3ff"
                strokeWidth={3}
                dot={{ r: 5 }}
                name="Individual Grade"
              />
              <Line
                type="linear"
                dataKey="average"
                stroke="#3c4ccb"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Class Average"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No grade data available.</p>
        )}
      </div>

      <div className="report-box">
        <h3>Most Common Mistakes</h3>
        {commonMistakes.length > 0 ? (
          <ul>
            {commonMistakes.map((mistake, idx) => (
              <li key={idx}>{mistake}</li>
            ))}
          </ul>
        ) : (
          <p>No mistakes found.</p>
        )}
      </div>
    </div>
  );
}

export default GeneratedReport;
