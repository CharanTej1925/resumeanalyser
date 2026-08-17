//Send requests from React to Python backend

const BASE = "http://127.0.0.1:8000";

//This function uploads a resume file to backend.
export async function analyzeResume(file) {
  const form = new FormData();
  form.append("resume", file);

  //Send data to server
  const res = await fetch(`${BASE}/analyze`, {
    method: "POST",
    body: form,
  });

  //Gets backend error details.
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Analyze failed");
  }

  //If no error, return the data read
  return res.json();
}

//Similarly for jdmatch
export async function analyzeJD(resumeText, jd, jobTitle = "") {
  const form = new FormData();
  form.append("resume_text", resumeText);
  form.append("job_description", jd);
  if (jobTitle) form.append("job_title", jobTitle);

  const res = await fetch(`${BASE}/jd-match`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "JD match failed");
  }
  return res.json();
}

//This function downloads the analysis report.
export async function downloadPDF(resumeData) {
  const payload = {
    resume_text: resumeData.resume_text || "",
    resume_score: resumeData.resume_score || null,
    job_recommendations: resumeData.job_recommendations || [],
    skill_recommendations: resumeData.skill_recommendations || [],
    candidate: resumeData.candidate || {},
  };

  //Backend generates pdf report
  const res = await fetch(`${BASE}/download-pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("PDF download failed");

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ResumeIQ_Analysis.pdf";
  a.click();
  window.URL.revokeObjectURL(url);
}
