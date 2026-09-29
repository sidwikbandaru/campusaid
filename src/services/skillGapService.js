/**
 * CampusAid AI - Skill Gap Service
 * 
 * Fully per-student persistent using localStorage.
 * Skills are generated dynamically based on student's career goal.
 * No hardcoded student IDs or pre-filled data.
 * 
 * Target AWS Integration:
 * - DynamoDB Table: CampusAid_Skills (Partition Key: studentId, Sort Key: skillName)
 */

function getActiveSession() {
  try {
    const raw = localStorage.getItem('campusaid_active_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Generate skill templates based on career goal — all start at level 1
 */
export function generateSkillsForGoal(studentId, goal) {
  const lower = (goal || '').toLowerCase();

  if (lower.includes("cloud") || lower.includes("devops")) {
    return [
      { studentId, skillName: "Python", category: "Programming & Automation", currentLevel: 1, targetLevel: 5, status: "not-started", notes: "Python scripting for automation, infrastructure management and tooling." },
      { studentId, skillName: "Linux & Bash", category: "Operating Systems", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "Linux administration, systemd, SSH, and shell scripting." },
      { studentId, skillName: "AWS Cloud Core", category: "Cloud Infrastructure", currentLevel: 1, targetLevel: 5, status: "not-started", notes: "IAM, EC2, S3, VPC, Lambda — targeting Solutions Architect level." },
      { studentId, skillName: "Docker", category: "Containerization", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "Dockerfiles, multi-stage builds, image optimization and security." },
      { studentId, skillName: "Terraform (IaC)", category: "Cloud Infrastructure", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "Declarative infrastructure with modules, state management, and workspaces." },
      { studentId, skillName: "Kubernetes (K8s)", category: "Containerization", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "Pod lifecycles, Deployments, ConfigMaps, Services, and Ingress." },
      { studentId, skillName: "CI/CD Pipelines", category: "DevOps & Tooling", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "GitHub Actions, AWS CodePipeline, automated testing and deployment." }
    ];
  } else if (lower.includes("ai") || lower.includes("machine learning") || lower.includes("ml")) {
    return [
      { studentId, skillName: "Python", category: "Programming", currentLevel: 1, targetLevel: 5, status: "not-started", notes: "NumPy, Pandas, SciPy for scientific computing." },
      { studentId, skillName: "Mathematics (Linear Algebra & Stats)", category: "Foundations", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "Matrix operations, probability distributions, hypothesis testing." },
      { studentId, skillName: "Machine Learning (Scikit-Learn)", category: "ML Core", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "Supervised/unsupervised learning, model evaluation, cross-validation." },
      { studentId, skillName: "Deep Learning (PyTorch)", category: "Deep Learning", currentLevel: 1, targetLevel: 5, status: "not-started", notes: "Neural network architectures, training pipelines, GPU optimization." },
      { studentId, skillName: "NLP & Transformers", category: "AI Specialization", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "Attention mechanisms, fine-tuning BERT/GPT, tokenization." },
      { studentId, skillName: "MLOps & Model Deployment", category: "Production AI", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "MLflow, SageMaker, Docker for ML, model monitoring." },
      { studentId, skillName: "SQL & Data Wrangling", category: "Data Engineering", currentLevel: 1, targetLevel: 3, status: "not-started", notes: "Complex queries, CTEs, data cleaning pipelines." }
    ];
  } else if (lower.includes("fullstack") || lower.includes("full stack") || lower.includes("web")) {
    return [
      { studentId, skillName: "HTML5 & CSS3", category: "Frontend", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "Semantic HTML, modern CSS Grid/Flexbox, responsive design." },
      { studentId, skillName: "JavaScript (ES6+)", category: "Programming", currentLevel: 1, targetLevel: 5, status: "not-started", notes: "Promises, async/await, closures, modules, event loop." },
      { studentId, skillName: "React.js", category: "Frontend Framework", currentLevel: 1, targetLevel: 5, status: "not-started", notes: "Hooks, context, component patterns, performance optimization." },
      { studentId, skillName: "Node.js & Express", category: "Backend", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "REST API design, middleware, authentication, error handling." },
      { studentId, skillName: "PostgreSQL & Prisma", category: "Database", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "Schema design, migrations, query optimization, ORM patterns." },
      { studentId, skillName: "Git & GitHub", category: "Dev Tools", currentLevel: 1, targetLevel: 3, status: "not-started", notes: "Branching strategies, PRs, code review, CI integration." },
      { studentId, skillName: "Testing (Vitest/Playwright)", category: "Quality", currentLevel: 1, targetLevel: 3, status: "not-started", notes: "Unit tests, integration tests, E2E testing automation." }
    ];
  } else if (lower.includes("cyber") || lower.includes("security")) {
    return [
      { studentId, skillName: "Networking & Protocols", category: "Fundamentals", currentLevel: 1, targetLevel: 5, status: "not-started", notes: "TCP/IP, DNS, HTTP/S, packet analysis with Wireshark." },
      { studentId, skillName: "Linux Security & Hardening", category: "OS Security", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "File permissions, PAM, SELinux, firewall configuration." },
      { studentId, skillName: "Cryptography", category: "Security Core", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "AES, RSA, ECC, hashing algorithms, PKI infrastructure." },
      { studentId, skillName: "OWASP & Web Security", category: "Application Security", currentLevel: 1, targetLevel: 5, status: "not-started", notes: "Top 10 vulnerabilities, XSS, CSRF, SQL injection remediation." },
      { studentId, skillName: "Penetration Testing", category: "Offensive Security", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "Burp Suite, Nmap, Metasploit, vulnerability scanning." },
      { studentId, skillName: "SIEM & Incident Response", category: "Defense", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "Splunk, CloudTrail, log analysis, forensic investigation." },
      { studentId, skillName: "Python for Security", category: "Automation", currentLevel: 1, targetLevel: 3, status: "not-started", notes: "Scripting for security automation, exploit development." }
    ];
  } else if (lower.includes("data") && (lower.includes("engineer") || lower.includes("big data"))) {
    return [
      { studentId, skillName: "Advanced SQL", category: "Data Core", currentLevel: 1, targetLevel: 5, status: "not-started", notes: "Window functions, CTEs, execution plans, query optimization." },
      { studentId, skillName: "Python for Data", category: "Programming", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "Polars, DuckDB, Pandas, AsyncIO for data pipelines." },
      { studentId, skillName: "Apache Spark", category: "Big Data", currentLevel: 1, targetLevel: 5, status: "not-started", notes: "Spark SQL, RDD operations, performance tuning, partitioning." },
      { studentId, skillName: "Apache Kafka", category: "Stream Processing", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "Producers, consumers, schema registry, exactly-once semantics." },
      { studentId, skillName: "Apache Airflow", category: "Orchestration", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "DAG design, scheduling, sensors, task dependencies." },
      { studentId, skillName: "Cloud Data (AWS Glue/Athena)", category: "Cloud", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "Glue crawlers, Athena queries, EMR cluster management." },
      { studentId, skillName: "dbt (Data Build Tool)", category: "DataOps", currentLevel: 1, targetLevel: 3, status: "not-started", notes: "Models, tests, documentation, CI/CD for data transformations." }
    ];
  } else if (lower.includes("mobile")) {
    return [
      { studentId, skillName: "TypeScript", category: "Programming", currentLevel: 1, targetLevel: 5, status: "not-started", notes: "Type safety, generics, advanced patterns for React Native." },
      { studentId, skillName: "React Native Core", category: "Mobile Framework", currentLevel: 1, targetLevel: 5, status: "not-started", notes: "Core components, Flexbox layouts, platform-specific code." },
      { studentId, skillName: "Navigation (React Navigation)", category: "Mobile UI", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "Stack, tab, drawer navigators, deep linking." },
      { studentId, skillName: "State Management", category: "Architecture", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "Zustand/Redux Toolkit, context patterns, async state." },
      { studentId, skillName: "Native APIs", category: "Platform", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "Camera, geolocation, biometrics, push notifications." },
      { studentId, skillName: "Performance & Animation", category: "Optimization", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "Reanimated 3, 60fps profiling, memory leak detection." },
      { studentId, skillName: "CI/CD & App Store", category: "Deployment", currentLevel: 1, targetLevel: 3, status: "not-started", notes: "Fastlane, Expo EAS, OTA updates, store compliance." }
    ];
  }

  // Generic fallback
  return [
    { studentId, skillName: "Programming Fundamentals", category: "Core", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "Data structures, algorithms, and problem-solving." },
    { studentId, skillName: "System Design", category: "Architecture", currentLevel: 1, targetLevel: 4, status: "not-started", notes: "Distributed systems, scalability patterns, trade-offs." },
    { studentId, skillName: "Version Control (Git)", category: "Tools", currentLevel: 1, targetLevel: 3, status: "not-started", notes: "Branching, merging, collaboration workflows." }
  ];
}

/**
 * Persist skills to localStorage for a student
 */
export function saveSkills(studentId, skills) {
  const key = `campusaid_skills_${studentId}`;
  try {
    localStorage.setItem(key, JSON.stringify(skills));
  } catch (err) {
    console.error("Failed to save skills:", err);
  }
}

/**
 * Load skills from localStorage for a student
 */
export function loadSkills(studentId) {
  const key = `campusaid_skills_${studentId}`;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Fetch all skill records for a student
 * If no skills exist yet or skills belong to a previous role, generates fresh ones based on career goal
 */
export async function getSkillGaps(studentId, explicitGoal) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let skills = loadSkills(studentId);
      const session = getActiveSession();
      const goal = explicitGoal || session?.careerGoal || '';

      // Check if existing skills match current goal
      const lower = goal.toLowerCase();
      let mismatch = false;

      if (skills && skills.length > 0 && goal) {
        if ((lower.includes('fullstack') || lower.includes('full stack') || lower.includes('web')) &&
            !skills.some(s => s.skillName.toLowerCase().includes('html') || s.skillName.toLowerCase().includes('react'))) {
          mismatch = true;
        } else if ((lower.includes('ai') || lower.includes('ml')) &&
            !skills.some(s => s.skillName.toLowerCase().includes('deep learning') || s.skillName.toLowerCase().includes('machine learning'))) {
          mismatch = true;
        } else if ((lower.includes('cyber') || lower.includes('security')) &&
            !skills.some(s => s.skillName.toLowerCase().includes('owasp') || s.skillName.toLowerCase().includes('cryptography'))) {
          mismatch = true;
        } else if (lower.includes('mobile') &&
            !skills.some(s => s.skillName.toLowerCase().includes('react native'))) {
          mismatch = true;
        } else if ((lower.includes('cloud') || lower.includes('devops')) &&
            !skills.some(s => s.skillName.toLowerCase().includes('aws') || s.skillName.toLowerCase().includes('terraform'))) {
          mismatch = true;
        }
      }

      if (!skills || skills.length === 0 || mismatch) {
        if (goal) {
          skills = generateSkillsForGoal(studentId, goal);
          saveSkills(studentId, skills);
        } else {
          skills = [];
        }
      }

      resolve([...skills]);
    }, 150);
  });
}

/**
 * Regenerate skills for a new career goal
 */
export async function regenerateSkillsForGoal(studentId, goal) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const skills = generateSkillsForGoal(studentId, goal);
      saveSkills(studentId, skills);
      resolve([...skills]);
    }, 150);
  });
}

/**
 * Update the current level of a skill
 * Persists changes to localStorage
 */
export async function updateSkillLevel(studentId, skillName, newCurrentLevel) {
  const skills = loadSkills(studentId);
  if (!skills) throw new Error(`No skills found for student ${studentId}`);

  const index = skills.findIndex(
    (s) => s.skillName.toLowerCase() === skillName.toLowerCase()
  );

  if (index !== -1) {
    const skill = skills[index];
    skill.currentLevel = Math.max(1, Math.min(5, newCurrentLevel));
    if (skill.currentLevel >= skill.targetLevel) {
      skill.status = "mastered";
    } else if (skill.targetLevel - skill.currentLevel >= 2) {
      skill.status = "needs-focus";
    } else {
      skill.status = "in-progress";
    }
    saveSkills(studentId, skills);
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...skill }), 120);
    });
  }

  throw new Error(`Skill ${skillName} not found`);
}
