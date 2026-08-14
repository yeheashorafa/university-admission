export type AcademicBranch = "scientific" | "literary" | "industrial";

export type Program = {
  id: string;
  title: string;
  faculty: string;
  description: string;
  branches: AcademicBranch[];
  admissionRate: number;
  isEligible: boolean;
  studentRate?: number;
};

export type ProgramDetails = Program & {
  duration: string;
  degree: string;
  language: string;
  tuition: string;
  overview: string;
  requirements: string[];
  outcomes: string[];
  careerPaths: string[];
  studyPlan: {
    year: string;
    courses: string[];
  }[];
};

export type FacultyId =
  | "informationTechnology"
  | "engineering"
  | "medicine"
  | "healthSciences"
  | "science"
  | "education"
  | "shariaLaw"
  | "business";

export type BranchKey = "scientific" | "literary" | "industrial";

export type ProgramAvailability = "open" | "closed";

export type AcademicProgram = {
  id: string;
  programKey: string;
  descriptionKey: string;
  degreeKey: "bachelor" | "diploma";
  durationYears: number;
  minAverage: number;
  branchKeys: BranchKey[];
  availability: ProgramAvailability;
};

export type AcademicFaculty = {
  id: FacultyId;
  nameKey: string;
  descriptionKey: string;
  programs: AcademicProgram[];
};

export const facultiesMock: AcademicFaculty[] = [
  {
    id: "informationTechnology",
    nameKey: "informationTechnology",
    descriptionKey: "informationTechnology",
    programs: [
      {
        id: "software-engineering",
        programKey: "softwareEngineering",
        descriptionKey: "softwareEngineering",
        degreeKey: "bachelor",
        durationYears: 4,
        minAverage: 80,
        branchKeys: ["scientific", "industrial"],
        availability: "open",
      },
      {
        id: "computer-science",
        programKey: "computerScience",
        descriptionKey: "computerScience",
        degreeKey: "bachelor",
        durationYears: 4,
        minAverage: 75,
        branchKeys: ["scientific", "industrial"],
        availability: "open",
      },
      {
        id: "multimedia-technology",
        programKey: "multimediaTechnology",
        descriptionKey: "multimediaTechnology",
        degreeKey: "bachelor",
        durationYears: 4,
        minAverage: 70,
        branchKeys: ["scientific", "industrial"],
        availability: "open",
      },
    ],
  },
  {
    id: "engineering",
    nameKey: "engineering",
    descriptionKey: "engineering",
    programs: [
      {
        id: "civil-engineering",
        programKey: "civilEngineering",
        descriptionKey: "civilEngineering",
        degreeKey: "bachelor",
        durationYears: 5,
        minAverage: 80,
        branchKeys: ["scientific", "industrial"],
        availability: "open",
      },
      {
        id: "computer-engineering",
        programKey: "computerEngineering",
        descriptionKey: "computerEngineering",
        degreeKey: "bachelor",
        durationYears: 5,
        minAverage: 82,
        branchKeys: ["scientific", "industrial"],
        availability: "open",
      },
      {
        id: "architecture-engineering",
        programKey: "architectureEngineering",
        descriptionKey: "architectureEngineering",
        degreeKey: "bachelor",
        durationYears: 5,
        minAverage: 80,
        branchKeys: ["scientific", "industrial"],
        availability: "closed",
      },
    ],
  },
  {
    id: "medicine",
    nameKey: "medicine",
    descriptionKey: "medicine",
    programs: [
      {
        id: "medicine",
        programKey: "medicine",
        descriptionKey: "medicine",
        degreeKey: "bachelor",
        durationYears: 6,
        minAverage: 95,
        branchKeys: ["scientific"],
        availability: "open",
      },
    ],
  },
  {
    id: "healthSciences",
    nameKey: "healthSciences",
    descriptionKey: "healthSciences",
    programs: [
      {
        id: "nursing",
        programKey: "nursing",
        descriptionKey: "nursing",
        degreeKey: "bachelor",
        durationYears: 4,
        minAverage: 75,
        branchKeys: ["scientific"],
        availability: "open",
      },
      {
        id: "medical-laboratory",
        programKey: "medicalLaboratory",
        descriptionKey: "medicalLaboratory",
        degreeKey: "bachelor",
        durationYears: 4,
        minAverage: 78,
        branchKeys: ["scientific"],
        availability: "open",
      },
    ],
  },
  {
    id: "science",
    nameKey: "science",
    descriptionKey: "science",
    programs: [
      {
        id: "biology",
        programKey: "biology",
        descriptionKey: "biology",
        degreeKey: "bachelor",
        durationYears: 4,
        minAverage: 70,
        branchKeys: ["scientific"],
        availability: "open",
      },
      {
        id: "mathematics",
        programKey: "mathematics",
        descriptionKey: "mathematics",
        degreeKey: "bachelor",
        durationYears: 4,
        minAverage: 70,
        branchKeys: ["scientific"],
        availability: "open",
      },
    ],
  },
  {
    id: "education",
    nameKey: "education",
    descriptionKey: "education",
    programs: [
      {
        id: "english-education",
        programKey: "englishEducation",
        descriptionKey: "englishEducation",
        degreeKey: "bachelor",
        durationYears: 4,
        minAverage: 65,
        branchKeys: ["scientific", "literary"],
        availability: "open",
      },
      {
        id: "arabic-education",
        programKey: "arabicEducation",
        descriptionKey: "arabicEducation",
        degreeKey: "bachelor",
        durationYears: 4,
        minAverage: 65,
        branchKeys: ["scientific", "literary"],
        availability: "open",
      },
    ],
  },
  {
    id: "shariaLaw",
    nameKey: "shariaLaw",
    descriptionKey: "shariaLaw",
    programs: [
      {
        id: "sharia",
        programKey: "sharia",
        descriptionKey: "sharia",
        degreeKey: "bachelor",
        durationYears: 4,
        minAverage: 65,
        branchKeys: ["scientific", "literary"],
        availability: "open",
      },
      {
        id: "law",
        programKey: "law",
        descriptionKey: "law",
        degreeKey: "bachelor",
        durationYears: 4,
        minAverage: 70,
        branchKeys: ["scientific", "literary"],
        availability: "open",
      },
    ],
  },
  {
    id: "business",
    nameKey: "business",
    descriptionKey: "business",
    programs: [
      {
        id: "accounting",
        programKey: "accounting",
        descriptionKey: "accounting",
        degreeKey: "bachelor",
        durationYears: 4,
        minAverage: 65,
        branchKeys: ["scientific", "literary"],
        availability: "open",
      },
      {
        id: "business-administration",
        programKey: "businessAdministration",
        descriptionKey: "businessAdministration",
        degreeKey: "bachelor",
        durationYears: 4,
        minAverage: 65,
        branchKeys: ["scientific", "literary"],
        availability: "open",
      },
    ],
  },
];

export const programsMock: Program[] = [
  {
    id: "medicine",
    title: "Medicine and Surgery",
    faculty: "Faculty of Medicine",
    description:
      "A distinguished program that prepares competent doctors with modern medical knowledge and clinical skills to serve the community.",
    branches: ["scientific"],
    admissionRate: 95,
    isEligible: true,
  },
  {
    id: "software-engineering",
    title: "Software Engineering",
    faculty: "Faculty of Engineering",
    description:
      "A program focused on designing, developing, and maintaining software systems using modern engineering methodologies.",
    branches: ["scientific", "industrial"],
    admissionRate: 80,
    isEligible: true,
  },
  {
    id: "data-ai",
    title: "Data Science and Artificial Intelligence",
    faculty: "Faculty of Information Technology",
    description:
      "A modern program that combines statistics, computer science, and intelligent systems to extract knowledge from data.",
    branches: ["scientific"],
    admissionRate: 85,
    isEligible: false,
    studentRate: 82,
  },
  {
    id: "accounting",
    title: "Accounting",
    faculty: "Faculty of Commerce",
    description:
      "A program that develops accounting, auditing, and financial reporting skills for business and institutional environments.",
    branches: ["scientific", "literary"],
    admissionRate: 70,
    isEligible: true,
  },
  {
    id: "english",
    title: "English Language and Literature",
    faculty: "Faculty of Arts",
    description:
      "A program that strengthens language, literature, translation, and communication skills for academic and professional careers.",
    branches: ["literary"],
    admissionRate: 65,
    isEligible: true,
  },
];

export const programDetailsMock: ProgramDetails[] = [
  {
    id: "software-engineering",
    title: "Software Engineering",
    faculty: "Faculty of Engineering",
    description:
      "A program focused on designing, developing, testing, and maintaining software systems using modern engineering practices.",
    branches: ["scientific", "industrial"],
    admissionRate: 80,
    isEligible: true,
    duration: "4 years",
    degree: "Bachelor",
    language: "Arabic / English",
    tuition: "To be announced",
    overview:
      "The Software Engineering program prepares students to build reliable, scalable, and secure software solutions. Students learn programming, databases, software architecture, project management, quality assurance, and modern development workflows.",
    requirements: [
      "High school certificate from an eligible branch.",
      "Minimum admission rate of 80%.",
      "Valid personal ID or passport.",
      "Certified high school transcript.",
      "Completion of the electronic admission application.",
    ],
    outcomes: [
      "Analyze user needs and translate them into software requirements.",
      "Design and implement software systems using modern technologies.",
      "Apply testing, quality assurance, and documentation practices.",
      "Work effectively within software teams and agile environments.",
      "Understand ethical and professional responsibilities in software development.",
    ],
    careerPaths: [
      "Software Engineer",
      "Frontend Developer",
      "Backend Developer",
      "Quality Assurance Engineer",
      "Systems Analyst",
      "Product Engineer",
    ],
    studyPlan: [
      {
        year: "Year 1",
        courses: [
          "Programming Fundamentals",
          "Calculus",
          "Computer Skills",
          "Discrete Mathematics",
        ],
      },
      {
        year: "Year 2",
        courses: [
          "Data Structures",
          "Object-Oriented Programming",
          "Database Systems",
          "Computer Networks",
        ],
      },
      {
        year: "Year 3",
        courses: [
          "Software Engineering",
          "Web Development",
          "Operating Systems",
          "Software Testing",
        ],
      },
      {
        year: "Year 4",
        courses: [
          "Software Architecture",
          "Project Management",
          "Graduation Project",
          "Professional Training",
        ],
      },
    ],
  },
  {
    id: "medicine",
    title: "Medicine and Surgery",
    faculty: "Faculty of Medicine",
    description:
      "A distinguished program that prepares competent doctors with modern medical knowledge and clinical skills.",
    branches: ["scientific"],
    admissionRate: 95,
    isEligible: true,
    duration: "6 years",
    degree: "Bachelor",
    language: "Arabic / English",
    tuition: "To be announced",
    overview:
      "The Medicine and Surgery program prepares students with the scientific knowledge, clinical skills, and ethical foundations required to practice medicine and serve the community.",
    requirements: [
      "Scientific high school branch.",
      "Minimum admission rate of 95%.",
      "Valid personal ID or passport.",
      "Certified high school transcript.",
      "Additional admission requirements may apply.",
    ],
    outcomes: [
      "Understand human anatomy, physiology, and pathology.",
      "Apply clinical reasoning in diagnosis and treatment.",
      "Communicate effectively with patients and healthcare teams.",
      "Follow medical ethics and professional standards.",
    ],
    careerPaths: [
      "Physician",
      "Medical Resident",
      "Clinical Researcher",
      "Public Health Specialist",
    ],
    studyPlan: [
      {
        year: "Years 1-2",
        courses: ["Basic Medical Sciences", "Anatomy", "Physiology", "Biochemistry"],
      },
      {
        year: "Years 3-4",
        courses: ["Pathology", "Pharmacology", "Microbiology", "Clinical Skills"],
      },
      {
        year: "Years 5-6",
        courses: ["Clinical Rotations", "Internal Medicine", "Surgery", "Pediatrics"],
      },
    ],
  },
  {
    id: "data-ai",
    title: "Data Science and Artificial Intelligence",
    faculty: "Faculty of Information Technology",
    description:
      "A modern program that combines statistics, computer science, and intelligent systems to extract knowledge from data.",
    branches: ["scientific"],
    admissionRate: 85,
    isEligible: false,
    studentRate: 82,
    duration: "4 years",
    degree: "Bachelor",
    language: "Arabic / English",
    tuition: "To be announced",
    overview:
      "This program focuses on data analysis, machine learning, artificial intelligence, statistics, and intelligent applications. Students learn how to collect, process, analyze, and model data to support decision-making.",
    requirements: [
      "Scientific high school branch.",
      "Minimum admission rate of 85%.",
      "Strong background in mathematics is recommended.",
      "Certified high school transcript.",
    ],
    outcomes: [
      "Analyze and visualize complex datasets.",
      "Build machine learning and AI models.",
      "Use statistical methods for data-driven decisions.",
      "Develop intelligent applications and data pipelines.",
    ],
    careerPaths: [
      "Data Analyst",
      "Data Scientist",
      "Machine Learning Engineer",
      "AI Developer",
      "Business Intelligence Specialist",
    ],
    studyPlan: [
      {
        year: "Year 1",
        courses: ["Programming Fundamentals", "Calculus", "Statistics", "Computer Skills"],
      },
      {
        year: "Year 2",
        courses: ["Data Structures", "Database Systems", "Probability", "Python for Data"],
      },
      {
        year: "Year 3",
        courses: ["Machine Learning", "Data Mining", "AI Principles", "Big Data"],
      },
      {
        year: "Year 4",
        courses: ["Deep Learning", "NLP", "Graduation Project", "Professional Training"],
      },
    ],
  },
  {
  id: "accounting",
  title: "Accounting",
  faculty: "Faculty of Commerce",
  description:
    "A program that develops accounting, auditing, and financial reporting skills for business and institutional environments.",
  branches: ["scientific", "literary"],
  admissionRate: 70,
  isEligible: true,
  duration: "4 years",
  degree: "Bachelor",
  language: "Arabic / English",
  tuition: "To be announced",
  overview:
    "The Accounting program prepares students with the knowledge and practical skills needed in accounting, auditing, taxation, financial analysis, and financial reporting.",
  requirements: [
    "High school certificate from an eligible branch.",
    "Minimum admission rate of 70%.",
    "Valid personal ID or passport.",
    "Certified high school transcript.",
    "Completion of the electronic admission application.",
  ],
  outcomes: [
    "Prepare and analyze financial statements.",
    "Apply accounting principles in business and institutional settings.",
    "Understand auditing procedures and internal control systems.",
    "Use financial information to support decision-making.",
    "Apply ethical and professional standards in accounting practice.",
  ],
  careerPaths: [
    "Accountant",
    "Auditor",
    "Financial Analyst",
    "Tax Officer",
    "Internal Controller",
    "Accounting Manager",
  ],
  studyPlan: [
    {
      year: "Year 1",
      courses: [
        "Principles of Accounting",
        "Principles of Management",
        "Business Mathematics",
        "Computer Skills",
      ],
    },
    {
      year: "Year 2",
      courses: [
        "Intermediate Accounting",
        "Cost Accounting",
        "Business Law",
        "Statistics",
      ],
    },
    {
      year: "Year 3",
      courses: [
        "Auditing",
        "Tax Accounting",
        "Financial Management",
        "Accounting Information Systems",
      ],
    },
    {
      year: "Year 4",
      courses: [
        "Advanced Accounting",
        "Financial Analysis",
        "Graduation Project",
        "Professional Training",
      ],
    },
  ],
},
{
  id: "english",
  title: "English Language and Literature",
  faculty: "Faculty of Arts",
  description:
    "A program that strengthens language, literature, translation, and communication skills for academic and professional careers.",
  branches: ["literary"],
  admissionRate: 65,
  isEligible: true,
  duration: "4 years",
  degree: "Bachelor",
  language: "English / Arabic",
  tuition: "To be announced",
  overview:
    "The English Language and Literature program develops students' skills in English communication, literary analysis, translation, linguistics, and academic writing.",
  requirements: [
    "High school certificate from an eligible branch.",
    "Minimum admission rate of 65%.",
    "Valid personal ID or passport.",
    "Certified high school transcript.",
    "Completion of the electronic admission application.",
  ],
  outcomes: [
    "Communicate effectively in English in academic and professional contexts.",
    "Analyze literary texts using critical and cultural approaches.",
    "Apply translation skills between Arabic and English.",
    "Use linguistic concepts to understand language structure and usage.",
    "Produce clear academic and professional written work.",
  ],
  careerPaths: [
    "English Teacher",
    "Translator",
    "Content Writer",
    "Editor",
    "Media Specialist",
    "Academic Research Assistant",
  ],
  studyPlan: [
    {
      year: "Year 1",
      courses: [
        "English Grammar",
        "Reading Skills",
        "Writing Skills",
        "Introduction to Literature",
      ],
    },
    {
      year: "Year 2",
      courses: [
        "Phonetics and Phonology",
        "Translation Principles",
        "British Literature",
        "Academic Writing",
      ],
    },
    {
      year: "Year 3",
      courses: [
        "Linguistics",
        "American Literature",
        "Advanced Translation",
        "Research Methods",
      ],
    },
    {
      year: "Year 4",
      courses: [
        "Comparative Literature",
        "Discourse Analysis",
        "Graduation Project",
        "Professional Training",
      ],
    },
  ],
},
];

