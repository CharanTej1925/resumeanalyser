import React from 'react';
import { Link } from 'react-router-dom';

export default function Analysis({ resumeData }) {
  // 1. Guard Clause: Ensure resume is uploaded to populate the Analysis Architecture
  if (!resumeData || !resumeData.details) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-400 bg-[#161b22] p-6 rounded-xl border border-dashed border-gray-700">
          Upload a resume on the Dashboard to view the detailed extraction analysis.
        </p>
      </div>
    );
  }

  const { details, score_data } = resumeData;

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto text-white bg-[#0a0b14] min-h-screen">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Detailed Resume Analysis
          </h2>
          <p className="text-gray-400 mt-2 italic">
            Parsing results for: <span className="text-white font-semibold">{details.name}</span>
          </p>
        </div>
        <div className="bg-indigo-900/30 border border-indigo-500/30 px-6 py-2 rounded-full">
          <span className="text-indigo-400 font-bold uppercase tracking-widest text-xs">
            Status: Analysis Complete
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Parsed Core Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#161b22] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
            <div className="bg-indigo-600/10 p-4 border-b border-gray-800">
              <h3 className="text-indigo-400 font-bold flex items-center">
                <span className="mr-2"></span> Extracted Work & Academic History
              </h3>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Experience Section - Newly fixed from main.py */}
              <section className="flex gap-6 items-start">
                <div className="p-3 bg-blue-600/20 rounded-xl text-xl">🏢</div>
                <div className="text-left">
                  <h4 className="text-xs uppercase tracking-widest text-blue-400 font-bold mb-1">Most Recent Experience</h4>
                  <p className="text-gray-200 text-lg leading-relaxed font-medium">
                    {details.experience || "No professional experience detected"}
                  </p>
                </div>
              </section>

              {/* Education Section */}
              <section className="flex gap-6 items-start">
                <div className="p-3 bg-purple-600/20 rounded-xl text-xl">🎓</div>
                <div className="text-left">
                  <h4 className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-1">Highest Education</h4>
                  <p className="text-gray-200 text-lg leading-relaxed font-medium">
                    {details.education || "No education details identified"}
                  </p>
                </div>
              </section>

              {/* Projects Section */}
              <section className="flex gap-6 items-start">
                <div className="p-3 bg-green-600/20 rounded-xl text-xl">🚀</div>
                <div className="text-left">
                  <h4 className="text-xs uppercase tracking-widest text-green-400 font-bold mb-1">Highlighted Project</h4>
                  <p className="text-gray-200 text-lg leading-relaxed font-medium">
                    {details.projects || "No major projects identified"}
                  </p>
                </div>
              </section>

              {/* Certifications Section */}
              <section className="flex gap-6 items-start">
                <div className="p-3 bg-yellow-600/20 rounded-xl text-xl">📜</div>
                <div className="text-left">
                  <h4 className="text-xs uppercase tracking-widest text-yellow-400 font-bold mb-1">Professional Certifications</h4>
                  <p className="text-gray-200 text-lg leading-relaxed font-medium italic">
                    {details.certifications || "No certifications identified"}
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Feedback */}
        <div className="space-y-6">
          <div className="bg-[#161b22] rounded-2xl border border-gray-800 p-6 shadow-xl">
            <h3 className="text-white font-bold mb-6 flex items-center border-b border-gray-800 pb-4">
              <span className="mr-2"></span> AI Observations
            </h3>
            <div className="space-y-4">
              {score_data.reasons && score_data.reasons.map((reason, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <p className="text-gray-300 text-sm leading-relaxed">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-indigo-900/20 border border-indigo-500/20 rounded-2xl">
            <p className="text-indigo-300 text-xs leading-relaxed">
              <strong>Algorithm Note:</strong> This extraction uses a combined Regex and TF-IDF approach to identify key sections. Formatting may vary based on PDF layout.
            </p>
          </div>
        </div>
      </div>

      {/* Month-4 Call to Action */}
      <div className="mt-12 text-center p-8 border border-dashed border-gray-800 rounded-3xl">
        <p className="text-gray-500 text-sm mb-4">Want a more comprehensive breakdown of your match with top job roles?</p>
        <Link
          to="/skill-gap"
          className="text-indigo-400 font-bold hover:text-indigo-300 underline underline-offset-8"
        >
          Proceed to Skill Gap Analysis →
        </Link>
      </div>
    </div>
  );
}