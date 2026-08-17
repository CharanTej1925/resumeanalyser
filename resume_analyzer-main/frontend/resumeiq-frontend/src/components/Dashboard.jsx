import { Link } from 'react-router-dom';

export default function Dashboard({ resumeData }) {
  if (!resumeData) return (
    <div className="p-10 text-center">
      <p className="text-gray-400 bg-[#161b22] p-10 rounded-2xl border border-dashed border-gray-700 text-lg">
        📄 Upload a resume using the navbar to begin analysis.
      </p>
    </div>
  );

  const { score_data, details, resume_score, candidate } = resumeData;
  const displayName = details?.name || candidate?.name || "Candidate";
  const displayEmail = details?.email || candidate?.email || "";
  const phone = details?.phone || candidate?.phone || "";
  const expYears = candidate?.experience_years || 0;

  return (
    <div className="p-6 lg:p-10 max-w-[1400px] mx-auto space-y-8 text-white">

      {/* Row 1: Score + Candidate Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Score Card */}
        <div className="bg-[#0E1629] p-8 rounded-3xl border border-gray-800 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold">Resume Score</h3>
            {resume_score && (
              <div className="text-right">
                <span className="text-4xl font-black text-indigo-400">{resume_score.grade}</span>
                <p className="text-xs text-gray-400 uppercase tracking-widest">{resume_score.grade_label}</p>
              </div>
            )}
          </div>

          <div className="flex gap-10 items-center mb-8">
            <div className="text-7xl font-bold text-indigo-500">
              {resume_score ? Math.round(resume_score.total_score) : score_data.total}
            </div>
            <div className="flex-1 space-y-5">
              <ScoreMetric label="Completeness" value={score_data.completeness} color="bg-blue-500" />
              <ScoreMetric label="Keyword Optimization" value={score_data.keywords} color="bg-indigo-500" />
              <ScoreMetric label="Formatting Quality" value={score_data.formatting} color="bg-purple-500" />
              <ScoreMetric label="Experience Relevance" value={score_data.relevance} color="bg-blue-400" />
              <ScoreMetric label="Skill Depth" value={score_data.depth} color="bg-indigo-400" />
            </div>
          </div>

          {resume_score && (
            <div className="border-t border-gray-800 pt-6 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-400 text-xs uppercase mb-1">Skills</p>
                <p className="text-green-400 font-bold">{resume_score.components.skills_score}/40</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase mb-1">Experience</p>
                <p className="text-blue-400 font-bold">{resume_score.components.experience_score}/25</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase mb-1">Job Match</p>
                <p className="text-purple-400 font-bold">{resume_score.components.match_score.toFixed(1)}/35</p>
              </div>
            </div>
          )}

          {score_data.reasons && score_data.reasons.length > 0 && (
            <div className="mt-6 border-t border-gray-800 pt-5 space-y-2">
              {score_data.reasons.map((r, i) => (
                <p key={i} className="text-xs text-yellow-400/80 flex gap-2 items-start">
                  <span>⚠</span><span>{r}</span>
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Candidate Card */}
        <div className="bg-[#0E1629] p-8 rounded-3xl border border-gray-800 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold">Candidate Profile</h3>
            <div className="bg-green-500/20 text-green-400 px-4 py-1 rounded-full flex items-center gap-2 border border-green-500/30">
              <span className="text-xs">✔</span>
              <span className="font-semibold text-sm">Parsed</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-7">
            <div className="h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold shrink-0">
              {displayName[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-bold">{displayName}</p>
              {displayEmail && <p className="text-gray-400 text-sm">{displayEmail}</p>}
              {phone && <p className="text-gray-500 text-sm">{phone}</p>}
              {expYears > 0 && (
                <p className="text-indigo-400 text-sm font-medium mt-1">📅 {expYears} year(s) of experience</p>
              )}
            </div>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-64 pr-1">
            <DetailItem icon="🎓" label="Education" value={details?.education} />
            <DetailItem icon="💼" label="Experience" value={details?.experience} />
            <DetailItem icon="📂" label="Projects" value={details?.projects} />
            <DetailItem icon="📜" label="Certifications / Training" value={details?.certifications} />
            {details?.positions && <DetailItem icon="🏆" label="Positions of Responsibility" value={details?.positions} />}
            {details?.courses && <DetailItem icon="📚" label="Elective Courses" value={details?.courses} />}
          </div>

          <div className="mt-6 flex gap-3">
            <Link to="/skill-gap" className="flex-1 text-center bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl text-sm font-bold transition">
              Skill Gap →
            </Link>
            <Link to="/jd-match" className="flex-1 text-center bg-purple-700 hover:bg-purple-600 text-white py-2 rounded-xl text-sm font-bold transition">
              JD Match →
            </Link>
          </div>
        </div>
      </div>

      {/* Detected Skills */}
      {resumeData.skills && resumeData.skills.length > 0 && (
        <div className="bg-[#0E1629] p-8 rounded-3xl border border-gray-800 shadow-2xl">
          <h3 className="text-xl font-bold mb-5">🛠 Detected Skills ({resumeData.skills.length})</h3>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1.5 bg-indigo-900/50 text-indigo-300 border border-indigo-700/50 rounded-full text-xs font-semibold capitalize">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Job Recommendations */}
      {resumeData.job_recommendations && resumeData.job_recommendations.length > 0 && (
        <div className="bg-[#0E1629] p-8 rounded-3xl border border-gray-800 shadow-2xl">
          <h3 className="text-2xl font-bold mb-6">🎯 Top Job Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumeData.job_recommendations.slice(0, 6).map((job) => (
              <div key={job.id} className="bg-[#161b22] p-5 rounded-2xl border border-gray-700 hover:border-indigo-500/50 transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-white">{job.title}</p>
                    <p className="text-gray-400 text-sm">{job.company}</p>
                  </div>
                  <div className={`text-sm font-black px-3 py-1 rounded-full ${
                    job.match_score >= 60 ? 'bg-green-900/40 text-green-400' :
                    job.match_score >= 40 ? 'bg-yellow-900/40 text-yellow-400' :
                    'bg-red-900/40 text-red-400'
                  }`}>
                    {job.match_score}%
                  </div>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full mb-3">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-1000 ${
                      job.match_score >= 60 ? 'bg-green-500' : job.match_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${job.match_score}%` }}
                  />
                </div>
                <p className="text-gray-500 text-xs">{job.experience} exp · Skill overlap: {job.skill_overlap}%</p>
                {job.matched_skills?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {job.matched_skills.slice(0, 4).map((s, i) => (
                      <span key={i} className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                    {job.matched_skills.length > 4 && (
                      <span className="text-xs text-gray-500">+{job.matched_skills.length - 4} more</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

function DetailItem({ icon, label, value }) {
  if (!value || value === "Not detected" || value === "No experience listed" ||
      value === "No projects listed" || value === "No certifications listed") {
    return (
      <div className="flex gap-4 items-start opacity-40">
        <div className="text-xl mt-0.5">{icon}</div>
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{label}</p>
          <p className="text-xs text-gray-600 mt-0.5 italic">Not detected</p>
        </div>
      </div>
    );
  }

  const lines = value.split('\n').filter(Boolean);
  return (
    <div className="flex gap-4 items-start">
      <div className="text-xl mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
        {lines.map((line, i) => (
          <p key={i} className="text-sm font-medium text-gray-200 leading-relaxed">{line}</p>
        ))}
      </div>
    </div>
  );
}

function ScoreMetric({ label, value, color }) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-400 text-xs font-bold uppercase">{label}</span>
        <span className="text-white text-xs font-black">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
