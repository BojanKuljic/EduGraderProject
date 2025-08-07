import React from "react";
import "../../styles/auth/Forbidden.css";

const Forbidden = () => {
  return (

    <div className="forbidden-box">
      <div className="forbidden-borderLine">
        <div className="forbidden-content">
          <h1> 🚫 Access Blocked 🚫</h1>
          <h2>⚠️You’ve hit a restricted zone⚠️</h2>
          <p>
            🔐  This page has been temporarily disabled for your account.<br />
            Access to this section was -forbidden- by an administrator. 🔐<br />
          </p>
        </div>
      </div>
    </div>

  );
};

export default Forbidden;
