const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function main() {
  console.log("🌱 Starting seed...");

  // ── Admin ──────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("Admin@123", SALT_ROUNDS);
  const admin = await prisma.user.upsert({
    where: { email: "admin@skillassess.io" },
    update: {},
    create: {
      email: "admin@skillassess.io",
      passwordHash: adminHash,
      name: "Platform Admin",
      department: "Engineering",
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // ── Employees ──────────────────────────────────────────────────────────────
  const employees = [
    { name: "Aarav Shah",    email: "aarav@skillassess.io",   department: "Frontend" },
    { name: "Priya Mehta",   email: "priya@skillassess.io",   department: "Fullstack" },
    { name: "Rohan Verma",   email: "rohan@skillassess.io",   department: "Backend" },
    { name: "Sneha Iyer",    email: "sneha@skillassess.io",   department: "Design" },
    { name: "Dev Kapoor",    email: "dev@skillassess.io",     department: "DevOps" },
  ];

  const empHash = await bcrypt.hash("Employee@123", SALT_ROUNDS);
  for (const emp of employees) {
    const user = await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: { ...emp, passwordHash: empHash, role: "EMPLOYEE" },
    });
    console.log(`✅ Employee created: ${user.email}`);
  }

  // ── Questions ──────────────────────────────────────────────────────────────
  const questions = [
    // HTML (4 questions)
    {
      questionText: "Which HTML tag is used to define an internal style sheet?",
      optionA: "<css>",
      optionB: "<style>",
      optionC: "<script>",
      optionD: "<link>",
      correctAnswer: "B",
      topic: "HTML",
    },
    {
      questionText: "What does the 'alt' attribute in an <img> tag specify?",
      optionA: "Image alignment",
      optionB: "Alternate server path",
      optionC: "Alternative text if image fails to load",
      optionD: "Image altitude dimension",
      correctAnswer: "C",
      topic: "HTML",
    },
    {
      questionText: "Which HTML element defines the title of a document?",
      optionA: "<head>",
      optionB: "<meta>",
      optionC: "<title>",
      optionD: "<header>",
      correctAnswer: "C",
      topic: "HTML",
    },
    {
      questionText: "Which input type creates a checkbox in HTML?",
      optionA: 'type="check"',
      optionB: 'type="box"',
      optionC: 'type="tick"',
      optionD: 'type="checkbox"',
      correctAnswer: "D",
      topic: "HTML",
    },

    // CSS (4 questions)
    {
      questionText: "Which CSS property controls the text size?",
      optionA: "text-style",
      optionB: "font-size",
      optionC: "text-size",
      optionD: "font-style",
      correctAnswer: "B",
      topic: "CSS",
    },
    {
      questionText: "What does 'position: absolute' do in CSS?",
      optionA: "Positions element relative to its normal flow",
      optionB: "Positions element relative to the viewport",
      optionC: "Positions element relative to its nearest positioned ancestor",
      optionD: "Removes the element from the page entirely",
      correctAnswer: "C",
      topic: "CSS",
    },
    {
      questionText: "Which CSS property is used to create space between the content and the border?",
      optionA: "margin",
      optionB: "spacing",
      optionC: "border-gap",
      optionD: "padding",
      correctAnswer: "D",
      topic: "CSS",
    },
    {
      questionText: "In Flexbox, which property aligns items along the cross axis?",
      optionA: "justify-content",
      optionB: "align-items",
      optionC: "flex-direction",
      optionD: "flex-wrap",
      correctAnswer: "B",
      topic: "CSS",
    },

    // JavaScript (5 questions)
    {
      questionText: "Which method is used to parse a JSON string in JavaScript?",
      optionA: "JSON.stringify()",
      optionB: "JSON.parse()",
      optionC: "JSON.convert()",
      optionD: "JSON.decode()",
      correctAnswer: "B",
      topic: "JavaScript",
    },
    {
      questionText: "What will 'typeof null' return in JavaScript?",
      optionA: '"null"',
      optionB: '"undefined"',
      optionC: '"object"',
      optionD: '"boolean"',
      correctAnswer: "C",
      topic: "JavaScript",
    },
    {
      questionText: "Which array method does NOT mutate the original array?",
      optionA: "push()",
      optionB: "splice()",
      optionC: "map()",
      optionD: "sort()",
      correctAnswer: "C",
      topic: "JavaScript",
    },
    {
      questionText: "What is the output of: console.log(0.1 + 0.2 === 0.3)?",
      optionA: "true",
      optionB: "false",
      optionC: "undefined",
      optionD: "NaN",
      correctAnswer: "B",
      topic: "JavaScript",
    },
    {
      questionText: "Which keyword creates a block-scoped variable in JavaScript?",
      optionA: "var",
      optionB: "global",
      optionC: "let",
      optionD: "define",
      correctAnswer: "C",
      topic: "JavaScript",
    },

    // React (4 questions)
    {
      questionText: "Which hook is used to perform side effects in a React function component?",
      optionA: "useState",
      optionB: "useRef",
      optionC: "useEffect",
      optionD: "useContext",
      correctAnswer: "C",
      topic: "React",
    },
    {
      questionText: "What does the second argument of useEffect represent?",
      optionA: "The initial state value",
      optionB: "A cleanup function",
      optionC: "The dependency array",
      optionD: "The render priority",
      correctAnswer: "C",
      topic: "React",
    },
    {
      questionText: "What is the virtual DOM in React?",
      optionA: "A server-side rendering technique",
      optionB: "A lightweight copy of the real DOM for diffing",
      optionC: "A CSS-in-JS library",
      optionD: "A state management tool",
      correctAnswer: "B",
      topic: "React",
    },
    {
      questionText: "Which React hook would you use to access a DOM element directly?",
      optionA: "useEffect",
      optionB: "useState",
      optionC: "useMemo",
      optionD: "useRef",
      correctAnswer: "D",
      topic: "React",
    },

    // Problem Solving (3 questions)
    {
      questionText: "What is the time complexity of binary search on a sorted array?",
      optionA: "O(n)",
      optionB: "O(n²)",
      optionC: "O(log n)",
      optionD: "O(1)",
      correctAnswer: "C",
      topic: "Problem Solving",
    },
    {
      questionText: "Which data structure follows the LIFO (Last In, First Out) principle?",
      optionA: "Queue",
      optionB: "Stack",
      optionC: "Linked List",
      optionD: "Tree",
      correctAnswer: "B",
      topic: "Problem Solving",
    },
    {
      questionText: "What does DRY stand for in software development?",
      optionA: "Do Repeat Yourself",
      optionB: "Don't Repeat Yourself",
      optionC: "Define, Run, Yield",
      optionD: "Design, Review, Yield",
      correctAnswer: "B",
      topic: "Problem Solving",
    },
  ];

  for (const q of questions) {
    await prisma.question.create({ data: q });
  }
  console.log(`✅ ${questions.length} questions seeded`);

  console.log("\n🎉 Seed complete!");
  console.log("─────────────────────────────────");
  console.log("Admin     → admin@skillassess.io   / Admin@123");
  console.log("Employees → *@skillassess.io        / Employee@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
