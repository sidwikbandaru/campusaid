/**
 * CampusAid AI - Resume ATS & Career Matcher Service
 */

const ROLE_KEYWORDS = {
  "Cloud & DevOps Solutions Architect": {
    core: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux", "IAM", "VPC", "CloudWatch", "Python"],
    advanced: ["Prometheus", "Grafana", "Helm", "GitOps", "ArgoCD", "Microservices", "Bash", "Cost Optimization"]
  },
  "AI & Machine Learning Engineer": {
    core: ["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "Machine Learning", "Deep Learning", "Transformers", "SQL"],
    advanced: ["RAG", "Vector Databases", "LangChain", "LoRA", "HuggingFace", "FastAPI", "MLflow", "SageMaker"]
  },
  "Full Stack Web Developer": {
    core: ["React", "JavaScript", "TypeScript", "Node.js", "HTML5", "CSS3", "REST APIs", "PostgreSQL", "Git"],
    advanced: ["Next.js", "GraphQL", "Docker", "Prisma", "TailwindCSS", "Redis", "WebSockets", "Jest"]
  },
  "Cybersecurity & Ethical Hacking": {
    core: ["Network Security", "Cryptography", "Linux", "OWASP", "Vulnerability Assessment", "Firewalls", "Python", "TCP/IP"],
    advanced: ["Zero Trust", "Burp Suite", "SIEM", "Penetration Testing", "Wireshark", "IAM", "SOC", "Incident Response"]
  },
  "Data Engineering & Big Data": {
    core: ["Python", "SQL", "Apache Spark", "Kafka", "Data Modeling", "ETL", "PostgreSQL", "AWS"],
    advanced: ["Airflow", "Snowflake", "Databricks", "dbt", "Delta Lake", "BigQuery", "Glue", "Data Warehousing"]
  },
  "Mobile App Developer (React Native & Flutter)": {
    core: ["React Native", "JavaScript", "TypeScript", "iOS", "Android", "REST APIs", "Git", "State Management"],
    advanced: ["Flutter", "Dart", "Redux", "Zustand", "SQLite", "Expo EAS", "Fastlane", "Push Notifications"]
  }
};

export const SAMPLE_RESUME = `# ALEX RIVERA
Computer Science & Engineering Student | Class of 2026
Email: alex.rivera@campus.edu | GitHub: github.com/alexrivera | LinkedIn: linkedin.com/in/alexrivera

## EDUCATION
B.S. in Computer Science & Engineering
State University of Technology (GPA: 3.8/4.0) | Expected May 2026

## TECHNICAL SKILLS
- Languages: Python, JavaScript, Bash, SQL, C++
- Cloud & Platforms: AWS (EC2, S3, IAM, Lambda), Docker, Linux
- Tools & Frameworks: Git, GitHub Actions, React, Node.js, Express, PostgreSQL

## PROJECTS
### Cloud-Native Microservices Deployment
- Built and containerized a multi-service web backend using Docker and deployed on AWS EC2.
- Configured automated CI/CD pipeline using GitHub Actions to run automated unit tests and build image artifacts.
- Implemented least-privilege IAM roles and configured S3 bucket encryption.

### Student Exam Study Assistant (CampusAid)
- Created full stack copilot using React and Node.js for academic query synthesis.
- Optimized database indexing in PostgreSQL, reducing query latency by 35%.
`;

export async function analyzeResume(resumeText, targetRole = "Cloud & DevOps Solutions Architect") {
  return new Promise((resolve) => {
    setTimeout(() => {
      const text = (resumeText || "").toLowerCase();
      const keywords = ROLE_KEYWORDS[targetRole] || ROLE_KEYWORDS["Cloud & DevOps Solutions Architect"];
      
      const allTargetKeywords = [...keywords.core, ...keywords.advanced];
      const matched = [];
      const missing = [];

      allTargetKeywords.forEach((kw) => {
        if (text.includes(kw.toLowerCase())) {
          matched.push(kw);
        } else {
          missing.push(kw);
        }
      });

      const matchRatio = matched.length / allTargetKeywords.length;
      const baseScore = Math.round(matchRatio * 75) + (text.length > 300 ? 20 : 10);
      const atsScore = Math.min(96, Math.max(35, baseScore));

      const bulletRecommendations = [
        {
          original: "Built and containerized a multi-service web backend using Docker and deployed on AWS EC2.",
          improved: "Architected containerized microservices utilizing Docker multi-stage builds, decreasing image sizes by 45% and slashing cloud deploy latency on AWS EC2.",
          reason: "Quantifies business impact and demonstrates optimization skills instead of passive task execution."
        },
        {
          original: "Configured automated CI/CD pipeline using GitHub Actions to run automated unit tests.",
          improved: "Engineered automated CI/CD pipelines with GitHub Actions and Docker caching, reducing test execution cycles from 12 mins to 3.5 mins.",
          reason: "Applies the Google XYZ formula: Accomplished [X], as measured by [Y], by doing [Z]."
        }
      ];

      resolve({
        atsScore,
        targetRole,
        totalKeywords: allTargetKeywords.length,
        matchedKeywords: matched,
        missingKeywords: missing,
        recommendations: bulletRecommendations,
        summary: `Your resume demonstrates solid foundational technical depth for ${targetRole}. Adding concrete metrics (percentages, latency cuts) and including missing high-yield keywords like ${missing.slice(0, 3).join(', ')} will push your profile past 90%+ ATS screening gates.`
      });
    }, 450);
  });
}
