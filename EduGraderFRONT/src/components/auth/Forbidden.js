import React from "react";
import "../../styles/auth/Forbidden.css"; // koristi isti stil kao admin stranice

const Forbidden = () => {
  return (
    <div className="forbidden-container">
      <h1>Access Denied</h1>
      <p>This page is restricted by the administrator.</p>
    </div>
  );
};

export default Forbidden;
