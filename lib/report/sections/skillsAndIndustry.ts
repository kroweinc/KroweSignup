/**
 * Skills & Industry Experience Section
 */

type SkillsAndIndustryParams = {
  skills: {
    profile: {
      development: string;
      marketing: string;
      leadership: string;
    };
    overall: number | null;
  };
  industry: {
    level: string;
    score: number | null;
    evidence: string[];
  };
};

export function buildSkillsAndIndustrySection(params: SkillsAndIndustryParams): string {
  const { skills, industry } = params;

  return [
    `## 🧠 Skills & Industry Experience`,
    ``,
    `### Skill Profile`,
    `- **Development:** ${skills.profile.development}`,
    `- **Marketing:** ${skills.profile.marketing}`,
    `- **Leadership:** ${skills.profile.leadership}`,
    `- **Overall Skill Score:** ${skills.overall == null ? "⚠ Missing Data" : `${Math.round(skills.overall * 100)}%`}`,
    ``,
    `### Industry Familiarity`,
    `- **Level:** ${industry.level}`,
    `- **Score:** ${industry.score == null ? "⚠ Missing Data" : `${Math.round(industry.score * 100)}%`}`,
    ``,
    `### Evidence`,
    ...(industry.evidence.map(e => `- ${e}`)),
    ``,
  ].join("\n");
}
