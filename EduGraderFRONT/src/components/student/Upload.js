import React, { useState, useContext } from 'react';
import axios from 'axios';
import '../../styles/student/Upload.css';
import { AuthContext } from '../auth/AuthContext';
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Upload = () => {
  const { email } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [course, setCourse] = useState('');
  const [title, setTitle] = useState('');
  const navigate = useNavigate();


  const handleUpload = async (e) => {
  e.preventDefault();

  if (!file || !course || !title) {
    toast.error("Please fill in all fields and select a file.");
    return;
  }

  const formData = new FormData();
  formData.append('email', email);
  formData.append('course', course);
  formData.append('title', title);
  formData.append('file', file);

  try {
    const response = await axios.post('http://localhost:8845/student/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    toast.success("Upload successful!");
    setFile(null);
    setCourse('');
    setTitle('');

    
setTimeout(() => navigate("/status"), 2000);
    
  } catch (err) {
    if (err.response?.status === 403) {
      toast.error("Upload limit reached for the selected period.");
    } else {
      toast.error("Upload failed. Please try again.");
    }
  }
};


  return (
    <div className="upload-container">
      <form onSubmit={handleUpload} className="upload-form">
        <h2>Upload Work</h2>

        <input
          type="text"
          placeholder="Course or Subject"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          className="upload-input"
        />

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="upload-input"
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="upload-input"
        />

        <button type="submit" className="upload-button">Upload</button>
        <ToastContainer
          position="top-center"
          autoClose={2000}
          style={{ marginTop: "60px" }}
        />
      </form>

    </div>
  );
};

export default Upload;
