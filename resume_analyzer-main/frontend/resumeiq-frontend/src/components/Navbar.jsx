import { Link, useLocation } from "react-router-dom";
import { analyzeResume } from "../api/api";
import { useState } from "react";

export default function Navbar({ setResumeData }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation(); // To track the active tab for Month-4 UI polish

  const upload = async () => {
    if (!file) {
      alert("Please select a resume file first!");
      return;
    }
    
    setLoading(true);
    try {
      // API Integration: Sending the file to the FastAPI backend
      const data = await analyzeResume(file);
      
      if (data && !data.error) {
        setResumeData(data); // Updates the global state in App.jsx
        alert("Resume analyzed successfully!");
      } else {
        alert("Analysis failed: " + (data?.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Could not connect to the backend. Is your FastAPI server running on port 8000?");
    } finally {
      setLoading(false); // Ensures the button stops saying "Analyzing..." even if it fails
    }
  };

  // Helper function for active link styling
  const linkStyle = (path) => 
    `transition-colors duration-200 ${location.pathname === path ? "text-indigo-400 font-bold" : "text-gray-300 hover:text-white"}`;

  return (
    <nav className="flex justify-between items-center px-10 py-5 bg-[#050B1A] border-b border-gray-800 sticky top-0 z-50 shadow-2xl">
      {/* Brand Identity */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black">R</div>
        <h1 className="text-2xl font-black tracking-tighter text-white">ResumeIQ</h1>
      </div>

      {/* Navigation Links - Dashboard Architecture */}
      <div className="flex gap-8 text-sm uppercase tracking-widest font-medium">
        <Link to="/" className={linkStyle("/")}>Dashboard</Link>
        <Link to="/analysis" className={linkStyle("/analysis")}>Analysis</Link>
        <Link to="/skill-gap" className={linkStyle("/skill-gap")}>Skill Gap</Link>
        <Link to="/jd-match" className={linkStyle("/jd-match")}>JD Match</Link>
      </div>

      {/* File Upload Section - API Integration */}
      <div className="flex items-center gap-4 bg-[#0D1117] p-1.5 rounded-xl border border-gray-800">
        <input 
          type="file" 
          onChange={e => setFile(e.target.files[0])}
          className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-800 file:text-gray-300 hover:file:bg-gray-700 cursor-pointer"
        />
        <button
          onClick={upload}
          disabled={loading}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            loading 
            ? "bg-gray-700 text-gray-500 cursor-not-allowed" 
            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </span>
          ) : "Upload Resume"}
        </button>
      </div>
    </nav>
  );
}