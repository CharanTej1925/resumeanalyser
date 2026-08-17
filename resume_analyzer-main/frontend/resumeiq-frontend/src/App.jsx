//All pages receive:resumeData from App.jsx.
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Analysis from './components/Analysis';
import SkillGap from './components/SkillGap';
import JDMatch from './components/JDMatch';

/**
 * This setup enables real-time processing and professional data visualization.
 */
function App() {
  // Central state to store the complete NLP analysis from FastAPI
  const [resumeData, setResumeData] = useState(null);

  return (
    <Router>
      <div className="min-h-screen bg-[#0a0b14] text-white font-sans selection:bg-blue-500/30">
        {/* Navbar handles the file upload and sets the global resumeData */}
        <Navbar setResumeData={setResumeData} />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* 1. DASHBOARD: Overview & Resume Scoring */}
            <Route path="/" element={<Dashboard resumeData={resumeData} />} />
            
            {/* 2. ANALYSIS: Education, Projects, and Certifications Extraction */}
            <Route path="/analysis" element={<Analysis resumeData={resumeData} />} />
            
            {/* 3. SKILL GAP: Comparative Logic & Match Strengths */}
            <Route path="/skill-gap" element={<SkillGap resumeData={resumeData} />} />
            
            {/* 4. JD MATCH: TF-IDF Vectorization & Similarity Computation */}
            <Route path="/jd-match" element={<JDMatch resumeData={resumeData} />} />
          </Routes>
        </main>

        {/* Month-4 Footer Placeholder */}
        <footer className="py-10 text-center text-gray-600 text-sm border-t border-gray-900 mt-20">
          © 2026 ResumeIQ | Project P069
        </footer>
      </div>
    </Router>
  );
}

export default App;