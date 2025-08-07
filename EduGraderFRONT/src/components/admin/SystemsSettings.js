import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "../../styles/admin/SystemsSettings.css";
import "react-toastify/dist/ReactToastify.css";

const SystemSettings = () => {
    const [initialSettings, setInitialSettings] = useState(null);
    const [report, setReport] = useState("");
    const [showReport, setShowReport] = useState(false);
    const [settings, setSettings] = useState({
        analysisMethod: "",
        evaluationStyle: "",
        language: "",
        maxUploads: 0,
        period: ""
    });


    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("http://localhost:8845/admin/system-settings");
            const data = await res.json();
            setSettings(data);
            setInitialSettings(data);
        } catch {
            toast.error("Failed to fetch system settings.");
        }
    };

    const handleGenerateOrHideReport = () => {
        if (showReport) {
            setShowReport(false);
            setReport("");
        } else {
            const {
                analysisMethod,
                evaluationStyle,
                language,
                maxUploads,
                period
            } = settings;

            const reportText = `
Current System Configuration Report

• Analysis Method: ${analysisMethod || "Not selected"}
• Evaluation Style: ${evaluationStyle || "Not selected"}
• Language: ${language || "Not selected"}
• Upload Limit: ${maxUploads || "0"} uploads
• Upload Period: ${period || "Not selected"}

General Status:
${analysisMethod && evaluationStyle && language && maxUploads && period
                    ? "✔️ System is fully configured and ready for analysis."
                    : "⚠️ Some settings are missing. Please complete configuration before usage."
                }
`;

            setReport(reportText.trim());
            setShowReport(true);
        }
    };

    const handleChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleRestart = async () => {
        if (!initialSettings) {
            toast.warning("No saved settings to restore.");
            return;
        }

        setSettings(initialSettings);

        try {
            const res = await fetch("http://localhost:8845/admin/system-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(initialSettings)
            });

            if (res.ok) {
                toast.info("Settings reverted to last saved version.");
                setSettings({
                    analysisMethod: "",
                    evaluationStyle: "",
                    language: "",
                    maxUploads: 0,
                    period: ""
                });
            } else {
                toast.error("Failed to send reset settings to server.");
            }
        } catch {
            toast.error("Server error while resetting settings.");
        }
    };

    const handleSave = async () => {
        try {
            const res = await fetch("http://localhost:8845/admin/system-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });

            if (res.ok) {
                toast.success("Settings have been successfully saved.");
            } else {
                const errorText = await res.text();
                toast.error(`Failed to save settings: ${errorText}`);
            }
        } catch (error) {
            toast.error("Server error while saving settings.");
        }
    };

    return (
        <div>
            <div className="manage-users-container">
                <h2>System Settings</h2>

                <div className="manage-section">

                    <h3>Configure Analysis</h3>
                    <div className="user-card">
                        <label>Analysis Method</label>
                        <select
                            className="edit-input"
                            value={settings.analysisMethod}
                            onChange={(e) => handleChange("analysisMethod", e.target.value)}
                        >
                            <option value="">-- Select --</option>
                            <option value="basic">Basic</option>
                            <option value="ai">AI</option>
                            <option value="regex">Regex</option>
                        </select>

                        <label>Evaluation Style</label>
                        <select
                            className="edit-input"
                            value={settings.evaluationStyle}
                            onChange={(e) => handleChange("evaluationStyle", e.target.value)}
                        >
                            <option value="">-- Select --</option>
                            <option value="strict">Strict</option>
                            <option value="normal">Normal</option>
                            <option value="lenient">Lenient</option>
                        </select>

                        <label>Language</label>
                        <select
                            className="edit-input"
                            value={settings.language}
                            onChange={(e) => handleChange("language", e.target.value)}
                        >
                            <option value="">-- Select --</option>
                            <option value="serbian">Serbian</option>
                            <option value="english">English</option>
                            <option value="code">Code</option>
                        </select>
                    </div>

                    <h3>Upload Limits</h3>
                    <div className="user-card">
                        <label>Max Uploads</label>
                        <input
                            className="edit-input"
                            type="number"
                            min={0}
                            value={settings.maxUploads}
                            onChange={(e) => handleChange("maxUploads", e.target.value)}
                        />

                        <label>Upload Period</label>
                        <select
                            className="edit-input"
                            value={settings.period}
                            onChange={(e) => handleChange("period", e.target.value)}
                        >
                            <option value="">-- Select --</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="mmonthly">Monthly</option>
                        </select>
                    </div>

                    <div className="manage-actions">
                        <button className="update-btn" onClick={handleSave}>
                            Save Settings
                        </button>
                        <button className="restriction-btn" onClick={handleRestart}>
                            Restart Settings
                        </button>
                        <button className="delete-btn" onClick={handleGenerateOrHideReport}>
                            {showReport ? "Hide Report" : "Generate Report"}
                        </button>
                    </div>

                    {showReport && report && (
                        <div className="user-card" style={{ whiteSpace: "pre-wrap", marginTop: "25px" }}>
                            <h3>Detailed Report</h3>
                            <div className="manage-section">{report}</div>
                        </div>
                    )}
                </div>
            </div>
            <ToastContainer position="top-center" autoClose={2000} style={{ marginTop: "55px" }} />
        </div>
    );
};

export default SystemSettings;
