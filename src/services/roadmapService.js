import { generateAwsRoadmap } from './awsService.js';

/**
 * CampusAid AI - Career Roadmap & Academic Courses Service
 * 
 * Fully dynamic & persistent per-student using localStorage and Amazon DynamoDB.
 * Powered by Amazon Bedrock (Nova Micro).
 */

export const ROADMAP_TRACKS = [
  "Cloud & DevOps Solutions Architect",
  "AI & Machine Learning Engineer",
  "Full Stack Web Developer",
  "Cybersecurity & Ethical Hacking",
  "Data Engineering & Big Data",
  "Mobile App Developer (React Native & Flutter)"
];

// Rich academic courses catalog matching university curricula
// NOTE: progress is 0 by default — real progress stored per-student in localStorage
export const ENROLLED_COURSES = [
  {
    id: "cs301",
    code: "CS-301",
    title: "Distributed Systems & Cloud Computing",
    instructor: "Dr. Elena Rostova",
    semester: "Semester 5 (Fall 2026)",
    credits: 4,
    color: "#0EA5E9",
    topics: ["CAP Theorem & Paxos", "Docker & Kubernetes Orchestration", "Serverless AWS Lambda", "Microservices & gRPC"],
    syllabusUrl: "#"
  },
  {
    id: "cs302",
    code: "CS-302",
    title: "Advanced Data Structures & Algorithms",
    instructor: "Prof. Michael Sterling",
    semester: "Semester 5 (Fall 2026)",
    credits: 4,
    color: "#8B5CF6",
    topics: ["Graph Algorithms & Network Flow", "Dynamic Programming", "Tries & Suffix Trees", "Amortized Analysis"],
    syllabusUrl: "#"
  },
  {
    id: "cs303",
    code: "CS-303",
    title: "Database Management & Distributed NoSQL",
    instructor: "Dr. Rajiv Menon",
    semester: "Semester 5 (Fall 2026)",
    credits: 3,
    color: "#10B981",
    topics: ["B-Tree & LSM Tree Indexing", "ACID vs BASE", "Sharding & Replication", "DynamoDB Consistent Hashing"],
    syllabusUrl: "#"
  },
  {
    id: "cs304",
    code: "CS-304",
    title: "Deep Learning & Generative AI Systems",
    instructor: "Dr. Sophia Vance",
    semester: "Semester 5 (Fall 2026)",
    credits: 4,
    color: "#F59E0B",
    topics: ["Transformer Attention Mechanics", "Vector Search & RAG", "Model Quantization & LoRA", "PyTorch Training Pipelines"],
    syllabusUrl: "#"
  },
  {
    id: "cs305",
    code: "CS-305",
    title: "Network Security & Applied Cryptography",
    instructor: "Prof. Kenneth Ward",
    semester: "Semester 5 (Fall 2026)",
    credits: 3,
    color: "#EF4444",
    topics: ["TLS 1.3 Handshake & PFS", "Zero-Trust Architecture", "OWASP Top 10 Exploits", "Public Key Infrastructure (PKI)"],
    syllabusUrl: "#"
  },
  {
    id: "cs306",
    code: "CS-306",
    title: "Modern Full Stack Web Engineering",
    instructor: "Prof. Sarah Lin",
    semester: "Semester 5 (Fall 2026)",
    credits: 3,
    color: "#6366F1",
    topics: ["React 19 & Next.js App Router", "Node.js Concurrency", "GraphQL & REST APIs", "CI/CD & Automated Testing"],
    syllabusUrl: "#"
  },
  {
    id: "cs307",
    code: "CS-307",
    title: "Mobile Systems & Cross-Platform Architecture",
    instructor: "Dr. Amanda Perez",
    semester: "Semester 5 (Fall 2026)",
    credits: 3,
    color: "#EC4899",
    topics: ["React Native & Flutter Internals", "Offline-First SQLite Storage", "Biometrics & Push Notification Services", "Mobile App Security"],
    syllabusUrl: "#"
  },
  {
    id: "cs308",
    code: "CS-308",
    title: "Big Data Engineering & Real-Time Streaming",
    instructor: "Prof. Vikram Ramanathan",
    semester: "Semester 5 (Fall 2026)",
    credits: 4,
    color: "#06B6D4",
    topics: ["Apache Kafka Event Streaming", "PySpark Distributed Pipelines", "Data Lakehouse (Delta Lake / Iceberg)", "Snowflake Warehousing"],
    syllabusUrl: "#"
  },
  {
    id: "cs309",
    code: "CS-309",
    title: "Compiler Design & Programming Language Theory",
    instructor: "Dr. David Thorne",
    semester: "Semester 5 (Fall 2026)",
    credits: 4,
    color: "#84CC16",
    topics: ["Lexical & Syntax Parsing (LL/LR)", "Intermediate Representations (LLVM IR)", "Type Systems & Garbage Collection", "JIT Compilation"],
    syllabusUrl: "#"
  }
];

/**
 * Get enrolled courses with per-student progress from localStorage
 */
export async function getEnrolledCourses(studentId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const progressKey = `campusaid_course_progress_${studentId}`;
      let savedProgress = {};
      try {
        const raw = localStorage.getItem(progressKey);
        if (raw) savedProgress = JSON.parse(raw);
      } catch { /* empty */ }

      // Merge saved progress into course data
      const courses = ENROLLED_COURSES.map(course => ({
        ...course,
        progress: savedProgress[course.id] || 0
      }));
      resolve(courses);
    }, 100);
  });
}

/**
 * Update a single course's progress percentage
 */
export async function updateCourseProgress(studentId, courseId, progress) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const progressKey = `campusaid_course_progress_${studentId}`;
      let savedProgress = {};
      try {
        const raw = localStorage.getItem(progressKey);
        if (raw) savedProgress = JSON.parse(raw);
      } catch { /* empty */ }

      savedProgress[courseId] = Math.max(0, Math.min(100, progress));
      localStorage.setItem(progressKey, JSON.stringify(savedProgress));
      resolve(savedProgress);
    }, 80);
  });
}

// ===== ROADMAP TEMPLATE GENERATORS (all items start unchecked) =====

function makeCloudRoadmap(studentId, goal) {
  return {
    studentId,
    roadmapId: "rdm_cloud_" + Date.now(),
    targetRole: goal,
    phases: [
      {
        name: "Phase 1: Foundational Systems & Scripting",
        items: [
          { skill: "Linux OS Internals & Bash Shell Scripting", done: false },
          { skill: "Computer Networking (TCP/IP, DNS, Subnets, OSI Model)", done: false },
          { skill: "Data Structures & Algorithms in Python or Go", done: false },
          { skill: "Git Version Control, Branching & GitHub Collaboration", done: false }
        ]
      },
      {
        name: "Phase 2: Cloud Computing Core (AWS)",
        items: [
          { skill: "AWS IAM (Roles, Policies, Least-Privilege Access)", done: false },
          { skill: "VPC Architecture (Public/Private Subnets, NAT Gateways)", done: false },
          { skill: "Serverless Compute (AWS Lambda, API Gateway)", done: false },
          { skill: "Cloud Storage & Databases (Amazon S3, DynamoDB)", done: false }
        ]
      },
      {
        name: "Phase 3: Containers, CI/CD & Orchestration",
        items: [
          { skill: "Docker Engine, Multi-Stage Builds & Image Optimization", done: false },
          { skill: "Continuous Integration & Deployment (GitHub Actions, AWS CodePipeline)", done: false },
          { skill: "Kubernetes Architecture (Pods, Deployments, Services, Ingress)", done: false },
          { skill: "Infrastructure as Code with Terraform or AWS CDK", done: false }
        ]
      },
      {
        name: "Phase 4: Production Observability & High Availability",
        items: [
          { skill: "CloudWatch Metrics, Alarms & Centralized Logging", done: false },
          { skill: "Auto Scaling, Load Balancing (ALB) & Disaster Recovery", done: false },
          { skill: "Zero-Trust Security, KMS Encryption & Secrets Manager", done: false },
          { skill: "Cost Optimization & AWS Well-Architected Framework", done: false }
        ]
      }
    ]
  };
}

function makeCyberRoadmap(studentId, goal) {
  return {
    studentId,
    roadmapId: "rdm_security_" + Date.now(),
    targetRole: goal,
    phases: [
      {
        name: "Phase 1: Core Systems & Networking Security",
        items: [
          { skill: "TCP/IP Protocol Stack, Packet Analysis with Wireshark", done: false },
          { skill: "Linux Hardening, File Permissions & PAM", done: false },
          { skill: "Applied Cryptography (AES, RSA, ECC, Hashing)", done: false },
          { skill: "Security Scripting with Python & Bash", done: false }
        ]
      },
      {
        name: "Phase 2: Web & Application Defense",
        items: [
          { skill: "OWASP Top 10 Vulnerabilities & Remediation", done: false },
          { skill: "Secure Authentication (OAuth 2.0, OpenID Connect, JWTs)", done: false },
          { skill: "Penetration Testing Tools (Burp Suite, Nmap, Metasploit)", done: false },
          { skill: "API Security & Rate Limiting Enforcement", done: false }
        ]
      },
      {
        name: "Phase 3: Cloud & Enterprise Infrastructure Security",
        items: [
          { skill: "AWS Security (GuardDuty, Security Hub, KMS, IAM Policies)", done: false },
          { skill: "Zero-Trust Architecture & Microsegmentation", done: false },
          { skill: "SIEM & Log Analysis (Splunk, AWS CloudTrail, ELK)", done: false }
        ]
      },
      {
        name: "Phase 4: DevSecOps & Incident Response",
        items: [
          { skill: "Automated SAST / DAST in CI/CD (SonarQube, Trivy)", done: false },
          { skill: "Threat Modeling (STRIDE / DREAD) & Risk Assessment", done: false },
          { skill: "Incident Response Playbooks & Forensic Analysis", done: false }
        ]
      }
    ]
  };
}

function makeDataEngRoadmap(studentId, goal) {
  return {
    studentId,
    roadmapId: "rdm_dataeng_" + Date.now(),
    targetRole: goal,
    phases: [
      {
        name: "Phase 1: Advanced Databases & Programming",
        items: [
          { skill: "Advanced SQL (Window Functions, CTEs, Execution Plans)", done: false },
          { skill: "Python for Data Engineering (Polars, DuckDB, AsyncIO)", done: false },
          { skill: "Data Modeling (Star/Snowflake Schemas, Data Vault)", done: false },
          { skill: "Linux Shell Scripting & Distributed Networking", done: false }
        ]
      },
      {
        name: "Phase 2: Distributed Compute & Stream Processing",
        items: [
          { skill: "Apache Spark Core, Spark SQL & Performance Tuning", done: false },
          { skill: "Event Streaming with Apache Kafka (Producers, Consumers, Schema Registry)", done: false },
          { skill: "Workflow Orchestration with Apache Airflow & Dagster", done: false },
          { skill: "Data Quality Gates with Great Expectations", done: false }
        ]
      },
      {
        name: "Phase 3: Cloud Data Lakehouses & Warehouses",
        items: [
          { skill: "Snowflake / BigQuery Modern Warehousing", done: false },
          { skill: "Delta Lake / Apache Iceberg Table Formats", done: false },
          { skill: "AWS Glue, Athena & Amazon EMR Orchestration", done: false }
        ]
      },
      {
        name: "Phase 4: Production DataOps & Reliability",
        items: [
          { skill: "CI/CD for Data Pipelines with dbt (data build tool)", done: false },
          { skill: "Data Observability & Lineage Tracking (Monte Carlo/OpenLineage)", done: false },
          { skill: "Cost Optimization for Petabyte-Scale Cloud Storage", done: false }
        ]
      }
    ]
  };
}

function makeMobileRoadmap(studentId, goal) {
  return {
    studentId,
    roadmapId: "rdm_mobile_" + Date.now(),
    targetRole: goal,
    phases: [
      {
        name: "Phase 1: Mobile UI & React Native Foundations",
        items: [
          { skill: "TypeScript & ES6+ JavaScript Mastery", done: false },
          { skill: "React Native Core Components & Flexbox Layouts", done: false },
          { skill: "React Navigation (Stack, Tab, Drawer Navigators)", done: false },
          { skill: "Mobile Device Gestures & Reanimated 3 Animations", done: false }
        ]
      },
      {
        name: "Phase 2: State, Storage & Native Integrations",
        items: [
          { skill: "Global State Management with Zustand or Redux Toolkit", done: false },
          { skill: "Offline-First Storage with SQLite / WatermelonDB", done: false },
          { skill: "Native Device APIs (Camera, Geolocation, Biometrics)", done: false },
          { skill: "Push Notifications with Expo EAS & Firebase Cloud Messaging", done: false }
        ]
      },
      {
        name: "Phase 3: Architecture & Performance Tuning",
        items: [
          { skill: "React Native New Architecture (JSI, Fabric, TurboModules)", done: false },
          { skill: "Profiling 60 FPS Render Loops & Memory Leaks with Flipper", done: false },
          { skill: "Automated E2E Testing with Detox or Maestro", done: false }
        ]
      },
      {
        name: "Phase 4: CI/CD & App Store Delivery",
        items: [
          { skill: "Fastlane Deployment Automation for iOS & Android", done: false },
          { skill: "Over-The-Air (OTA) Updates with Expo Updates", done: false },
          { skill: "App Store & Google Play Release Compliance", done: false }
        ]
      }
    ]
  };
}

function makeAIMLRoadmap(studentId, goal) {
  return {
    studentId,
    roadmapId: "rdm_ai_ml_" + Date.now(),
    targetRole: goal,
    phases: [
      {
        name: "Phase 1: Mathematics & Data Programming",
        items: [
          { skill: "Linear Algebra, Calculus & Statistics Fundamentals", done: false },
          { skill: "Python for Data Analysis (NumPy, Pandas, Vectorization)", done: false },
          { skill: "SQL Query Optimization & Relational Schema Design", done: false },
          { skill: "Data Cleaning, Transformation & Exploratory Analysis", done: false }
        ]
      },
      {
        name: "Phase 2: Machine Learning & Modeling",
        items: [
          { skill: "Supervised & Unsupervised Learning (Scikit-Learn)", done: false },
          { skill: "Deep Learning Foundations (PyTorch / TensorFlow)", done: false },
          { skill: "Feature Engineering & Model Validation Metrics", done: false }
        ]
      },
      {
        name: "Phase 3: Production MLOps & Cloud Pipelines",
        items: [
          { skill: "Data Pipelines with Apache Spark & AWS Glue", done: false },
          { skill: "Containerizing ML Models with Docker & FastAPI", done: false },
          { skill: "Model Deployment & Monitoring (AWS SageMaker, MLflow)", done: false }
        ]
      },
      {
        name: "Phase 4: Generative AI & Vector Architectures",
        items: [
          { skill: "LLM Orchestration & Prompt Engineering (LangChain/Bedrock)", done: false },
          { skill: "Retrieval-Augmented Generation (RAG) & Vector DBs (Pinecone/OpenSearch)", done: false }
        ]
      }
    ]
  };
}

function makeFullStackRoadmap(studentId, goal) {
  return {
    studentId,
    roadmapId: "rdm_fullstack_" + Date.now(),
    targetRole: goal,
    phases: [
      {
        name: "Phase 1: Modern Frontend Core",
        items: [
          { skill: "HTML5 Semantic Architecture & Modern CSS Grid/Flexbox", done: false },
          { skill: "Modern JavaScript (ES6+, Promises, Async/Await)", done: false },
          { skill: "React Fundamentals, Hooks & State Management", done: false },
          { skill: "Responsive Design & Accessibility (a11y)", done: false }
        ]
      },
      {
        name: "Phase 2: Scalable Backend Services",
        items: [
          { skill: "Node.js & Express RESTful API Architecture", done: false },
          { skill: "PostgreSQL Database Design & Prisma ORM", done: false },
          { skill: "Authentication & Authorization (JWT, OAuth2, Sessions)", done: false }
        ]
      },
      {
        name: "Phase 3: Real-Time & Cloud Deployment",
        items: [
          { skill: "WebSockets & Real-Time Event Communication", done: false },
          { skill: "Serverless Deployment with AWS Lambda & CloudFront", done: false },
          { skill: "Unit & Integration Testing (Vitest, Playwright)", done: false }
        ]
      }
    ]
  };
}

/**
 * Generate a FRESH roadmap template based on goal — all items unchecked
 */
export function createFreshRoadmap(studentId, goal) {
  const lower = (goal || '').toLowerCase();

  if (lower.includes("cyber") || lower.includes("security")) {
    return makeCyberRoadmap(studentId, goal);
  } else if (lower.includes("data") && (lower.includes("engineer") || lower.includes("big data"))) {
    return makeDataEngRoadmap(studentId, goal);
  } else if (lower.includes("mobile")) {
    return makeMobileRoadmap(studentId, goal);
  } else if (lower.includes("ai") || lower.includes("machine learning") || lower.includes("ml")) {
    return makeAIMLRoadmap(studentId, goal);
  } else if (lower.includes("fullstack") || lower.includes("full stack") || lower.includes("web")) {
    return makeFullStackRoadmap(studentId, goal);
  } else {
    // Default: Cloud & DevOps
    return makeCloudRoadmap(studentId, goal || "Cloud & DevOps Solutions Architect");
  }
}

/**
 * Persist roadmap to localStorage for a specific student
 */
export function saveRoadmap(studentId, roadmap) {
  const key = `campusaid_roadmap_${studentId}`;
  try {
    localStorage.setItem(key, JSON.stringify(roadmap));
  } catch (err) {
    console.error("Failed to save roadmap:", err);
  }
}

/**
 * Load saved roadmap from localStorage for a specific student
 */
export function loadRoadmap(studentId) {
  const key = `campusaid_roadmap_${studentId}`;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Generate or tailor a personalized roadmap based on student parameters
 * Calls AWS Bedrock (Nova Micro) via Lambda API with local fallback
 */
export async function generateRoadmap(year, branch, goal, studentId = "stu_c9842a1") {
  try {
    const awsRes = await generateAwsRoadmap(year, branch, goal, studentId);
    if (awsRes && awsRes.success && awsRes.data && Array.isArray(awsRes.data.phases)) {
      saveRoadmap(studentId, awsRes.data);
      return { ...awsRes.data };
    }
  } catch (err) {
    console.warn("AWS Bedrock roadmap call fallback:", err.message);
  }

  // Fallback to dynamic local generator
  return new Promise((resolve) => {
    setTimeout(() => {
      const roadmap = createFreshRoadmap(studentId, goal);
      saveRoadmap(studentId, roadmap);
      resolve({ ...roadmap });
    }, 200);
  });
}

/**
 * Toggle or update the done state of a specific skill item
 * Persists to localStorage
 */
export async function updateRoadmapSkill(studentId, roadmapId, phaseIndex, itemIndex, done) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const roadmap = loadRoadmap(studentId);
      if (roadmap && roadmap.phases[phaseIndex] && roadmap.phases[phaseIndex].items[itemIndex]) {
        roadmap.phases[phaseIndex].items[itemIndex].done = done;
        saveRoadmap(studentId, roadmap);
      }
      resolve(roadmap ? { ...roadmap } : null);
    }, 100);
  });
}

/**
 * Get current saved roadmap, syncing to careerGoal if track changed
 */
export async function getSavedRoadmap(studentId, careerGoal) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let roadmap = loadRoadmap(studentId);
      // If student has a careerGoal and roadmap doesn't exist or is for a different track, create fresh one
      if (careerGoal && (!roadmap || (roadmap.targetRole && roadmap.targetRole.toLowerCase() !== careerGoal.toLowerCase()))) {
        roadmap = createFreshRoadmap(studentId, careerGoal);
        saveRoadmap(studentId, roadmap);
      }
      resolve(roadmap ? { ...roadmap } : null);
    }, 120);
  });
}
