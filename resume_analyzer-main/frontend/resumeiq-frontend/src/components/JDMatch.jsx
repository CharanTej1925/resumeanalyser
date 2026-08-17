import React, { useState } from 'react';
import { analyzeJD } from '../api/api';

export default function JDMatch({ resumeData }) {
  const [jdText, setJdText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const resumeText = resumeData?.resume_text;
//This runs when user clicks:Calculate Match Score button.
  const handleMatch = async () => {
    if (!resumeText) return alert("Please upload a resume on the Dashboard first!");
    if (!jdText) return alert("Please paste a Job Description!");

    setLoading(true);
    try {
      const data = await analyzeJD(resumeText, jdText, jobTitle);
      setMatchResult(data);
    } catch (error) {
      console.error("Matching error:", error);
      alert("Error calculating similarity score: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (score) => {
    if (score >= 75) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    if (score >= 30) return 'text-orange-400';
    return 'text-red-400';
  };

  const getBarColor = (score) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    if (score >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-10 text-white bg-[#0a0b14] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Job Description Matcher
        </h2>

        <div className="bg-[#161b22] p-8 rounded-2xl border border-gray-800 shadow-2xl">
          <div className="mb-6">
            <label className="block text-gray-400 mb-2 font-medium uppercase tracking-widest text-xs text-left">
              Job Title (optional)
            </label>
            <input
              type="text"
              className="w-full bg-[#0d1117] border border-gray-700 rounded-xl p-3 text-gray-300 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. Senior Backend Developer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          <label className="block text-gray-400 mb-4 font-medium uppercase tracking-widest text-xs text-left">
            Paste Job Description Here
          </label>
          <textarea
            className="w-full h-64 bg-[#0d1117] border border-gray-700 rounded-xl p-4 text-gray-300 focus:border-blue-500 outline-none transition-all"
            placeholder="Paste the target job description to calculate TF-IDF cosine similarity..."
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
          />

          <button
            onClick={handleMatch}
            disabled={loading}
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 py-4 rounded-xl font-bold hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {loading ? "Computing TF-IDF Similarity..." : "Calculate Match Score"}
          </button>
        </div>

        {matchResult && (
          <div className="mt-10 space-y-6">
            {/* Main score */}
            <div className="bg-[#161b22] p-8 rounded-2xl border border-gray-800 text-center">
              <h3 className="text-gray-400 uppercase text-sm tracking-widest mb-2">
                {matchResult.job_title || "Similarity Score"}
              </h3>
              <div className={`text-7xl font-black ${getStrengthColor(matchResult.match)}`}>
                {matchResult.match}%
              </div>
              <p className={`mt-3 font-bold text-lg ${getStrengthColor(matchResult.match)}`}>
                {matchResult.strength || (matchResult.match > 70 ? "Strong Match!" : "📈 Optimization needed.")}
              </p>

              {/* Score breakdown bar */}
              <div className="mt-6 w-full bg-gray-800 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${getBarColor(matchResult.match)}`}
                  style={{ width: `${matchResult.match}%` }}
                />
              </div>
            </div>

            {/* Score components */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#161b22] p-6 rounded-2xl border border-gray-800 text-center">
                <p className="text-gray-400 text-xs uppercase mb-2">TF-IDF Cosine Score</p>
                <p className="text-3xl font-black text-blue-400">{matchResult.tfidf_score}%</p>
              </div>
              <div className="bg-[#161b22] p-6 rounded-2xl border border-gray-800 text-center">
                <p className="text-gray-400 text-xs uppercase mb-2">Skill Overlap</p>
                <p className="text-3xl font-black text-purple-400">{matchResult.skill_overlap}%</p>
              </div>
            </div>

            {/* Matched vs Missing skills */}
            {(matchResult.matched_skills?.length > 0 || matchResult.missing_skills?.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchResult.matched_skills?.length > 0 && (
                  <div className="bg-[#161b22] p-6 rounded-2xl border border-green-500/20">
                    <h4 className="text-green-400 font-bold mb-4">✅ Matched Skills ({matchResult.matched_skills.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {matchResult.matched_skills.map((s, i) => (
                        <span key={i} className="bg-green-900/30 border border-green-500/50 text-green-300 px-3 py-1 rounded-lg text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {matchResult.missing_skills?.length > 0 && (
                  <div className="bg-[#161b22] p-6 rounded-2xl border border-red-500/20">
                    <h4 className="text-red-400 font-bold mb-4">❌ Missing Skills ({matchResult.missing_skills.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {matchResult.missing_skills.map((s, i) => (
                        <span key={i} className="bg-red-900/20 border border-red-500/40 text-red-300 px-3 py-1 rounded-lg text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
