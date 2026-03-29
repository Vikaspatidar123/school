import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...\n");

  // ==================== CLEAR EXISTING DATA ====================
  await prisma.transportAllocation.deleteMany();
  await prisma.route.deleteMany();
  await prisma.bookIssue.deleteMany();
  await prisma.book.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.result.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.fee.deleteMany();
  await prisma.timetable.deleteMany();
  await prisma.leave.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.message.deleteMany();
  await prisma.event.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();

  // ==================== USERS ====================
  // Admin
  const adminUser = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@school.com",
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
      status: "active",
    },
  });

  // Teachers (3)
  const teacherPassword = await bcrypt.hash("teacher123", 10);
  const teacherUsers = await Promise.all([
    prisma.user.create({
      data: { name: "Rajesh Kumar", email: "rajesh@school.com", password: teacherPassword, role: "teacher" },
    }),
    prisma.user.create({
      data: { name: "Priya Sharma", email: "priya.sharma@school.com", password: teacherPassword, role: "teacher" },
    }),
    prisma.user.create({
      data: { name: "Anand Verma", email: "anand@school.com", password: teacherPassword, role: "teacher" },
    }),
  ]);

  const teachers = await Promise.all([
    prisma.teacher.create({
      data: {
        userId: teacherUsers[0].id,
        employeeId: "TCH001",
        subject: "Mathematics",
        qualification: "M.Sc Mathematics",
        experience: "10 years",
        phone: "9876543210",
        salary: 45000,
        joinDate: new Date(2018, 5, 1),
      },
    }),
    prisma.teacher.create({
      data: {
        userId: teacherUsers[1].id,
        employeeId: "TCH002",
        subject: "Science",
        qualification: "M.Sc Physics",
        experience: "8 years",
        phone: "9876543211",
        salary: 42000,
        joinDate: new Date(2019, 3, 15),
      },
    }),
    prisma.teacher.create({
      data: {
        userId: teacherUsers[2].id,
        employeeId: "TCH003",
        subject: "English",
        qualification: "M.A English",
        experience: "12 years",
        phone: "9876543212",
        salary: 48000,
        joinDate: new Date(2016, 7, 1),
      },
    }),
  ]);

  // Parents (3)
  const parentPassword = await bcrypt.hash("parent123", 10);
  const parentUsers = await Promise.all([
    prisma.user.create({
      data: { name: "Suresh Patel", email: "suresh@school.com", password: parentPassword, role: "parent" },
    }),
    prisma.user.create({
      data: { name: "Meena Devi", email: "meena@school.com", password: parentPassword, role: "parent" },
    }),
    prisma.user.create({
      data: { name: "Ramesh Gupta", email: "ramesh@school.com", password: parentPassword, role: "parent" },
    }),
  ]);

  const parents = await Promise.all([
    prisma.parent.create({
      data: { userId: parentUsers[0].id, phone: "9876500001", occupation: "Business" },
    }),
    prisma.parent.create({
      data: { userId: parentUsers[1].id, phone: "9876500002", occupation: "Teacher" },
    }),
    prisma.parent.create({
      data: { userId: parentUsers[2].id, phone: "9876500003", occupation: "Engineer" },
    }),
  ]);

  // ==================== SUBJECTS ====================
  const subjects = await Promise.all([
    prisma.subject.create({ data: { name: "Mathematics", code: "MATH" } }),
    prisma.subject.create({ data: { name: "English", code: "ENG" } }),
    prisma.subject.create({ data: { name: "Science", code: "SCI" } }),
    prisma.subject.create({ data: { name: "Hindi", code: "HIN" } }),
    prisma.subject.create({ data: { name: "Social Studies", code: "SST" } }),
    prisma.subject.create({ data: { name: "Computer Science", code: "CS" } }),
  ]);

  // ==================== CLASSES ====================
  const classes = await Promise.all([
    prisma.class.create({ data: { name: "9", section: "A", capacity: 40, teacherId: teachers[0].id } }),
    prisma.class.create({ data: { name: "9", section: "B", capacity: 40, teacherId: teachers[1].id } }),
    prisma.class.create({ data: { name: "10", section: "A", capacity: 40, teacherId: teachers[2].id } }),
    prisma.class.create({ data: { name: "10", section: "B", capacity: 40, teacherId: teachers[0].id } }),
  ]);

  // ==================== STUDENTS (15) ====================
  const studentPassword = await bcrypt.hash("student123", 10);
  const studentNames = [
    "Amit Sharma", "Priya Singh", "Rahul Patel", "Neha Gupta", "Vikash Kumar",
    "Anita Devi", "Ravi Verma", "Sunita Yadav", "Deepak Tiwari", "Meena Kumari",
    "Aarav Joshi", "Isha Reddy", "Karan Malhotra", "Divya Nair", "Rohan Das",
  ];

  const studentRecords = [];
  for (let i = 0; i < studentNames.length; i++) {
    const studentUser = await prisma.user.create({
      data: {
        name: studentNames[i],
        email: `student${i + 1}@school.com`,
        password: studentPassword,
        role: "student",
      },
    });

    // Distribute across 4 classes: 0-3 -> 9A, 4-7 -> 9B, 8-11 -> 10A, 12-14 -> 10B
    const classIndex = i < 4 ? 0 : i < 8 ? 1 : i < 12 ? 2 : 3;
    // Distribute across 3 parents
    const parentIndex = i % 3;

    const student = await prisma.student.create({
      data: {
        userId: studentUser.id,
        classId: classes[classIndex].id,
        parentId: parents[parentIndex].id,
        rollNo: `${i + 1}`.padStart(3, "0"),
        admissionNo: `ADM2025${(i + 1).toString().padStart(3, "0")}`,
        admissionDate: new Date(2025, 3, 1),
        dob: new Date(2010 - Math.floor(i / 8), (i % 12), (i + 1) * 2),
        gender: i % 2 === 0 ? "Male" : "Female",
        bloodGroup: ["A+", "B+", "O+", "AB+", "A-"][i % 5],
        address: `${i + 10} School Lane, District ${i + 1}`,
        phone: `98765${(10000 + i).toString()}`,
      },
    });

    studentRecords.push(student);
  }

  // ==================== TIMETABLE ====================
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  const periods = [
    { start: "09:00", end: "09:45" },
    { start: "09:50", end: "10:35" },
    { start: "10:50", end: "11:35" },
    { start: "11:40", end: "12:25" },
    { start: "13:00", end: "13:45" },
  ];
  const rooms = ["Room 101", "Room 102", "Room 201", "Room 202"];

  for (let ci = 0; ci < classes.length; ci++) {
    for (const day of days) {
      for (let p = 0; p < periods.length; p++) {
        const subjectIndex = (ci + p) % subjects.length;
        const teacherIndex = p % teachers.length;
        await prisma.timetable.create({
          data: {
            classId: classes[ci].id,
            subjectId: subjects[subjectIndex].id,
            teacherId: teachers[teacherIndex].id,
            day,
            startTime: periods[p].start,
            endTime: periods[p].end,
            room: rooms[ci],
          },
        });
      }
    }
  }

  // ==================== ASSIGNMENTS (5) ====================
  const assignmentData = [
    { title: "Algebra Homework Ch-5", description: "Solve exercises 5.1 to 5.4", subject: "Mathematics", classIdx: 0, teacherIdx: 0, dayOffset: 7 },
    { title: "Essay on Climate Change", description: "Write a 500-word essay on climate change effects", subject: "English", classIdx: 1, teacherIdx: 2, dayOffset: 5 },
    { title: "Physics Lab Report", description: "Write a lab report on the pendulum experiment", subject: "Science", classIdx: 2, teacherIdx: 1, dayOffset: 10 },
    { title: "Hindi Poem Analysis", description: "Analyze the poem from chapter 7", subject: "Hindi", classIdx: 0, teacherIdx: 2, dayOffset: 3 },
    { title: "Computer Science Project", description: "Build a simple calculator using Python", subject: "Computer Science", classIdx: 3, teacherIdx: 0, dayOffset: 14 },
  ];

  for (const a of assignmentData) {
    await prisma.assignment.create({
      data: {
        title: a.title,
        description: a.description,
        classId: classes[a.classIdx].id,
        teacherId: teachers[a.teacherIdx].id,
        subject: a.subject,
        dueDate: new Date(Date.now() + a.dayOffset * 24 * 60 * 60 * 1000),
        totalMarks: 50,
      },
    });
  }

  // ==================== BOOKS (10) ====================
  const booksData = [
    { title: "Mathematics for Class 10", author: "R.D. Sharma", isbn: "978-0001", category: "Textbook", quantity: 15, available: 12, shelf: "A1" },
    { title: "Science Fundamentals", author: "H.C. Verma", isbn: "978-0002", category: "Textbook", quantity: 10, available: 8, shelf: "A2" },
    { title: "English Grammar & Composition", author: "Wren & Martin", isbn: "978-0003", category: "Textbook", quantity: 12, available: 10, shelf: "A3" },
    { title: "Hindi Sahitya", author: "Premchand", isbn: "978-0004", category: "Literature", quantity: 8, available: 6, shelf: "B1" },
    { title: "History of India", author: "Bipan Chandra", isbn: "978-0005", category: "Reference", quantity: 5, available: 4, shelf: "B2" },
    { title: "Computer Science with Python", author: "Sumita Arora", isbn: "978-0006", category: "Textbook", quantity: 10, available: 9, shelf: "C1" },
    { title: "The Adventures of Tom Sawyer", author: "Mark Twain", isbn: "978-0007", category: "Fiction", quantity: 6, available: 5, shelf: "D1" },
    { title: "A Brief History of Time", author: "Stephen Hawking", isbn: "978-0008", category: "Science", quantity: 4, available: 3, shelf: "D2" },
    { title: "Wings of Fire", author: "A.P.J. Abdul Kalam", isbn: "978-0009", category: "Biography", quantity: 7, available: 6, shelf: "D3" },
    { title: "The Discovery of India", author: "Jawaharlal Nehru", isbn: "978-0010", category: "History", quantity: 5, available: 4, shelf: "D4" },
  ];

  const books = [];
  for (const b of booksData) {
    const book = await prisma.book.create({ data: b });
    books.push(book);
  }

  // Book Issues (issue some books to students)
  const bookIssues = [
    { bookIdx: 0, studentIdx: 0, daysAgo: 10, dueDays: 4 },
    { bookIdx: 1, studentIdx: 2, daysAgo: 7, dueDays: 7 },
    { bookIdx: 6, studentIdx: 5, daysAgo: 5, dueDays: 9 },
    { bookIdx: 3, studentIdx: 8, daysAgo: 14, dueDays: 0, returned: true },
    { bookIdx: 7, studentIdx: 12, daysAgo: 3, dueDays: 11 },
  ];

  for (const bi of bookIssues) {
    const issueDate = new Date(Date.now() - bi.daysAgo * 24 * 60 * 60 * 1000);
    const dueDate = new Date(Date.now() + bi.dueDays * 24 * 60 * 60 * 1000);
    await prisma.bookIssue.create({
      data: {
        bookId: books[bi.bookIdx].id,
        studentId: studentRecords[bi.studentIdx].id,
        issueDate,
        dueDate,
        returnDate: bi.returned ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) : undefined,
        status: bi.returned ? "returned" : "issued",
      },
    });
  }

  // ==================== ROUTES (2 bus routes) ====================
  const route1 = await prisma.route.create({
    data: {
      name: "Route 1 - North Zone",
      stops: JSON.stringify(["Main Gate", "Sector 5", "Sector 12", "Market Square", "Railway Station"]),
      driver: "Mahesh Singh",
      busNo: "SMS-001",
      capacity: 40,
    },
  });

  const route2 = await prisma.route.create({
    data: {
      name: "Route 2 - South Zone",
      stops: JSON.stringify(["Main Gate", "Green Park", "Lake View", "Old Town", "Bus Stand"]),
      driver: "Sunil Yadav",
      busNo: "SMS-002",
      capacity: 35,
    },
  });

  // Transport Allocations
  for (let i = 0; i < 8; i++) {
    const route = i < 4 ? route1 : route2;
    const stops = JSON.parse(route.stops);
    await prisma.transportAllocation.create({
      data: {
        routeId: route.id,
        studentId: studentRecords[i].id,
        stopName: stops[i % stops.length],
      },
    });
  }

  // ==================== EVENTS (5 upcoming) ====================
  const eventsData = [
    { title: "Annual Sports Day", description: "Inter-class sports competition", date: new Date(2026, 3, 15), endDate: new Date(2026, 3, 16), type: "event" },
    { title: "Parent-Teacher Meeting", description: "Quarterly PTM for all classes", date: new Date(2026, 4, 5), type: "meeting" },
    { title: "Summer Break", description: "Summer vacation begins", date: new Date(2026, 4, 20), endDate: new Date(2026, 5, 30), type: "holiday" },
    { title: "Science Exhibition", description: "Students showcase their science projects", date: new Date(2026, 3, 25), type: "event" },
    { title: "Final Exam Begins", description: "End of year examination for all classes", date: new Date(2026, 3, 1), endDate: new Date(2026, 3, 12), type: "exam" },
  ];

  for (const e of eventsData) {
    await prisma.event.create({ data: e });
  }

  // ==================== ANNOUNCEMENTS (3) ====================
  const announcementsData = [
    { title: "Uniform Change Notice", content: "Starting next month, students must wear the new summer uniform. Please purchase from the school store.", targetRole: "all", priority: "high", authorId: adminUser.id },
    { title: "Staff Meeting on Friday", content: "All teaching staff are required to attend the meeting in the conference hall at 3 PM.", targetRole: "teacher", priority: "normal", authorId: adminUser.id },
    { title: "Fee Payment Reminder", content: "Please ensure all pending fees are cleared before April 15th to avoid late charges.", targetRole: "parent", priority: "urgent", authorId: adminUser.id },
  ];

  for (const a of announcementsData) {
    await prisma.announcement.create({ data: a });
  }

  // ==================== NOTIFICATIONS (for admin) ====================
  const notificationsData = [
    { userId: adminUser.id, title: "New Admission Request", message: "A new admission application has been submitted for Class 9A.", type: "info", link: "/dashboard/students" },
    { userId: adminUser.id, title: "Fee Collection Alert", message: "15 students have overdue fees for this month.", type: "warning", link: "/dashboard/fees" },
    { userId: adminUser.id, title: "Leave Request", message: "Teacher Rajesh Kumar has requested leave from April 5 to April 7.", type: "info", link: "/dashboard/leaves" },
    { userId: adminUser.id, title: "System Update", message: "The school management system will undergo maintenance on Sunday.", type: "info" },
    { userId: adminUser.id, title: "Exam Results Published", message: "Mid-Term 2026 results have been published for Class 10A.", type: "success", link: "/dashboard/exams" },
  ];

  for (const n of notificationsData) {
    await prisma.notification.create({ data: n });
  }

  // ==================== LEAVES (for teachers) ====================
  const leavesData = [
    { teacherId: teachers[0].id, startDate: new Date(2026, 3, 5), endDate: new Date(2026, 3, 7), reason: "Family function", type: "casual", status: "approved" },
    { teacherId: teachers[1].id, startDate: new Date(2026, 3, 10), endDate: new Date(2026, 3, 10), reason: "Not feeling well", type: "sick", status: "pending" },
    { teacherId: teachers[2].id, startDate: new Date(2026, 3, 20), endDate: new Date(2026, 3, 22), reason: "Personal work", type: "earned", status: "pending" },
    { teacherId: teachers[0].id, startDate: new Date(2026, 2, 15), endDate: new Date(2026, 2, 16), reason: "Doctor appointment", type: "sick", status: "approved" },
  ];

  for (const l of leavesData) {
    await prisma.leave.create({ data: l });
  }

  // ==================== PERMISSIONS ====================
  const modules = ["dashboard", "students", "teachers", "classes", "attendance", "fees", "exams", "timetable", "library", "transport", "leaves", "announcements", "events", "notifications", "settings"];
  const actions = ["view", "create", "edit", "delete"];
  const roles = ["admin", "teacher", "parent", "student"];

  const rolePermissions: Record<string, Record<string, string[]>> = {
    admin: {
      view: modules,
      create: modules,
      edit: modules,
      delete: modules,
    },
    teacher: {
      view: ["dashboard", "students", "classes", "attendance", "exams", "timetable", "library", "leaves", "announcements", "events", "notifications"],
      create: ["attendance", "exams", "leaves", "assignments"],
      edit: ["attendance", "exams", "leaves"],
      delete: [],
    },
    parent: {
      view: ["dashboard", "students", "attendance", "fees", "exams", "timetable", "library", "announcements", "events", "notifications"],
      create: [],
      edit: [],
      delete: [],
    },
    student: {
      view: ["dashboard", "attendance", "fees", "exams", "timetable", "library", "announcements", "events", "notifications"],
      create: [],
      edit: [],
      delete: [],
    },
  };

  for (const role of roles) {
    for (const action of actions) {
      const allowedModules = rolePermissions[role][action] || [];
      for (const mod of allowedModules) {
        await prisma.permission.create({
          data: { module: mod, action, role },
        });
      }
    }
  }

  // ==================== ATTENDANCE (last 14 days) ====================
  const attendanceStatuses = ["present", "present", "present", "present", "absent", "late", "half_day"];

  for (const student of studentRecords) {
    for (let d = 1; d <= 14; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      date.setHours(0, 0, 0, 0);
      // Skip weekends
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      await prisma.attendance.create({
        data: {
          studentId: student.id,
          date,
          status: attendanceStatuses[Math.floor(Math.random() * attendanceStatuses.length)],
          markedBy: teachers[0].id,
        },
      });
    }
  }

  // ==================== FEES ====================
  const feeStatuses = ["paid", "pending", "overdue", "partial"];

  for (let i = 0; i < studentRecords.length; i++) {
    // Tuition fee
    await prisma.fee.create({
      data: {
        studentId: studentRecords[i].id,
        amount: 5000,
        type: "tuition",
        status: feeStatuses[i % 4],
        dueDate: new Date(2026, 3, 15),
        paidDate: i % 4 === 0 ? new Date() : undefined,
        paidAmount: i % 4 === 0 ? 5000 : i % 4 === 3 ? 2500 : undefined,
        fine: i % 4 === 2 ? 200 : 0,
        receiptNo: i % 4 === 0 ? `RCP${(1000 + i).toString()}` : undefined,
        paymentMode: i % 4 === 0 ? "online" : undefined,
      },
    });

    // Transport fee
    await prisma.fee.create({
      data: {
        studentId: studentRecords[i].id,
        amount: 1500,
        type: "transport",
        status: i % 2 === 0 ? "paid" : "pending",
        dueDate: new Date(2026, 3, 15),
        paidDate: i % 2 === 0 ? new Date() : undefined,
        paidAmount: i % 2 === 0 ? 1500 : undefined,
        paymentMode: i % 2 === 0 ? "cash" : undefined,
      },
    });

    // Exam fee
    if (i < 10) {
      await prisma.fee.create({
        data: {
          studentId: studentRecords[i].id,
          amount: 800,
          type: "exam",
          status: "paid",
          dueDate: new Date(2026, 2, 1),
          paidDate: new Date(2026, 1, 25),
          paidAmount: 800,
          receiptNo: `RCPE${(2000 + i).toString()}`,
          paymentMode: "online",
        },
      });
    }
  }

  // ==================== EXAMS AND RESULTS ====================
  const examsData = [
    { name: "Mid-Term 2026", classIdx: 2, subject: "Mathematics", date: new Date(2026, 2, 15), totalMarks: 100, passingMarks: 33, examType: "midterm" },
    { name: "Mid-Term 2026", classIdx: 2, subject: "Science", date: new Date(2026, 2, 17), totalMarks: 100, passingMarks: 33, examType: "midterm" },
    { name: "Unit Test 3", classIdx: 0, subject: "Mathematics", date: new Date(2026, 1, 20), totalMarks: 50, passingMarks: 17, examType: "unit" },
    { name: "Unit Test 3", classIdx: 1, subject: "English", date: new Date(2026, 1, 22), totalMarks: 50, passingMarks: 17, examType: "unit" },
  ];

  for (const e of examsData) {
    const exam = await prisma.exam.create({
      data: {
        name: e.name,
        classId: classes[e.classIdx].id,
        subject: e.subject,
        date: e.date,
        totalMarks: e.totalMarks,
        passingMarks: e.passingMarks,
        examType: e.examType,
      },
    });

    // Create results for students in that class
    const classStudents = studentRecords.filter((_, idx) => {
      if (e.classIdx === 0) return idx < 4;
      if (e.classIdx === 1) return idx >= 4 && idx < 8;
      if (e.classIdx === 2) return idx >= 8 && idx < 12;
      return idx >= 12;
    });

    for (let si = 0; si < classStudents.length; si++) {
      const marks = Math.floor(Math.random() * (e.totalMarks * 0.5)) + e.totalMarks * 0.4;
      const percentage = (marks / e.totalMarks) * 100;
      const grade = percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B+" : percentage >= 60 ? "B" : percentage >= 50 ? "C" : percentage >= 33 ? "D" : "F";

      await prisma.result.create({
        data: {
          studentId: classStudents[si].id,
          examId: exam.id,
          marks,
          grade,
          rank: si + 1,
        },
      });
    }
  }

  // ==================== PRACTICE TESTS ====================
  const practiceTestsData = [
    {
      title: "Mathematics - Algebra Basics",
      subject: "Mathematics",
      totalMarks: 10,
      duration: 15,
      questions: JSON.stringify([
        { id: 1, question: "What is the value of x in: 2x + 6 = 14?", options: ["2", "4", "6", "8"], correct: "4" },
        { id: 2, question: "Simplify: 3(x + 2) - x", options: ["2x + 6", "4x + 6", "2x + 2", "3x + 6"], correct: "2x + 6" },
        { id: 3, question: "What is 5² + 3²?", options: ["34", "64", "16", "25"], correct: "34" },
        { id: 4, question: "If a = 3, b = 4, what is a² + b²?", options: ["7", "12", "25", "49"], correct: "25" },
        { id: 5, question: "Factor: x² - 9", options: ["(x+3)(x-3)", "(x+9)(x-1)", "(x-3)²", "(x+3)²"], correct: "(x+3)(x-3)" },
        { id: 6, question: "What is the slope of y = 3x + 7?", options: ["7", "3", "10", "1"], correct: "3" },
        { id: 7, question: "Solve: x/4 = 8", options: ["2", "12", "32", "4"], correct: "32" },
        { id: 8, question: "What is √144?", options: ["11", "12", "13", "14"], correct: "12" },
        { id: 9, question: "What is 15% of 200?", options: ["15", "20", "30", "35"], correct: "30" },
        { id: 10, question: "If 3x = 27, what is x?", options: ["3", "6", "9", "27"], correct: "9" },
      ]),
    },
    {
      title: "Science - Physics Fundamentals",
      subject: "Science",
      totalMarks: 10,
      duration: 20,
      questions: JSON.stringify([
        { id: 1, question: "What is the SI unit of force?", options: ["Watt", "Joule", "Newton", "Pascal"], correct: "Newton" },
        { id: 2, question: "Speed of light is approximately:", options: ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"], correct: "3×10⁸ m/s" },
        { id: 3, question: "Which law states F = ma?", options: ["First Law", "Second Law", "Third Law", "Law of Gravity"], correct: "Second Law" },
        { id: 4, question: "What is the unit of electric current?", options: ["Volt", "Ohm", "Ampere", "Watt"], correct: "Ampere" },
        { id: 5, question: "Acceleration due to gravity on Earth is:", options: ["8.9 m/s²", "9.8 m/s²", "10.8 m/s²", "7.8 m/s²"], correct: "9.8 m/s²" },
        { id: 6, question: "Energy cannot be created or destroyed. This is:", options: ["Newton's Law", "Law of Conservation of Energy", "Ohm's Law", "Boyle's Law"], correct: "Law of Conservation of Energy" },
        { id: 7, question: "What instrument measures atmospheric pressure?", options: ["Thermometer", "Barometer", "Ammeter", "Voltmeter"], correct: "Barometer" },
        { id: 8, question: "What type of lens is used in magnifying glass?", options: ["Concave", "Convex", "Plano", "Cylindrical"], correct: "Convex" },
        { id: 9, question: "What is the formula for kinetic energy?", options: ["mgh", "½mv²", "Fd", "P×t"], correct: "½mv²" },
        { id: 10, question: "Sound travels fastest in:", options: ["Vacuum", "Air", "Water", "Steel"], correct: "Steel" },
      ]),
    },
    {
      title: "English - Grammar Test",
      subject: "English",
      totalMarks: 10,
      duration: 15,
      questions: JSON.stringify([
        { id: 1, question: "Choose the correct form: 'She ___ to school every day.'", options: ["go", "goes", "going", "gone"], correct: "goes" },
        { id: 2, question: "Which is a proper noun?", options: ["city", "London", "river", "mountain"], correct: "London" },
        { id: 3, question: "Identify the adjective: 'The tall building collapsed.'", options: ["The", "tall", "building", "collapsed"], correct: "tall" },
        { id: 4, question: "What is the past tense of 'swim'?", options: ["swimmed", "swam", "swum", "swimming"], correct: "swam" },
        { id: 5, question: "Which sentence is correct?", options: ["Their going home.", "They're going home.", "There going home.", "Theyre going home."], correct: "They're going home." },
        { id: 6, question: "'Quickly' is what part of speech?", options: ["Noun", "Verb", "Adjective", "Adverb"], correct: "Adverb" },
        { id: 7, question: "Choose the synonym of 'happy':", options: ["Sad", "Joyful", "Angry", "Tired"], correct: "Joyful" },
        { id: 8, question: "What is the plural of 'child'?", options: ["Childs", "Children", "Childes", "Childrens"], correct: "Children" },
        { id: 9, question: "Which is a conjunction?", options: ["Quickly", "And", "Beautiful", "Run"], correct: "And" },
        { id: 10, question: "Identify the preposition: 'The cat sat on the mat.'", options: ["cat", "sat", "on", "mat"], correct: "on" },
      ]),
    },
    {
      title: "Hindi - व्याकरण परीक्षा",
      subject: "Hindi",
      totalMarks: 10,
      duration: 15,
      questions: JSON.stringify([
        { id: 1, question: "'राम' शब्द में कौन सी संज्ञा है?", options: ["जातिवाचक", "व्यक्तिवाचक", "भाववाचक", "समूहवाचक"], correct: "व्यक्तिवाचक" },
        { id: 2, question: "'सुंदर' शब्द क्या है?", options: ["संज्ञा", "सर्वनाम", "विशेषण", "क्रिया"], correct: "विशेषण" },
        { id: 3, question: "हिंदी में कितने वचन होते हैं?", options: ["एक", "दो", "तीन", "चार"], correct: "दो" },
        { id: 4, question: "'दूध' शब्द का लिंग क्या है?", options: ["पुल्लिंग", "स्त्रीलिंग", "नपुंसकलिंग", "उभयलिंग"], correct: "पुल्लिंग" },
        { id: 5, question: "'गायक' का स्त्रीलिंग क्या है?", options: ["गायिका", "गायकी", "गाने वाली", "गायन"], correct: "गायिका" },
        { id: 6, question: "संधि का अर्थ है:", options: ["जोड़ना", "तोड़ना", "मिलाना", "अलग करना"], correct: "मिलाना" },
        { id: 7, question: "'पुस्तकालय' में कौन सा समास है?", options: ["तत्पुरुष", "द्वंद्व", "बहुव्रीहि", "अव्ययीभाव"], correct: "तत्पुरुष" },
        { id: 8, question: "'नमक' का पर्यायवाची है:", options: ["लवण", "मिठास", "खटास", "तीखा"], correct: "लवण" },
        { id: 9, question: "वाक्य के कितने अंग होते हैं?", options: ["एक", "दो", "तीन", "चार"], correct: "दो" },
        { id: 10, question: "'प्रत्यय' किसे कहते हैं?", options: ["शब्द के आगे लगने वाला", "शब्द के पीछे लगने वाला", "शब्द के बीच में", "कोई नहीं"], correct: "शब्द के पीछे लगने वाला" },
      ]),
    },
    {
      title: "Computer Science - Basics",
      subject: "Computer Science",
      totalMarks: 10,
      duration: 15,
      questions: JSON.stringify([
        { id: 1, question: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit"], correct: "Central Processing Unit" },
        { id: 2, question: "Which is an input device?", options: ["Monitor", "Printer", "Keyboard", "Speaker"], correct: "Keyboard" },
        { id: 3, question: "1 KB equals:", options: ["1000 bytes", "1024 bytes", "1024 bits", "100 bytes"], correct: "1024 bytes" },
        { id: 4, question: "What language do computers understand?", options: ["English", "Python", "Binary", "Java"], correct: "Binary" },
        { id: 5, question: "HTML stands for:", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"], correct: "Hyper Text Markup Language" },
        { id: 6, question: "Which is NOT an operating system?", options: ["Windows", "Linux", "Chrome", "macOS"], correct: "Chrome" },
        { id: 7, question: "RAM stands for:", options: ["Random Access Memory", "Read Access Memory", "Run Application Memory", "Real Active Memory"], correct: "Random Access Memory" },
        { id: 8, question: "What does URL stand for?", options: ["Universal Resource Locator", "Uniform Resource Locator", "United Resource Link", "Universal Reference Link"], correct: "Uniform Resource Locator" },
        { id: 9, question: "Which protocol is used for secure websites?", options: ["HTTP", "FTP", "HTTPS", "SMTP"], correct: "HTTPS" },
        { id: 10, question: "What is the brain of a computer?", options: ["Monitor", "RAM", "CPU", "Hard Disk"], correct: "CPU" },
      ]),
    },
  ];

  for (const pt of practiceTestsData) {
    await prisma.practiceTest.create({ data: pt });
  }

  // ==================== MESSAGES ====================
  // Some demo messages between students and teachers
  const studentUser1 = await prisma.user.findUnique({ where: { email: "student1@school.com" } });
  if (studentUser1) {
    await prisma.message.create({
      data: {
        senderId: studentUser1.id,
        receiverId: teacherUsers[0].id,
        subject: "Doubt in Chapter 5",
        content: "Sir, I have a doubt in the algebra section of Chapter 5. Can you please explain the factoring method?",
      },
    });
    await prisma.message.create({
      data: {
        senderId: teacherUsers[0].id,
        receiverId: studentUser1.id,
        subject: "Re: Doubt in Chapter 5",
        content: "Sure! The factoring method involves finding two numbers that multiply to give the constant term and add up to the coefficient of x. I'll explain in detail during tomorrow's class.",
        read: true,
      },
    });
  }

  // ==================== PRINT LOGIN CREDENTIALS ====================
  console.log("\n===========================================");
  console.log("  SEED DATA CREATED SUCCESSFULLY!");
  console.log("===========================================\n");
  console.log("Login Credentials:");
  console.log("-------------------------------------------");
  console.log("  Admin:");
  console.log("    Email:    admin@school.com");
  console.log("    Password: admin123");
  console.log("");
  console.log("  Teachers:");
  console.log("    Email:    rajesh@school.com");
  console.log("    Email:    priya.sharma@school.com");
  console.log("    Email:    anand@school.com");
  console.log("    Password: teacher123");
  console.log("");
  console.log("  Parents:");
  console.log("    Email:    suresh@school.com");
  console.log("    Email:    meena@school.com");
  console.log("    Email:    ramesh@school.com");
  console.log("    Password: parent123");
  console.log("");
  console.log("  Students:");
  console.log("    Email:    student1@school.com ... student15@school.com");
  console.log("    Password: student123");
  console.log("-------------------------------------------\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
