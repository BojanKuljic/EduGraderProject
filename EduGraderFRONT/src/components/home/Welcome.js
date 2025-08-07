import React from "react";
import "../../styles/home/Welcome.css";

const Welcome = () => {
  return (
    <div className="welcome-container">
      <h1>👨‍🏫 Welcome to EduGrader Web API 👨‍🏫</h1>
      <p className="intro">
        EduGrader is a smart system for automatic analysis and grading of educational work —
        including essays, code projects, and research tasks — powered by microservices and AI.
      </p>
      <div className="description">
        With EduGrader, you can:
        <ul>
          <li>📤 Upload your work and track different versions over time</li>
          <li>🤖 Get instant analysis with grades, error detection, and improvement tips</li>
          <li>📊 Visualize your progress with smart statistics and graphs</li>
          <li>👨‍🏫 Receive expert feedback from professors</li>
          <li>🛠 Administrators can manage users and rules effortlessly</li>
        </ul>
      </div>
      <label className="roles2">There are three roles in the system: 👥 </label>
      <div className="roles">
        <ul>
          <li><strong>Students</strong> – upload work and monitor progress</li>
          <li><strong>Professors</strong> – review and assess student work</li>
          <li><strong>Admins</strong> – manage users and system settings</li>
        </ul>
      </div>
      <h4 className="footer-note">
        🔑 Log in or create an account to get started! 🔐
      </h4>
    </div>
  );
};

export default Welcome;
