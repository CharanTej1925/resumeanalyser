import React from 'react';
import { downloadPDF } from '../api/api';

export default function SkillGap({ resumeData }) {
  if (!resumeData || !resumeData.skill_gap) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-400 bg-[#161b22] p-6 rounded-xl border border-dashed border-gray-700">
          Please upload a resume on the Dashboard first to see the Skill Gap analysis.
        </p>
      </div>
    );
  }

  const { missing_skills, count, match_percentage } = resumeData.skill_gap;
  const userSkills = resumeData.skills || [];
  const skillRecs = resumeData.skill_recommendations || [];
  const topJob = resumeData.job_recommendations?.[0];
  const allJobSkills = [...new Set([...userSkills, ...missing_skills])];

  const handleDownload = async () => {
    try {
      await downloadPDF(resumeData);
    } catch (err) {
      console.error("DOWNLOAD ERROR:", err);
      alert("Download failed: " + err.message);
    }
  };

  return (
    <div className="p-10 text-white bg-[#0a0b14] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Skill Gap & Industry Comparison
        </h2>
        <p className="mb-8 text-gray-400">
          Visualizing match strengths and identifying missing technical keywords for real-time jobs.
        </p>

        {/* Match percentage badge */}
        <div className="mb-8 inline-flex items-center gap-3 bg-[#161b22] px-6 py-3 rounded-2xl border border-gray-800">
          <span className="text-gray-400 text-sm">Match Percentage:</span>
          <span className="text-2xl font-black text-indigo-400">{match_percentage}%</span>
          <span className="text-gray-500 text-sm">({count} missing skills)</span>
        </div>

        {/* Side-by-side comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-[#161b22] p-6 rounded-2xl border border-blue-500/20 shadow-xl">
            <h3 className="text-blue-400 font-bold mb-6 flex items-center text-xl">
              <span className="mr-2">📄</span> Your Extracted Skills ({userSkills.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {userSkills.map((skill, i) => (
                <span key={i} className="bg-blue-900/30 border border-blue-500/50 px-3 py-1 rounded-lg text-xs uppercase tracking-wider">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#161b22] p-6 rounded-2xl border border-purple-500/20 shadow-xl">
            <h3 className="text-purple-400 font-bold mb-6 flex items-center text-xl">
              <span className="mr-2">🎯</span> Match Proficiency
            </h3>
            <div className="space-y-4">
              {allJobSkills.slice(0, 12).map((skill, i) => {
                const isMatch = userSkills.includes(skill);
                return (
                  <div key={i} className="flex flex-col">
                    <div className="flex justify-between text-xs mb-1 uppercase">
                      <span className={isMatch ? "text-green-400" : "text-gray-500"}>{skill}</span>
                      <span className={isMatch ? "text-green-500" : "text-red-500"}>{isMatch ? "Match" : "Gap"}</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-1000 ${isMatch ? 'bg-green-500' : 'bg-red-500/20'}`}
                        style={{ width: isMatch ? '100%' : '15%' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Analysis Insights */}
        <div className="bg-[#161b22] p-8 rounded-2xl border border-gray-800 mb-8">
          <h3 className="text-xl font-bold mb-6 text-white">Analysis Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-red-400 font-semibold mb-3 flex items-center">
                <span className="mr-2">⚠️</span> Missing Keywords ({count})
              </h4>
              <ul className="flex flex-wrap gap-2">
                {missing_skills.map((skill, i) => (
                  <li key={i} className="bg-red-900/20 border border-red-500/40 text-red-200 px-3 py-1 rounded text-sm">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-blue-900/10 p-5 rounded-xl border border-blue-500/20">
              <h4 className="text-blue-400 font-semibold mb-2">Recommendation</h4>
              <p className="text-sm text-gray-300 leading-relaxed text-left">
                Your profile is strong, but adding certifications in{' '}
                <span className="text-white font-bold">{missing_skills.slice(0, 2).join(", ")}</span> will significantly boost
                your <strong>Cosine Similarity</strong> ranking for target roles.
              </p>
            </div>
          </div>
        </div>

        {/* Personalized Skill Recommendations (new from recommender.py) */}
        {skillRecs.length > 0 && (
          <div className="bg-[#161b22] p-8 rounded-2xl border border-gray-800 mb-8">
            <h3 className="text-xl font-bold mb-6 text-white">💡 Personalized Skill Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillRecs.map((rec, i) => (
                <div key={i} className={`p-4 rounded-xl border flex items-start gap-3 ${
                  rec.priority === 'High'
                    ? 'bg-red-900/10 border-red-500/30'
                    : 'bg-yellow-900/10 border-yellow-500/30'
                }`}>
                  <span className="text-lg">{rec.priority === 'High' ? '🔴' : '🟡'}</span>
                  <div>
                    <p className={`font-bold text-sm ${rec.priority === 'High' ? 'text-red-300' : 'text-yellow-300'}`}>
                      {rec.skill.charAt(0).toUpperCase() + rec.skill.slice(1)}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">{rec.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top job match context */}
        {topJob && (
          <div className="bg-[#161b22] p-6 rounded-2xl border border-indigo-500/20 mb-8">
            <h3 className="text-indigo-400 font-bold mb-4">🏆 Best Match: {topJob.title} at {topJob.company}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div><p className="text-gray-400 text-xs mb-1">Match Score</p><p className="text-white font-black text-xl">{topJob.match_score}%</p></div>
              <div><p className="text-gray-400 text-xs mb-1">TF-IDF Score</p><p className="text-white font-black text-xl">{topJob.tfidf_score}%</p></div>
              <div><p className="text-gray-400 text-xs mb-1">Skill Overlap</p><p className="text-white font-black text-xl">{topJob.skill_overlap}%</p></div>
              <div><p className="text-gray-400 text-xs mb-1">Missing Skills</p><p className="text-white font-black text-xl">{topJob.missing_skills.length}</p></div>
            </div>
          </div>
        )}

        {/* PDF Download button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleDownload}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 transform transition-all text-white font-bold py-3 px-10 rounded-full shadow-lg"
          >
            Download Full Analysis Report (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}
