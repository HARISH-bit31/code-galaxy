const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Folder = require('./models/Folder');
const File = require('./models/File');
const User = require('./models/User');

async function seed() {
  await mongoose.connect('mongodb+srv://Harish:<codegalaxy>@cluster0.drisb4r.mongodb.net/?appName=Cluster0');
  console.log('Connected to MongoDB for seeding...');

  // wipe existing data
  await User.deleteMany({});
  await Subject.deleteMany({});
  await Folder.deleteMany({});
  await File.deleteMany({});

  // create users
  const users = await User.insertMany([
    { name: 'Student', email: 'student@demo.com', password: '123456' },
    { name: 'Alice Kumar', email: 'alice@demo.com', password: 'alice123' },
    { name: 'Bob Sharma', email: 'bob@demo.com', password: 'bob123' },
    { name: 'Charlie Patel', email: 'charlie@demo.com', password: 'charlie123' },
    { name: 'Diana Rao', email: 'diana@demo.com', password: 'diana123' },
    { name: 'Ethan Verma', email: 'ethan@demo.com', password: 'ethan123' }
  ]);
  console.log(`Seeded ${users.length} users`);

  // subject templates
  const subjectTemplates = [
    { name: 'C', description: 'C Programming Lab' },
    { name: 'C++', description: 'Object Oriented Programming' },
    { name: 'Java', description: 'Advanced Java Lab' },
    { name: 'DS', description: 'Data Structures' },
    { name: 'DBMS', description: 'Database Management Systems' },
    { name: 'FST', description: 'Full Stack Technologies' }
  ];

  // per-user folder data
  const userFolderData = [
    [
      { subject: 'C', folders: ['Week 1: Basics', 'Week 2: Pointers'] },
      { subject: 'Java', folders: ['Experiment 1: Classes', 'Experiment 2: Inheritance'] },
      { subject: 'FST', folders: ['React Routing', 'Node.js Basics'] }
    ],
    [
      { subject: 'C', folders: ['Lab 1: Variables', 'Lab 2: Loops'] },
      { subject: 'C++', folders: ['Lab 1: OOP Concepts', 'Lab 2: Templates'] },
      { subject: 'DS', folders: ['Stacks & Queues', 'Trees'] }
    ],
    [
      { subject: 'Java', folders: ['Servlets', 'JDBC Connections'] },
      { subject: 'DBMS', folders: ['SQL Basics', 'Normalization'] },
      { subject: 'FST', folders: ['Angular Components', 'Express API'] }
    ],
    [
      { subject: 'C', folders: ['Arrays Lab', 'Strings Lab'] },
      { subject: 'DS', folders: ['Linked Lists', 'Graph Algorithms'] },
      { subject: 'DBMS', folders: ['ER Diagrams', 'Transactions'] }
    ],
    [
      { subject: 'C++', folders: ['Polymorphism', 'File Handling'] },
      { subject: 'Java', folders: ['Multithreading', 'Collections'] },
      { subject: 'FST', folders: ['React Hooks', 'MongoDB CRUD'] }
    ],
    [
      { subject: 'C', folders: ['Functions Lab', 'Recursion Lab'] },
      { subject: 'C++', folders: ['STL Basics', 'Exception Handling'] },
      { subject: 'Java', folders: ['Spring Boot', 'REST APIs'] }
    ]
  ];

  // per-user file data
  const userFileData = [
    { 'Week 1: Basics': [{ name: 'hello_world.c', content: '#include <stdio.h>\nint main() {\n  printf("Hello!");\n  return 0;\n}' }], 'Experiment 1: Classes': [{ name: 'Main.java', content: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Student demo");\n  }\n}' }] },
    { 'Lab 1: Variables': [{ name: 'variables.c', content: '#include <stdio.h>\nint main() {\n  int x = 10;\n  printf("x = %d", x);\n  return 0;\n}' }], 'Lab 1: OOP Concepts': [{ name: 'Shape.cpp', content: '#include <iostream>\nclass Shape {\npublic:\n  virtual void draw() {}\n};' }] },
    { 'Servlets': [{ name: 'HelloServlet.java', content: 'import javax.servlet.*;\npublic class HelloServlet extends HttpServlet {\n  // Bob\'s servlet\n}' }], 'SQL Basics': [{ name: 'queries.sql', content: 'SELECT * FROM students WHERE grade = \'A\';\nINSERT INTO courses VALUES (1, \'DBMS\');' }] },
    { 'Arrays Lab': [{ name: 'array_sort.c', content: '#include <stdio.h>\nvoid bubbleSort(int arr[], int n) {\n  // Charlie\'s sort implementation\n}' }], 'Linked Lists': [{ name: 'linkedlist.c', content: 'struct Node {\n  int data;\n  struct Node* next;\n};\n// Charlie\'s linked list' }] },
    { 'Polymorphism': [{ name: 'poly_demo.cpp', content: '#include <iostream>\nclass Animal {\npublic:\n  virtual void speak() { std::cout << "..."; }\n};\n// Diana\'s polymorphism demo' }], 'React Hooks': [{ name: 'useCounter.js', content: 'import { useState } from "react";\nexport function useCounter() {\n  const [count, setCount] = useState(0);\n  return { count, increment: () => setCount(c => c + 1) };\n}' }] },
    { 'Functions Lab': [{ name: 'factorial.c', content: '#include <stdio.h>\nint factorial(int n) {\n  return n <= 1 ? 1 : n * factorial(n - 1);\n}\n// Ethan\'s factorial' }], 'Spring Boot': [{ name: 'Application.java', content: 'import org.springframework.boot.*;\n@SpringBootApplication\npublic class Application {\n  public static void main(String[] args) {\n    SpringApplication.run(Application.class, args);\n  }\n}' }] }
  ];

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const uid = user._id.toString();

    // subjects
    const subjects = await Subject.insertMany(
      subjectTemplates.map(s => ({ ...s, userId: uid }))
    );
    const subMap = {};
    subjects.forEach(s => subMap[s.name] = s._id.toString());

    // folders
    const folderEntries = userFolderData[i] || [];
    const folMap = {};
    for (const entry of folderEntries) {
      const subjectId = subMap[entry.subject];
      if (!subjectId) continue;
      for (const folderName of entry.folders) {
        const folder = await Folder.create({ name: folderName, parentId: subjectId, userId: uid });
        folMap[folderName] = folder._id.toString();
      }
    }

    // files
    const fileEntries = userFileData[i] || {};
    for (const [folderName, files] of Object.entries(fileEntries)) {
      const folderId = folMap[folderName];
      if (!folderId) continue;
      for (const f of files) {
        await File.create({ name: f.name, content: f.content, folderId, userId: uid, isFavorite: false, isImportant: false });
      }
    }

    console.log(`Seeded data for ${user.name}`);
  }

  console.log('Seeding complete!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
