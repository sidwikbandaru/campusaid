import { generateGeminiStudyAnswer, isGeminiActive } from './geminiService';

/**
 * CampusAid AI - Dynamic Academic & Technical Study Assistant Service
 * 
 * Powered by:
 * - Google Gemini AI (Real-time LLM generative responses)
 * - Academic Heuristic Engine (Offline / instant fallback)
 * - DynamoDB-compatible session schema
 */

export const SYSTEM_PROMPT = `You are CampusAid's Study Assistant for a college student.
Given a question (and optional uploaded document text), respond with:
1. A simple explanation (plain language, 3-5 sentences)
2. One concrete example
3. 3 key points as a short list
Keep the total response under 250 words unless asked for more detail.`;

export const STUDY_AI_PROMPT = SYSTEM_PROMPT;

/**
 * Clean parenthetical/bracketed notes and unnecessary whitespaces from questions
 */
export function cleanQuestion(question) {
  if (!question || typeof question !== 'string') return '';
  return question
    .replace(/\s*(\([^)]*\)|\[[^\]]*\])\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Conversational intent matchers
const GREETING_REGEX = /^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|sup|yo|howdy)[\s!.,?]*$/i;
const HELP_REGEX = /^(who are you|what can you do|how does this work|help|help me|commands)[\s!.,?]*$/i;

// Comprehensive topic knowledge catalog
const TOPIC_CATALOG = [
  {
    matcher: (q) => q.includes('recursion') || q.includes('recursive'),
    answer: {
      topic: 'Recursion & Call Stack Mechanics',
      explanation: 'Recursion is a programming technique where a function solves a problem by calling a smaller instance of itself until it reaches a defined stopping condition known as the base case. Each recursive invocation adds an activation frame to the system call stack, storing its own distinct arguments and local variables. Once the base case is satisfied, the pending calls resolve in reverse order, returning computed values back up the chain of execution.',
      example: 'Calculating factorial of 4 (4!): The function computes 4 × factorial(3), which calls 3 × factorial(2), down to the base case of factorial(1) = 1. The stack unwinds to compute 1 × 2 = 2, 2 × 3 = 6, and finally 6 × 4 = 24.',
      keyPoints: [
        'A base case is mandatory to prevent infinite execution and call stack overflow errors.',
        'Each recursive call consumes additional memory on the call stack proportional to recursion depth O(N).',
        'Natural fit for hierarchical data structures like binary trees and divide-and-conquer algorithms like Merge Sort.'
      ]
    }
  },
  {
    matcher: (q) => q.includes('page replacement') || (q.includes('virtual memory') && q.includes('os')) || q.includes('paging in os'),
    answer: {
      topic: 'Page Replacement Algorithms (Virtual Memory)',
      explanation: 'Page replacement algorithms are used by an operating system\'s virtual memory manager when a page fault occurs and all physical memory frames in RAM are occupied. The OS must select an existing resident page to swap out to secondary disk storage to allocate space for the incoming page. The core objective is minimizing page fault frequency to prevent thrashing, where the CPU spends more time swapping data than running processes.',
      example: 'In a FIFO page replacement system with 3 physical frames, loading page requests 1, 2, 3, and then 4 results in evicting page 1 because it has resided in physical memory the longest.',
      keyPoints: [
        'Allows programs requiring more memory than available physical RAM to execute reliably.',
        'Algorithms like Least Recently Used (LRU) rely on past access patterns to approximate future page access probability.',
        'Poor replacement policies trigger thrashing, reducing CPU utilization toward near zero.'
      ]
    }
  },
  {
    matcher: (q) => q.includes('normalization') || q.includes('normal form') || q.includes('1nf') || q.includes('2nf') || q.includes('3nf') || q.includes('bcnf'),
    answer: {
      topic: 'Database Normalization (1NF to BCNF)',
      explanation: 'Database normalization is the systematic technique of organizing fields and tables within a relational database to minimize data redundancy and eliminate anomalies. It involves decomposing large, unfocused tables into smaller, well-structured relationships connected via foreign keys. The process progresses through formal stages known as normal forms, with each step enforcing tighter constraints on functional dependencies.',
      example: 'Instead of repeating a student\'s department name and department head in every course enrollment row, store department information in a separate Departments table and link it with a foreign key DepartmentID.',
      keyPoints: [
        'Reduces redundant data footprint and ensures strict relational integrity across tables.',
        'Eliminates update, insertion, and deletion anomalies that can silently corrupt relational data.',
        'Higher normal forms may require multiple table JOINs, which can introduce read latency tradeoffs in high-scale systems.'
      ]
    }
  },
  {
    matcher: (q) => q.includes('docker') && (q.includes('vm') || q.includes('virtual machine') || q.includes('container')),
    answer: {
      topic: 'Docker Containers vs Virtual Machines',
      explanation: 'Docker containers virtualize the operating system kernel, packaging an application together with its runtime dependencies into a lightweight process isolated by Linux namespaces and cgroups. In contrast, Virtual Machines (VMs) virtualize hardware using a hypervisor (such as KVM or ESXi), requiring each guest machine to run an independent, full-fledged guest OS kernel.',
      example: 'Spinning up 10 microservices as Docker containers takes seconds and shares the host Linux kernel, consuming megabytes of RAM. Running 10 full VMs would require allocating gigabytes of RAM for 10 separate OS kernels and minutes of boot time.',
      keyPoints: [
        'Containers share the host OS kernel, making them lightweight (MBs) with sub-second boot times.',
        'VMs provide hardware-level virtualization with hypervisors, offering stronger isolation boundaries at the cost of high overhead.',
        'Docker solves "works on my machine" bugs by freezing exact binaries, libraries, and runtime environment.'
      ]
    }
  },
  {
    matcher: (q) => q.includes('cap theorem') || q.includes('brewer'),
    answer: {
      topic: 'CAP Theorem in Distributed Systems',
      explanation: 'Formulated by Eric Brewer, the CAP theorem states that any distributed data store can simultaneously provide at most two out of three guarantees: Consistency (every read receives the most recent write or an error), Availability (every non-failing node returns a non-error response), and Partition Tolerance (the system continues to operate despite network packet loss or network splits). Because network partitions are inevitable in real-world distributed infrastructure, systems must choose between Consistency (CP) or Availability (AP) during network partitions.',
      example: 'In an AP database like Apache Cassandra or Amazon DynamoDB (eventually consistent mode), if a fiber optic cable splits two data centers, both continue accepting writes, sacrificing immediate consistency. In a CP database like etcd or Google Spanner, partitioned nodes refuse writes until quorum is reached.',
      keyPoints: [
        'Partition Tolerance (P) is non-negotiable in real-world cloud networks where packet drops and split-brain happen.',
        'CP systems (e.g., ZooKeeper, HBase, etcd) prioritize strict correctness by blocking writes when quorum is lost.',
        'AP systems (e.g., Cassandra, DynamoDB default, Couchbase) prioritize 100% uptime, resolving inconsistencies through eventual consistency.'
      ]
    }
  },
  {
    matcher: (q) => q.includes('react') && (q.includes('state') || q.includes('hook') || q.includes('useeffect') || q.includes('virtual dom')),
    answer: {
      topic: 'React State, Hooks & Virtual DOM Reconciliation',
      explanation: 'In React, state represents reactive data that dictates a component\'s UI rendering. When state updates via functions like useState or dispatch, React invokes the component again and creates a new Virtual DOM representation in memory. React\'s Fiber reconciliation engine compares the new Virtual DOM tree against the previous snapshot (a process called diffing) and calculates the minimal set of real browser DOM mutations required to update the screen.',
      example: 'const [count, setCount] = useState(0); Calling setCount(c => c + 1) schedules a re-render. Instead of re-creating the entire webpage DOM, React selectively updates only the specific text node containing the count number.',
      keyPoints: [
        'State modifications are asynchronous and batched by React to avoid redundant browser layout recalculations.',
        'The Virtual DOM diffing algorithm runs in O(N) heuristic time using element keys to track moved list items.',
        'Hooks like useEffect synchronize components with external systems (APIs, timers, WebSockets) and require precise dependency arrays.'
      ]
    }
  },
  {
    matcher: (q) => q.includes('binary search') || q.includes('time complexity') || q.includes('big o'),
    answer: {
      topic: 'Binary Search & Logarithmic Time Complexity (O(log N))',
      explanation: 'Binary Search is an efficient divide-and-conquer algorithm for finding an element in a sorted collection. It works by repeatedly comparing the target value to the middle element of the search space. If the target does not match the middle element, the half in which the target cannot lie is eliminated, reducing the remaining search interval by 50% with every single comparison.',
      example: 'Searching for a name in a phone book of 1,000,000 sorted records: Linear search would check up to 1,000,000 entries in the worst case (O(N)). Binary search finds the target in at most 20 comparisons (log2(1,000,000) ≈ 20).',
      keyPoints: [
        'Requires the underlying dataset to be sorted beforehand or indexed in an ordered structure.',
        'Achieves O(log N) worst-case and average-case time complexity, scaling effortlessly to billions of items.',
        'Forms the foundational architecture of B-Tree database indexes and binary search tree (BST) traversal.'
      ]
    }
  },
  {
    matcher: (q) => q.includes('tcp') && (q.includes('udp') || q.includes('protocol')),
    answer: {
      topic: 'TCP vs UDP Protocols (Transport Layer)',
      explanation: 'Transmission Control Protocol (TCP) and User Datagram Protocol (UDP) are the two primary Transport Layer protocols in the internet suite. TCP is connection-oriented; it establishes a connection via a 3-way handshake (SYN, SYN-ACK, ACK), guarantees reliable in-order packet delivery through sequence numbers and retransmissions, and enforces flow and congestion control. UDP is connectionless; it transmits datagrams without handshakes, ordering guarantees, or automatic retransmissions, yielding minimal latency and overhead.',
      example: 'Web browsing (HTTPS), database connections, and file transfers (SFTP) rely on TCP because missing packets corrupt data. Real-time multiplayer gaming, live video streaming, and DNS queries use UDP because immediate low-latency arrival is more important than re-sending late packets.',
      keyPoints: [
        'TCP guarantees zero packet loss, strict in-order sequencing, and congestion throttling, but incurs handshake and ACK latency.',
        'UDP provides low-overhead, fast packet transmission with zero connection state, but applications must handle lost or out-of-order packets.',
        'Modern protocols like HTTP/3 (QUIC) build multiplexed, encrypted reliability on top of UDP to avoid TCP head-of-line blocking.'
      ]
    }
  },
  {
    matcher: (q) => q.includes('acid') && (q.includes('database') || q.includes('transaction') || q.includes('dbms')),
    answer: {
      topic: 'ACID Properties in Database Transactions',
      explanation: 'ACID is an acronym representing the four foundational guarantees of relational database transactions: Atomicity (the entire transaction succeeds or entirely rolls back—all-or-nothing), Consistency (transactions transition the database from one valid state to another without violating constraints), Isolation (concurrent transactions execute without interfering with one another), and Durability (once committed, modifications survive system crashes or power failures).',
      example: 'Bank transfer: Transferring $100 from Account A to Account B requires two operations: debiting A and crediting B. Atomicity ensures that if the system crashes after debiting A, the entire transaction rolls back so money does not disappear into thin air.',
      keyPoints: [
        'Atomicity prevents partial writes through write-ahead logging (WAL) and rollback segments.',
        'Isolation levels (Read Committed, Repeatable Read, Serializable) allow engineers to balance concurrency speed against phantom read anomalies.',
        'Durability guarantees committed transactions are flushed to non-volatile disk/SSD or distributed replicas.'
      ]
    }
  },
  {
    matcher: (q) => q.includes('sql injection') || q.includes('sqli') || q.includes('xss') || q.includes('cyber') || q.includes('security'),
    answer: {
      topic: 'SQL Injection (SQLi) & Web Application Security',
      explanation: 'SQL Injection is a critical vulnerability occurring when untrusted user input is directly concatenated into a dynamic database SQL query without sanitization or parameterization. This allows an attacker to manipulate query structure, bypass authentication, exfiltrate sensitive database records, or drop tables. Modern web defense requires parameterized queries (prepared statements), least-privilege database user accounts, and Web Application Firewalls (WAF).',
      example: 'Vulnerable query: "SELECT * FROM users WHERE email = \'" + userInput + "\'". If the attacker enters: admin@site.com\' OR \'1\'=\'1, the query evaluates to true for all rows, bypassing password verification.',
      keyPoints: [
        'Always use Parameterized Queries (Prepared Statements) or an ORM; never concatenate raw string inputs into SQL.',
        'Enforce Least Privilege on database connection accounts so web applications cannot execute administrative DDL commands.',
        'Combine input validation with Content Security Policy (CSP) and automated static application security testing (SAST).'
      ]
    }
  },
  {
    matcher: (q) => q.includes('transformer') || q.includes('llm') || q.includes('rag') || q.includes('attention') || (q.includes('ai') && q.includes('model')),
    answer: {
      topic: 'Transformers, Self-Attention & LLM Architectures',
      explanation: 'The Transformer architecture (introduced in "Attention Is All You Need") revolutionized artificial intelligence by replacing sequential recurrent networks (RNNs) with multi-head self-attention mechanisms. Self-attention allows the model to compute mathematical relationships between all words/tokens in a sentence simultaneously in parallel, regardless of their distance. This captures long-range dependencies, nuances, and syntactic context with unmatched efficiency during GPU training.',
      example: 'In the sentence "The animal didn\'t cross the street because it was too tired", the self-attention layer assigns high mathematical correlation weight between the pronoun "it" and "animal", correctly identifying what "it" refers to.',
      keyPoints: [
        'Processes tokens in parallel rather than sequential steps, unlocking massive GPU training scalability.',
        'Multi-Head Attention projects token embeddings into multiple query, key, and value representation subspaces.',
        'Powers modern foundational Large Language Models (LLMs) like Claude, GPT, and Amazon Titan.'
      ]
    }
  }
];

/**
 * Dynamic subject domain classifier & generator for arbitrary student questions
 */
function synthesizeDynamicAnswer(question) {
  const cleanQ = question
    .replace(/^(what is|explain|tell me about|how does|why is|difference between|how to use|define|can you explain|give me|what are|describe)\s+/i, '')
    .replace(/[?.,!]+$/, '')
    .trim();
  
  const displayTopic = cleanQ.length > 0 
    ? (cleanQ.charAt(0).toUpperCase() + cleanQ.slice(1)) 
    : 'Engineering Concept';

  const qLower = question.toLowerCase();

  // 1. Programming, Code & Logic
  if (qLower.includes('function') || qLower.includes('loop') || qLower.includes('class') || qLower.includes('code') || qLower.includes('pointer') || qLower.includes('memory') || qLower.includes('variable') || qLower.includes('object') || qLower.includes('pattern')) {
    return {
      topic: displayTopic.length > 45 ? displayTopic.slice(0, 42) + '...' : displayTopic,
      explanation: `In software development, "${displayTopic}" is a core structural pattern used to organize code logic and manage runtime resources. It encapsulates state and behavior to minimize side effects, making complex systems modular and testable under high execution throughput.`,
      example: `For instance, when writing production services, developers apply "${displayTopic}" by defining clear input contracts and encapsulating internal transformations, which prevents regression bugs when dependencies change.`,
      keyPoints: [
        `Promotes DRY (Don't Repeat Yourself) design principles and high reusability across modules.`,
        `Directly impacts algorithmic runtime performance and memory allocation on the heap/stack.`,
        `Simplifies writing isolated unit and integration tests with deterministic mocks.`
      ]
    };
  }

  // 2. Cloud, Infrastructure, Microservices & Systems
  if (qLower.includes('cloud') || qLower.includes('aws') || qLower.includes('server') || qLower.includes('microservice') || qLower.includes('api') || qLower.includes('cluster') || qLower.includes('load balancer') || qLower.includes('kubernetes') || qLower.includes('deploy')) {
    return {
      topic: displayTopic.length > 45 ? displayTopic.slice(0, 42) + '...' : displayTopic,
      explanation: `In modern cloud systems and infrastructure, "${displayTopic}" enables elastic horizontal scaling, decoupled failure domains, and high availability. It abstracts underlying computing hardware so services can scale dynamically in response to shifting network traffic demands.`,
      example: `A typical architecture deploys "${displayTopic}" behind an API gateway or load balancer across multiple Availability Zones (AZs) with auto-scaling triggers to handle sudden traffic spikes without downtime.`,
      keyPoints: [
        `Ensures fault tolerance and graceful degradation during network partitions or node failures.`,
        `Leverages infrastructure-as-code (IaC) for automated, reproducible cloud provisioning.`,
        `Optimizes operational cost through autoscaling and pay-as-you-go resource utilization.`
      ]
    };
  }

  // 3. Security, Auth & Networking
  if (qLower.includes('security') || qLower.includes('token') || qLower.includes('auth') || qLower.includes('jwt') || qLower.includes('encrypt') || qLower.includes('hash') || qLower.includes('http') || qLower.includes('dns') || qLower.includes('firewall') || qLower.includes('ssl')) {
    return {
      topic: displayTopic.length > 45 ? displayTopic.slice(0, 42) + '...' : displayTopic,
      explanation: `Within cybersecurity and network engineering, "${displayTopic}" safeguards data integrity, confidentiality, and user authenticity. It forms a crucial layer in defense-in-depth security, preventing unauthorized access, session tampering, and malicious exploits.`,
      example: `When authenticating client requests, systems validate the cryptographic signature and claims associated with "${displayTopic}" before granting access to downstream microservice endpoints.`,
      keyPoints: [
        `Implements defense-in-depth principles to eliminate single points of compromise.`,
        `Protects sensitive data both in-transit (over TLS) and at-rest using strong cryptographic ciphers.`,
        `Complies with strict regulatory standards including SOC2, GDPR, and NIST guidelines.`
      ]
    };
  }

  // 4. Data, AI, Analytics & Machine Learning
  if (qLower.includes('data') || qLower.includes('machine learning') || qLower.includes('neural') || qLower.includes('model') || qLower.includes('dataset') || qLower.includes('training') || qLower.includes('analytics') || qLower.includes('sql') || qLower.includes('query')) {
    return {
      topic: displayTopic.length > 45 ? displayTopic.slice(0, 42) + '...' : displayTopic,
      explanation: `In modern data architectures and intelligent systems, "${displayTopic}" provides the foundation for data modeling, predictive analysis, and continuous learning. It converts raw unstructured or semi-structured data into actionable insights with quantifiable confidence metrics.`,
      example: `Engineers set up automated data ingestion pipelines that clean, normalize, and vectorize incoming data using "${displayTopic}" prior to feeding it into inference endpoints or analytical warehouses.`,
      keyPoints: [
        `Optimizes computational throughput across GPU clusters and distributed analytical engines.`,
        `Requires careful validation to prevent data drift, overfitting, and schema corruption.`,
        `Forms the backbone of real-time recommendation engines and automated decision systems.`
      ]
    };
  }

  // 5. Default General Computer Science Synthesizer
  return {
    topic: displayTopic.length > 45 ? displayTopic.slice(0, 42) + '...' : displayTopic,
    explanation: `In computer science and modern software engineering, "${displayTopic}" represents an essential building block for constructing scalable, maintainable systems. It provides standardized abstractions and proven design rules that govern how data, processes, and memory communicate under high workloads.`,
    example: `When implementing "${displayTopic}" in production, engineers isolate its business logic behind clean interfaces or service contracts, allowing the underlying implementation to be refactored or optimized without disrupting client applications.`,
    keyPoints: [
      `Establishes predictable operational boundaries and clean separation of concerns.`,
      `Enables developers to evaluate key engineering trade-offs (e.g., execution speed vs memory consumption).`,
      `Follows production industry standards that simplify automated testing, debugging, and continuous delivery.`
    ]
  };
}

/**
 * Get study answer for a student's question (Uses Gemini AI when active)
 */
export async function getStudyAnswer(question, studentId = "stu_c9842a1", studentProfile = {}) {
  const cleanedQuestion = cleanQuestion(question);
  const lowerQ = cleanedQuestion.toLowerCase();

  let matchedAnswer = null;

  // 1. Try Gemini AI First for full real-time intelligence
  if (isGeminiActive()) {
    try {
      matchedAnswer = await generateGeminiStudyAnswer(cleanedQuestion, studentProfile);
    } catch (err) {
      console.warn("Gemini call error:", err.message);
    }
  }

  // 2. Check for conversational greetings if Gemini didn't return
  if (!matchedAnswer) {
    if (GREETING_REGEX.test(cleanedQuestion)) {
      matchedAnswer = {
        topic: '👋 Welcome to CampusAid Academic Copilot',
        explanation: 'Hello! I am your 24/7 AI Academic Mentor and Study Assistant powered by Google Gemini. I am here to help you master complex computer science topics, prepare for semester examinations, and sharpen your technical interview skills. Ask me anything!',
        example: 'Try asking me: "What is Python?", "Explain CAP theorem", or "Where is India located?"',
        keyPoints: [
          'Ask any general, theoretical, or coding question.',
          'Every answer includes a conceptual breakdown, a concrete example, and 3 key points.',
          'Sessions are recorded and linked to your career roadmap for revision.'
        ]
      };
    } else {
      // Check predefined catalog or dynamic fallback
      for (const item of TOPIC_CATALOG) {
        if (item.matcher(lowerQ)) {
          matchedAnswer = item.answer;
          break;
        }
      }

      if (!matchedAnswer) {
        matchedAnswer = synthesizeDynamicAnswer(cleanedQuestion);
      }
    }
  }

  const sessionId = "sess_" + Math.random().toString(36).substring(2, 9);

  return {
    studentId,
    sessionId,
    question: cleanedQuestion,
    answer: matchedAnswer,
    timestamp: new Date().toISOString()
  };
}
