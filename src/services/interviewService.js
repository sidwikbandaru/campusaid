import {
  generateGeminiInterviewQuestions,
  getGeminiInterviewFeedback,
  isGeminiActive
} from './geminiService';

/**
 * CampusAid AI - Interview Prep Service
 * 
 * Powered by:
 * - Google Gemini AI (Dynamic generation & grading)
 * - Structured Engineering Question Banks (Instant offline fallback)
 */

const QUESTION_BANK = {
  "Cloud & DevOps Engineer": {
    "Docker & Containerization": {
      "Junior": [
        "What is the difference between a Docker image and a Docker container?",
        "Why is it recommended to use lightweight base images like Alpine Linux in Docker?",
        "Explain what the EXPOSE instruction does in a Dockerfile.",
        "How do Docker volumes provide persistent storage across container restarts?",
        "What is the role of .dockerignore and why is it important for build speed and security?"
      ],
      "Mid-level": [
        "Explain how Docker multi-stage builds help optimize final container image sizes and reduce vulnerabilities.",
        "How does the copy-on-write (CoW) mechanism in Docker storage drivers work during image layering?",
        "What is the difference between CMD and ENTRYPOINT instructions in a Dockerfile, and when would you combine them?",
        "How would you troubleshoot a container that immediately exits with status code 137 upon startup?",
        "Describe the security risks of running containers as root and how the USER directive mitigates them."
      ],
      "Senior": [
        "Design a secure, highly-optimized container build pipeline for an enterprise microservice with zero root privileges.",
        "Compare Docker overlay networking with host and macvlan network drivers in high-throughput low-latency systems.",
        "How do cgroups v2 and Linux namespaces isolate CPU, memory, and PID limits in container runtimes?",
        "How would you handle container image scanning and signature verification using Cosign / Notary in a GitOps workflow?",
        "What strategies do you use to debug a container encountering memory leaks leading to OOM-killer evictions in Kubernetes?"
      ]
    },
    "AWS Infrastructure": {
      "Junior": [
        "What is the difference between Amazon EC2 and AWS Lambda in terms of management and pricing?",
        "Explain the purpose of an Amazon S3 Bucket Policy versus an IAM Policy.",
        "What are Availability Zones (AZs) in AWS and why do we deploy across multiple AZs?",
        "What is the difference between a public subnet and a private subnet in an AWS VPC?",
        "Explain the purpose of AWS CloudWatch and how alarms can trigger automated actions."
      ],
      "Mid-level": [
        "Walk me through configuring a high-availability VPC with public/private subnets, NAT Gateways, and an Application Load Balancer.",
        "How does DynamoDB auto-scaling handle sudden, unpredictable spikes in read/write capacity units?",
        "Describe the security best practice of IAM Roles for EC2/Lambda versus hardcoding long-lived access keys.",
        "What is the difference between an Application Load Balancer (ALB) and a Network Load Balancer (NLB)?",
        "How would you architect cross-region disaster recovery for an S3-backed web application with an RPO of 15 minutes?"
      ],
      "Senior": [
        "Design a multi-account AWS architecture using AWS Organizations, Control Tower, and Transit Gateway for 50+ microservices.",
        "How do you implement least-privilege permission boundaries and SCPs (Service Control Policies) across developer accounts?",
        "Explain how AWS Global Accelerator optimizes TCP/UDP routing compared to standard Amazon CloudFront edge caching.",
        "Describe a cost optimization audit strategy for an AWS bill exceeding $100k/month dominated by data transfer and idle compute.",
        "How do you handle zero-downtime database migrations with minimal lag between Amazon Aurora PostgreSQL clusters?"
      ]
    },
    "CI/CD & DevOps Automation": {
      "Junior": [
        "What is Continuous Integration and why is automated unit testing critical before merging code?",
        "Explain how environment secrets (like API keys) should be safely injected into a GitHub Actions pipeline.",
        "What is the difference between a deployment and a release in software delivery?",
        "How do feature flags allow teams to deploy dark features to production safely?",
        "What is Infrastructure as Code (IaC) and what problems does it prevent compared to manual server clicks?"
      ],
      "Mid-level": [
        "Explain Blue/Green deployments vs Canary releases, and how you roll back automatically if error rates spike.",
        "How do you implement GitOps with ArgoCD or Flux in a Kubernetes environment?",
        "Describe how Terraform maintains remote state and handles concurrent team modifications using state locking.",
        "What metrics make up DORA (DevOps Research and Assessment) and how do they indicate engineering health?",
        "How do you secure CI/CD runners from untrusted pull request execution and supply chain poisoning?"
      ],
      "Senior": [
        "Architect an enterprise multi-tenant CI/CD platform executing 5,000 builds daily with ephemeral self-hosted runner auto-scaling.",
        "How do you structure Terraform module hierarchies with Terragrunt for 15 environments without code duplication?",
        "Design a zero-downtime database migration workflow in an automated continuous deployment pipeline.",
        "How do you enforce SLIs and SLOs into deployment gates to automatically halt rollouts on latency regressions?",
        "What is your strategy for disaster recovery testing (Chaos Engineering) in production cloud architectures?"
      ]
    }
  },
  "Full Stack Developer": {
    "System Design & APIs": {
      "Junior": [
        "What is the difference between HTTP GET and POST requests in RESTful API design?",
        "Why is CORS enforced by browsers and how do you configure it safely on a backend server?",
        "Explain the difference between synchronous and asynchronous code execution in JavaScript.",
        "What are HTTP status codes 401 Unauthorized vs 403 Forbidden?",
        "How does client-side state differ from server-side database state in a web application?"
      ],
      "Mid-level": [
        "How do you implement token-based authentication using JWTs with short-lived access tokens and refresh tokens in HTTP-only cookies?",
        "Compare SQL databases (e.g., PostgreSQL) with NoSQL databases (e.g., DynamoDB/MongoDB) regarding indexing and ACID guarantees.",
        "Explain how database connection pooling works and why serverless environments need tools like RDS Proxy.",
        "How would you design an API rate limiter using Redis token bucket or sliding window algorithms?",
        "What is optimistic concurrency control versus pessimistic locking when two users update the same record simultaneously?"
      ],
      "Senior": [
        "Architect a real-time collaborative document editing platform (similar to Google Docs) handling 10,000 concurrent updates per second.",
        "Explain the trade-offs between WebSockets, Server-Sent Events (SSE), and Long Polling for real-time notifications.",
        "How do you design an idempotent payment processing endpoint that safely survives network timeouts and client retries?",
        "Describe how you would decompose a monolithic backend into event-driven microservices using Apache Kafka or AWS EventBridge.",
        "How do you ensure zero-downtime database schema migrations when renaming or removing a widely-used column?"
      ]
    },
    "React & Modern Frontend": {
      "Junior": [
        "Explain the difference between props and state in React.",
        "Why does React require unique keys when rendering lists of elements?",
        "What is the purpose of the useEffect hook and how does its dependency array control execution?",
        "What is CSS flexbox vs CSS grid and when should you choose each?",
        "How does client-side routing with React Router work without triggering full browser reloads?"
      ],
      "Mid-level": [
        "How does React's Virtual DOM reconciliation and Fiber architecture optimize rendering cycles?",
        "Explain memoization in React using useMemo, useCallback, and React.memo — what are the trade-offs of premature memoization?",
        "How would you diagnose and fix an unintended memory leak or state update on an unmounted component?",
        "Compare global state management options: Context API vs Redux Toolkit vs Zustand in terms of re-rendering overhead.",
        "How do you optimize Core Web Vitals (LCP, FID/INP, CLS) in a modern single-page application?"
      ],
      "Senior": [
        "Architect a micro-frontend architecture for a large web application shared across 6 distributed product teams.",
        "Compare Server-Side Rendering (SSR), Static Site Generation (SSG), and React Server Components (RSC) architectural tradeoffs.",
        "How would you design an enterprise design system and headless component library with full WCAG 2.1 AA accessibility?",
        "Describe strategies for client-side state persistence and seamless offline synchronization with optimistic UI rollbacks.",
        "How do you profile, bundle-split, and eliminate performance bottlenecks in a large legacy JavaScript bundle?"
      ]
    }
  },
  "Data & AI Engineer": {
    "Machine Learning & Deep Learning": {
      "Junior": [
        "What is the fundamental difference between supervised and unsupervised learning?",
        "Explain what overfitting means and name two common techniques to prevent it.",
        "What is the purpose of splitting data into training, validation, and test sets?",
        "Explain precision versus recall, and why accuracy alone can be misleading on imbalanced datasets.",
        "What does an activation function (like ReLU or Sigmoid) do in a neural network?"
      ],
      "Mid-level": [
        "Explain the mathematical intuition behind the Attention Mechanism and Self-Attention in Transformer models.",
        "How does Retrieval-Augmented Generation (RAG) mitigate LLM hallucinations and incorporate proprietary real-time data?",
        "Compare cosine similarity, Euclidean distance, and dot product when searching high-dimensional vector embeddings.",
        "Describe how LoRA (Low-Rank Adaptation) enables parameter-efficient fine-tuning (PEFT) on large language models.",
        "What evaluation metrics (e.g., ROUGE, BLEU, G-Eval, perplexity) do you use to measure LLM output quality?"
      ],
      "Senior": [
        "Architect an enterprise RAG pipeline ingesting 10 million technical PDFs with hybrid search, re-ranking, and citation tracing.",
        "How do you optimize LLM inference latency and throughput using vLLM, TensorRT-LLM, and speculative decoding?",
        "Design a continuous model monitoring system detecting embedding drift, concept drift, and data distribution shifts in production.",
        "How do you protect production LLMs against prompt injection attacks, jailbreaks, and sensitive data exfiltration?",
        "Explain how you would distribute training across 64 GPUs using DeepSpeed ZeRO-3 and pipeline parallelism."
      ]
    },
    "ETL Pipelines & Spark": {
      "Junior": [
        "What are the three stages of an ETL (Extract, Transform, Load) pipeline?",
        "What is the difference between batch data processing and real-time streaming data?",
        "Explain the difference between OLTP and OLAP database architectures.",
        "What is a data warehouse versus a data lake?",
        "Why is data normalization preferred in OLTP while dimensional modeling (Star Schema) is preferred in OLAP?"
      ],
      "Mid-level": [
        "How does Apache Spark's Resilient Distributed Dataset (RDD) and Catalyst Optimizer handle lazy evaluation?",
        "Explain how data skew occurs during distributed JOIN operations in Spark and how salting fixes it.",
        "Compare Apache Kafka with AWS SQS/Kinesis in terms of partition ordering, replayability, and consumer group offset management.",
        "What is the Medallion Architecture (Bronze, Silver, Gold layers) in modern lakehouse systems like Delta Lake?",
        "How do you handle schema evolution and backward compatibility when streaming events with Apache Avro / Protobuf?"
      ],
      "Senior": [
        "Design a petabyte-scale real-time ingestion pipeline processing 200,000 sensor events/sec with exactly-once processing semantics.",
        "Compare Snowflake, Google BigQuery, and Databricks architecture in terms of storage-compute decoupling and concurrency scaling.",
        "How do you build a zero-data-loss CDC (Change Data Capture) pipeline from production PostgreSQL to an analytical data lake using Debezium?",
        "Design a data governance and lineage framework complying with GDPR right-to-be-forgotten across immutable distributed logs.",
        "How do you detect, alert, and quarantine bad records using automated data quality gates (e.g., Great Expectations / Soda)?"
      ]
    }
  },
  "Cybersecurity Specialist": {
    "Network & Cloud Security": {
      "Junior": [
        "What is the difference between symmetric and asymmetric encryption, and where is each used in HTTPS?",
        "Explain what a firewall does and how a Stateful Inspection firewall differs from a stateless packet filter.",
        "What is the principle of least privilege and why is it critical in identity management?",
        "What is a Denial of Service (DoS) attack and what are common mitigation techniques?",
        "Explain what multi-factor authentication (MFA) is and why SMS-based MFA is considered vulnerable."
      ],
      "Mid-level": [
        "Explain the core tenets of Zero Trust Architecture (Never Trust, Always Verify) and how microsegmentation is implemented.",
        "How does TLS 1.3 handshake work, and how does Perfect Forward Secrecy (PFS) protect recorded historical traffic?",
        "Walk through investigating a suspected AWS IAM credential leak: what CloudTrail queries and containment steps do you execute?",
        "Describe how an attacker exploits SSRF (Server-Side Request Forgery) to steal IMDSv1 metadata in cloud environments.",
        "Compare traditional antivirus with modern Endpoint Detection and Response (EDR) agents."
      ],
      "Senior": [
        "Architect an enterprise Zero Trust network access (ZTNA) model replacing corporate VPNs for 10,000 remote employees.",
        "Design an incident response playbook and automated quarantine workflow for an active ransomware breakout in AWS.",
        "How do you implement confidential computing and end-to-end KMS envelope encryption for multi-tenant sensitive databases?",
        "Explain how BGP hijacking occurs, how RPKI mitigates it, and how an enterprise protects public IP ranges from route leaks.",
        "Lead a threat modeling session (STRIDE / PASTA) for a distributed cloud-native banking microservices architecture."
      ]
    },
    "Web Exploits & OWASP Top 10": {
      "Junior": [
        "What is SQL Injection (SQLi) and how do prepared statements / parameterized queries eliminate it?",
        "Explain Cross-Site Scripting (XSS) and distinguish between Stored, Reflected, and DOM-based XSS.",
        "What is Cross-Site Request Forgery (CSRF) and how do SameSite cookies and Anti-CSRF tokens prevent it?",
        "Why should passwords never be hashed with plain MD5 or SHA-256, and why are Argon2/bcrypt required?",
        "What does Content Security Policy (CSP) do and how does it prevent script injection?"
      ],
      "Mid-level": [
        "How do attackers exploit Prototype Pollution in JavaScript backends, and what runtime defenses prevent it?",
        "Explain how JWT signature bypass vulnerabilities occur (e.g., 'none' algorithm, key confusion attacks between RS256 and HS256).",
        "Describe how you would exploit and subsequently patch an Insecure Direct Object Reference (IDOR) flaw in an API.",
        "What is Server-Side Template Injection (SSTI) and how does it escalate to Remote Code Execution (RCE)?",
        "How do you configure strict CORS headers to allow specific origins while preventing wildcard credential leaks?"
      ],
      "Senior": [
        "Design an automated DevSecOps pipeline with SAST, DAST, SCA, and container runtime image signing enforcing zero critical CVEs.",
        "Explain OAuth 2.0 / OIDC security flaws (PKCE downgrade, authorization code interception, redirect URI manipulation).",
        "Conduct an architectural analysis of supply chain attacks (e.g., dependency confusion, typosquatting) and enterprise mitigation.",
        "How would you bypass modern WAF (Web Application Firewall) inspection rules using request smuggling and HTTP desync?",
        "Architect a centralized bug bounty triage program with automated reproducibility verification and SLAs for engineering remediation."
      ]
    }
  },
  "Mobile App Developer": {
    "React Native & Mobile Architecture": {
      "Junior": [
        "What is the difference between native iOS/Android development and cross-platform frameworks like React Native or Flutter?",
        "Explain the component lifecycle in a mobile application versus a standard web application.",
        "How does AsyncStorage differ from SQLite or MMKV in terms of performance and storage capacity?",
        "Why is mobile battery consumption and network latency a major architectural constraint?",
        "Explain the difference between debug and release build variants in mobile deployment."
      ],
      "Mid-level": [
        "Explain the React Native New Architecture (JSI, Fabric renderer, TurboModules) and how it removes the asynchronous JSON bridge.",
        "How do you implement offline-first synchronization with conflict resolution using SQLite/WatermelonDB?",
        "Describe how push notifications (APNs / FCM) work from backend dispatch to client device display and background handling.",
        "How do you profile and eliminate 60fps drops during long FlatList scrolling with complex images?",
        "Explain code signing, provisioning profiles in iOS, and keystore management in Android release pipelines."
      ],
      "Senior": [
        "Architect a cross-platform mobile application supporting 5 million active users with dynamic OTA updates (Expo EAS / CodePush).",
        "Design a client-side crash telemetry and ANR (Application Not Responding) diagnostic pipeline integrating Sentry and Datadog.",
        "How do you handle background geolocation tracking and Bluetooth Low Energy (BLE) sync while conforming to strict OS battery limits?",
        "Describe your strategy for modularizing a massive React Native app into monorepo packages with shared business logic.",
        "How do you enforce mobile app security: certificate pinning, jailbreak/root detection, and obfuscation with ProGuard/DexGuard?"
      ]
    }
  }
};

// Fallback questions for any custom role/topic combinations
const DEFAULT_QUESTIONS = [
  "Explain the core architectural principles behind this technology and how it scales in production.",
  "What is the most challenging bug or race condition you might encounter when using this tool, and how would you diagnose it?",
  "How does this system guarantee high availability and fault tolerance during network partitioning?",
  "Describe the security considerations and threat model when exposing this component to public traffic.",
  "If you had to optimize this implementation for a 10x surge in concurrent requests, what bottlenecks would you address first?"
];

export const AVAILABLE_ROLES = Object.keys(QUESTION_BANK);

export function getTopicsForRole(role) {
  if (QUESTION_BANK[role]) {
    return Object.keys(QUESTION_BANK[role]);
  }
  return ["System Architecture", "Performance & Optimization", "Security Best Practices"];
}

/**
 * Generate 5 mock interview questions (Uses Gemini AI if active)
 */
export async function generateInterviewQuestions(
  role = "Cloud & DevOps Engineer",
  topic = "Docker & Containerization",
  difficulty = "Mid-level",
  studentId = "stu_c9842a1"
) {
  let questionsList = [];

  if (isGeminiActive()) {
    try {
      questionsList = await generateGeminiInterviewQuestions(role, topic, difficulty, 5);
    } catch (err) {
      console.warn("Gemini question gen failed, falling back to bank:", err.message);
    }
  }

  // Fallback to local question bank
  if (!questionsList || questionsList.length === 0) {
    if (QUESTION_BANK[role] && QUESTION_BANK[role][topic] && QUESTION_BANK[role][topic][difficulty]) {
      questionsList = QUESTION_BANK[role][topic][difficulty];
    } else if (QUESTION_BANK[role] && QUESTION_BANK[role][topic]) {
      const diffs = Object.keys(QUESTION_BANK[role][topic]);
      questionsList = QUESTION_BANK[role][topic][diffs[0]];
    } else {
      questionsList = DEFAULT_QUESTIONS;
    }
  }

  const formattedQuestions = questionsList.map((q) => ({
    q,
    studentAnswer: "",
    feedback: null,
    score: null
  }));

  const sessionId = "int_" + Math.random().toString(36).substring(2, 9);

  return {
    studentId,
    sessionId,
    role,
    topic,
    difficulty,
    questions: formattedQuestions
  };
}

/**
 * Evaluate a student's answer and produce rubric-based feedback (Uses Gemini AI if active)
 */
export async function getInterviewFeedback(question, studentAnswer, role, topic, difficulty) {
  if (isGeminiActive() && studentAnswer && studentAnswer.trim().length > 3) {
    try {
      const geminiResult = await getGeminiInterviewFeedback(question, studentAnswer, role, topic, difficulty);
      const score = geminiResult.score;
      return {
        score: score,
        breakdown: {
          technicalAccuracy: Math.min(5, Number((score * 0.5).toFixed(1))),
          completeness: Math.min(3, Number((score * 0.3).toFixed(1))),
          clarity: Math.min(2, Number((score * 0.2).toFixed(1)))
        },
        whatWasGood: geminiResult.whatWasGood,
        whatToImprove: geminiResult.whatToImprove,
        modelAnswer: geminiResult.modelAnswer,
        poweredBy: 'Google Gemini AI'
      };
    } catch (err) {
      console.warn("Gemini feedback grading failed, using local rubric:", err.message);
    }
  }

  // Heuristic Rubric Fallback
  const trimmed = (studentAnswer || "").trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;

  let score = 5;
  let whatWasGood = "";
  let whatToImprove = "";
  let modelAnswer = "";

  if (wordCount < 10) {
    score = 3.5;
    whatWasGood = "You identified the core subject and attempted a concise definition.";
    whatToImprove = "The answer is too brief for an interview. Technical interviewers look for concrete mechanisms, architecture flow, edge cases, and production trade-offs.";
    modelAnswer = `A strong interview answer defines the core principle, walks through the operational lifecycle, and highlights production best practices such as least privilege, error handling, and monitoring.`;
  } else if (wordCount < 40) {
    score = 6.5;
    whatWasGood = "Good conceptual direction. You clearly understand the primary objective and terminology.";
    whatToImprove = "Deepen the technical explanation. Mention concrete tools, specific runtime commands or flags, failure recovery, and performance considerations.";
    modelAnswer = `In production, this pattern separates concerns cleanly, minimizes root privilege exposure, and isolates resource consumption using standardized configuration pipelines.`;
  } else {
    score = 8.5;
    whatWasGood = "Comprehensive, structured explanation. Excellent use of technical terminology, architecture considerations, and real-world system trade-offs.";
    whatToImprove = "To reach a perfect 10/10, consider mentioning specific observability metrics (like P99 latency or Prometheus counters) and disaster recovery fallback plans.";
    modelAnswer = `State-of-the-art implementations combine automated pipeline validation, zero-trust permission models, structured health probes, and graceful connection draining under high traffic.`;
  }

  return {
    score: score,
    breakdown: {
      technicalAccuracy: Math.min(5, Number((score * 0.5).toFixed(1))),
      completeness: Math.min(3, Number((score * 0.3).toFixed(1))),
      clarity: Math.min(2, Number((score * 0.2).toFixed(1)))
    },
    whatWasGood,
    whatToImprove,
    modelAnswer
  };
}
