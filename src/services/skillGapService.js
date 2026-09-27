/**
 * CampusAid AI - Skill Gap Service
 * 
 * Target AWS Integration:
 * - DynamoDB Table: CampusAid_Skills (Partition Key: studentId, Sort Key: skillName)
 * 
 * Matches Data Structure:
 * Skill: { studentId, skillName, currentLevel, targetLevel, status }
 */

// In-memory mock skills database (scale: 1 to 5, where 5 is Industry Mastery)
let mockSkills = [
  {
    studentId: "stu_c9842a1",
    skillName: "Python",
    category: "Programming & Automation",
    currentLevel: 4,
    targetLevel: 5,
    status: "in-progress",
    notes: "Solid on async programming & scripting; target is advanced concurrency & design patterns."
  },
  {
    studentId: "stu_c9842a1",
    skillName: "Linux & Bash",
    category: "Operating Systems",
    currentLevel: 4,
    targetLevel: 4,
    status: "mastered",
    notes: "Proficient in permissions, systemd services, SSH tunneling, and shell automation."
  },
  {
    studentId: "stu_c9842a1",
    skillName: "AWS Cloud Core",
    category: "Cloud Infrastructure",
    currentLevel: 3,
    targetLevel: 5,
    status: "in-progress",
    notes: "Familiar with IAM, EC2, S3, and VPC; working toward Solutions Architect Associate standard."
  },
  {
    studentId: "stu_c9842a1",
    skillName: "Docker",
    category: "Containerization",
    currentLevel: 2,
    targetLevel: 4,
    status: "needs-focus",
    notes: "Can write basic Dockerfiles; needs practice with multi-stage builds and security best practices."
  },
  {
    studentId: "stu_c9842a1",
    skillName: "Terraform (IaC)",
    category: "Cloud Infrastructure",
    currentLevel: 1,
    targetLevel: 4,
    status: "needs-focus",
    notes: "Basic understanding of declarative syntax; needs state locking, modules, and workspace setup."
  },
  {
    studentId: "stu_c9842a1",
    skillName: "Kubernetes (K8s)",
    category: "Containerization",
    currentLevel: 1,
    targetLevel: 4,
    status: "not-started",
    notes: "Targeting Pod lifecycles, Deployments, ConfigMaps, and Ingress controllers."
  },
  {
    studentId: "stu_c9842a1",
    skillName: "CI/CD Pipelines",
    category: "DevOps & Tooling",
    currentLevel: 3,
    targetLevel: 4,
    status: "in-progress",
    notes: "Built GitHub Actions workflows for testing; next step is automated deployment to AWS."
  }
];

/**
 * Fetch all skill records for a student
 * Simulates DynamoDB QueryCommand with KeyConditionExpression: "studentId = :sid"
 * 
 * @param {string} studentId 
 * @returns {Promise<Array<typeof mockSkills[0]>>}
 */
export async function getSkillGaps(studentId = "stu_c9842a1") {
  // --- Target AWS DynamoDB Pattern ---
  /*
  const command = new QueryCommand({
    TableName: "CampusAid_Skills",
    KeyConditionExpression: "studentId = :sid",
    ExpressionAttributeValues: { ":sid": studentId }
  });
  const response = await ddbDocClient.send(command);
  return response.Items;
  */

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockSkills]);
    }, 150);
  });
}

/**
 * Update the current level of a skill
 * Simulates DynamoDB UpdateCommand
 * 
 * @param {string} studentId 
 * @param {string} skillName 
 * @param {number} newCurrentLevel 
 * @returns {Promise<typeof mockSkills[0]>}
 */
export async function updateSkillLevel(studentId, skillName, newCurrentLevel) {
  const index = mockSkills.findIndex(
    (s) => s.studentId === studentId && s.skillName.toLowerCase() === skillName.toLowerCase()
  );

  if (index !== -1) {
    const skill = mockSkills[index];
    skill.currentLevel = Math.max(1, Math.min(5, newCurrentLevel));
    if (skill.currentLevel >= skill.targetLevel) {
      skill.status = "mastered";
    } else if (skill.targetLevel - skill.currentLevel >= 2) {
      skill.status = "needs-focus";
    } else {
      skill.status = "in-progress";
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...skill }), 120);
    });
  }

  throw new Error(`Skill ${skillName} not found`);
}
