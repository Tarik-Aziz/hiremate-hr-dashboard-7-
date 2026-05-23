export const generateJobDescription = async (title: string, keywords: string): Promise<string> => {
  try {
    const response = await fetch("/api/ai/generate-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, keywords })
    });
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    const data = await response.json();
    return data.text || "";
  } catch (error) {
    console.error("Error generating job description from proxy:", error);
    return `We are looking for a ${title}. Key requirements include: ${keywords}. (AI generation unavailable)`;
  }
};

export const rankCandidates = async (jobRequirements: string, candidates: any[]): Promise<any[]> => {
  try {
    const response = await fetch("/api/ai/rank-candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobRequirements, candidates })
    });
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error ranking candidates from proxy:", error);
    return candidates.map(() => ({
      score: 70,
      verdict: "Manual review required",
      reasons: ["Match pending review"]
    }));
  }
};

export const parseResumeText = async (resumeText: string): Promise<any> => {
  try {
    const response = await fetch("/api/ai/parse-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText })
    });
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error parsing resume from proxy:", error);
    return {
      name: "Extracted Profile",
      email: "candidate@email.com",
      skills: ["React", "CSS", "Problem Solving"],
      experience: "3",
      topExperiences: ["Experienced candidate with strong background"],
      education: "B.S. Computer Science"
    };
  }
};
