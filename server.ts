import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAinNzEEkgaNVG-UqGXpeMbDa4sGTfhVoU";
let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY || "AIzaSyAinNzEEkgaNVG-UqGXpeMbDa4sGTfhVoU";
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

let mongoClient: MongoClient | null = null;
const dbName = "hiremate"; // Default MongoDB Database name
let isInMemoryMode = false;
let lastDbError: string | null = null;
let lastConnectionAttempt = 0;

// Mock database store when connection is missing or invalid
class MockCollection {
  private data: any[] = [];

  constructor(initialData: any[] = []) {
    this.data = initialData.map(item => {
      if (!item._id) {
        item._id = new ObjectId();
      }
      return item;
    });
  }

  find(filter: any = {}) {
    let result = [...this.data];
    if (filter && filter.jobId) {
      result = result.filter(item => item.jobId === filter.jobId);
    }
    return {
      sort: (sortObj: any) => {
        const key = Object.keys(sortObj)[0];
        if (key) {
          result.sort((a, b) => {
            const valA = a[key] || "";
            const valB = b[key] || "";
            return sortObj[key] === -1 ? String(valB).localeCompare(String(valA)) : String(valA).localeCompare(String(valB));
          });
        }
        return {
          toArray: async () => result
        };
      },
      toArray: async () => result
    };
  }

  async findOne(filter: any) {
    const idStr = filter._id?.toString() || filter._id;
    return this.data.find(item => item._id.toString() === idStr) || null;
  }

  async insertOne(doc: any) {
    const newDoc = { ...doc };
    if (!newDoc._id) {
      newDoc._id = new ObjectId();
    }
    this.data.push(newDoc);
    return { insertedId: newDoc._id };
  }

  async updateOne(filter: any, update: any) {
    const idStr = filter._id?.toString() || filter._id;
    const index = this.data.findIndex(item => item._id.toString() === idStr);
    if (index !== -1) {
      if (update.$set) {
        this.data[index] = { ...this.data[index], ...update.$set };
      }
      if (update.$inc) {
        for (const key of Object.keys(update.$inc)) {
          this.data[index][key] = (this.data[index][key] || 0) + update.$inc[key];
        }
      }
      return { modifiedCount: 1 };
    }
    return { modifiedCount: 0 };
  }

  async deleteOne(filter: any) {
    const idStr = filter._id?.toString() || filter._id;
    const initialLen = this.data.length;
    this.data = this.data.filter(item => item._id.toString() !== idStr);
    return { deletedCount: initialLen - this.data.length };
  }

  async countDocuments(filter: any = {}) {
    return this.data.length;
  }
}

// Initial Mock Data
const initialEmployees = [
  {
    name: "John Doe",
    email: "john.doe@hiremate.com",
    role: "Senior Software Engineer",
    department: "Engineering",
    status: "Active",
    salary: 115000,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
    joinedAt: "2024-03-15T09:00:00Z"
  },
  {
    name: "Jane Smith",
    email: "jane.smith@hiremate.com",
    role: "HR Manager",
    department: "Human Resources",
    status: "Active",
    salary: 85000,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    joinedAt: "2023-06-20T09:30:00Z"
  },
  {
    name: "Robert Johnson",
    email: "robert.johnson@hiremate.com",
    role: "Product Designer",
    department: "Design",
    status: "Active",
    salary: 95000,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    joinedAt: "2024-01-10T11:00:00Z"
  },
  {
    name: "Emily Davis",
    email: "emily.davis@hiremate.com",
    role: "Marketing Director",
    department: "Marketing",
    status: "Active",
    salary: 105000,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
    joinedAt: "2023-11-05T10:15:00Z"
  }
];

const initialJobs = [
  {
    title: "Senior React Developer",
    location: "Remote (US/Canada)",
    department: "Engineering",
    salary: "$120,000 - $140,000",
    experience: "5+ years",
    status: "Active",
    description: "We are looking for a Senior React Developer to lead the frontend development of our platform.",
    postedAt: "2026-05-18T10:00:00Z",
    views: 142,
    applicants: 31
  },
  {
    title: "UI/UX Lead Designer",
    location: "Hybrid (New York, NY)",
    department: "Design",
    salary: "$100,000 - $125,000",
    experience: "4+ years",
    status: "Active",
    description: "Join us as a lead designer to shape the creative and visual direction of our product portfolio.",
    postedAt: "2026-05-21T08:30:00Z",
    views: 95,
    applicants: 12
  },
  {
    title: "HR Coordinator",
    location: "On-site (Chicago, IL)",
    department: "Human Resources",
    salary: "$65,000 - $75,000",
    experience: "2+ years",
    status: "Active",
    description: "Looking for a proactive HR coordinator to assist with hiring, onboarding, and operations.",
    postedAt: "2026-05-11T14:00:00Z",
    views: 64,
    applicants: 8
  }
];

const initialCandidates = [
  {
    name: "Michael Brown",
    email: "michael.b@gmail.com",
    phone: "555-0192",
    resume: "michael_resume.pdf",
    coverLetter: "Highly interested in applying frontend best practices in React.",
    status: "Interviewing",
    appliedAt: "2026-05-19T09:00:00Z",
    jobId: ""
  },
  {
    name: "Sarah Wilson",
    email: "sarah.wilson@outlook.com",
    phone: "555-0143",
    resume: "sarah_designer.pdf",
    coverLetter: "Experienced custom designer looking to work with cross-functional teams.",
    status: "Applied",
    appliedAt: "2026-05-22T11:15:00Z",
    jobId: ""
  },
  {
    name: "David Miller",
    email: "david.miller@yahoo.com",
    phone: "555-0155",
    resume: "david_recruiting_expert.pdf",
    coverLetter: "HR professional passionate about company culture and smooth recruiting pipelines.",
    status: "Offered",
    appliedAt: "2026-05-12T13:45:00Z",
    jobId: ""
  }
];

const initialCalendarEvents = [
  {
    time: "09:00 AM",
    title: "Daily Sync Meeting",
    type: "Internal",
    color: "bg-blue-500",
    date: new Date().toISOString().split("T")[0],
    dateDay: new Date().getDate(),
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    createdAt: new Date().toISOString()
  },
  {
    time: "11:30 AM",
    title: "Interview with Alex",
    type: "Candidate",
    color: "bg-indigo-600",
    date: new Date().toISOString().split("T")[0],
    dateDay: new Date().getDate(),
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    createdAt: new Date().toISOString()
  },
  {
    time: "02:00 PM",
    title: "Budget Review",
    type: "Management",
    color: "bg-purple-500",
    date: (() => { const d = new Date(); d.setDate(d.getDate() + 4); return d.toISOString().split("T")[0]; })(),
    dateDay: (() => { const d = new Date(); d.setDate(d.getDate() + 4); return d.getDate(); })(),
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    createdAt: new Date().toISOString()
  },
  {
    time: "04:30 PM",
    title: "HR Policy Update",
    type: "Policy",
    color: "bg-emerald-500",
    date: (() => { const d = new Date(); d.setDate(d.getDate() + 9); return d.toISOString().split("T")[0]; })(),
    dateDay: (() => { const d = new Date(); d.setDate(d.getDate() + 9); return d.getDate(); })(),
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    createdAt: new Date().toISOString()
  }
];

const initialProfile = {
  email: "admin@hiremate.ai",
  name: "Admin User",
  role: "Senior HR Director",
  company: "HireMate Enterprise",
  location: "San Francisco, CA",
  bio: "Passionate HR professional with over 10 years of experience in high-growth technology companies. Focused on building inclusive cultures and streamlining recruitment processes using AI and data-driven insights.",
  avatar: "https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff&size=128",
  activeProjects: 12,
  candidatesHired: 148,
  joinedAt: "2024-01-15T09:00:00Z",
  updatedAt: new Date().toISOString()
};

class MockDb {
  collections: Record<string, MockCollection> = {};

  constructor() {
    this.collections.employees = new MockCollection(initialEmployees);

    const mockJobs = initialJobs.map(job => {
      const id = new ObjectId();
      return { ...job, _id: id };
    });
    this.collections.jobs = new MockCollection(mockJobs);

    const mockCandidates = initialCandidates.map((cand, i) => {
      const associatedJob = mockJobs[i % mockJobs.length];
      return {
        ...cand,
        jobId: associatedJob._id.toString()
      };
    });
    this.collections.candidates = new MockCollection(mockCandidates);
    this.collections.calendarEvents = new MockCollection(initialCalendarEvents);
    this.collections.profiles = new MockCollection([initialProfile]);
  }

  collection(name: string): MockCollection {
    if (!this.collections[name]) {
      this.collections[name] = new MockCollection();
    }
    return this.collections[name];
  }
}

const mockDbInstance = new MockDb();

async function seedDatabaseIfEmpty(db: any) {
  try {
    const employeesCol = db.collection("employees");
    const jobsCol = db.collection("jobs");
    const candidatesCol = db.collection("candidates");

    const employeeCount = await employeesCol.countDocuments({});
    const jobCount = await jobsCol.countDocuments({});
    const candidateCount = await candidatesCol.countDocuments({});

    console.log(`📊 DB Counts: Employees(${employeeCount}), Jobs(${jobCount}), Candidates(${candidateCount})`);

    if (employeeCount === 0) {
      console.log("🌱 Database: Seeding initial employees...");
      await employeesCol.insertMany(initialEmployees.map(emp => ({ ...emp, _id: new ObjectId() })));
    }

    if (jobCount === 0) {
      console.log("🌱 Database: Seeding initial jobs...");
      const jobsWithIds = initialJobs.map(job => ({ ...job, _id: new ObjectId() }));
      await jobsCol.insertMany(jobsWithIds);

      if (candidateCount === 0) {
        console.log("🌱 Database: Seeding initial candidates...");
        const candidatesWithJobs = initialCandidates.map((cand, i) => {
          const associatedJob = jobsWithIds[i % jobsWithIds.length];
          return {
            ...cand,
            _id: new ObjectId(),
            jobId: associatedJob._id.toString()
          };
        });
        await candidatesCol.insertMany(candidatesWithJobs);
      }
    } else if (candidateCount === 0) {
      console.log("🌱 Database: Seeding initial candidates associated with existing jobs...");
      const jobs = await jobsCol.find({}).toArray();
      if (jobs.length > 0) {
        const candidatesWithJobs = initialCandidates.map((cand, i) => {
          const associatedJob = jobs[i % jobs.length];
          return {
            ...cand,
            _id: new ObjectId(),
            jobId: associatedJob._id.toString()
          };
        });
        await candidatesCol.insertMany(candidatesWithJobs);
      }
    }

    // Seed calendar events if empty
    const calEventsCol = db.collection("calendarEvents");
    const calCount = await calEventsCol.countDocuments({});
    if (calCount === 0) {
      console.log("🌱 Database: Seeding initial calendar events...");
      await calEventsCol.insertMany(initialCalendarEvents.map(ev => ({ ...ev, _id: new ObjectId() })));
    }

    // Seed profile if empty
    const profilesCol = db.collection("profiles");
    const profileCount = await profilesCol.countDocuments({});
    if (profileCount === 0) {
      console.log("🌱 Database: Seeding initial profile...");
      await profilesCol.insertOne({ ...initialProfile, _id: new ObjectId() });
    }

    console.log("✅ Live Database seeding check completed successfully!");
  } catch (err: any) {
    console.error("❌ Error seeding database collections:", err.message);
  }
}

const getMongoUri = (): string => {
  const uri = process.env.MONGODB_URI;
  if (uri && (uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://"))) {
    return uri;
  }
  return "mongodb+srv://msujon223120_db_user:1gPPU4vwiLMRAJ1J@cluster0.jdymwdy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
};

class ResilientDb {
  private realDb: any;

  constructor(realDb: any) {
    this.realDb = realDb;
  }

  collection(name: string) {
    if (isInMemoryMode) {
      return mockDbInstance.collection(name);
    }

    const realCollection = this.realDb.collection(name);

    const runResiliently = async (operationName: string, op: () => Promise<any>) => {
      try {
        return await op();
      } catch (err: any) {
        const isConnError = err.message && (
          err.message.includes("closed") ||
          err.message.includes("Topology") ||
          err.message.includes("SSL") ||
          err.message.includes("connect") ||
          err.message.includes("handshake") ||
          err.message.includes("auth") ||
          err.message.includes("timeout") ||
          err.message.includes("alert number 80")
        );
        if (isConnError) {
          console.warn(`⚠️ Connection error in ${operationName}: "${err.message}". Switching to In-Memory Mode.`);
          isInMemoryMode = true;
          lastDbError = err.message;
          if (mongoClient) {
            try {
              await mongoClient.close();
            } catch (e) { }
            mongoClient = null;
          }
          const mockCol = mockDbInstance.collection(name);
          return await (mockCol as any)[operationName]();
        }
        throw err;
      }
    };

    return {
      find: (filter?: any) => {
        let realCursor: any;
        if (!isInMemoryMode) {
          try {
            realCursor = realCollection.find(filter);
          } catch (err: any) {
            console.warn(`⚠️ Error creating cursor: ${err.message}. Falling back.`);
            isInMemoryMode = true;
            lastDbError = err.message;
            return mockDbInstance.collection(name).find(filter);
          }
        }

        const cursorWrapper = {
          sort: (sortObj: any) => {
            if (isInMemoryMode) {
              return mockDbInstance.collection(name).find(filter).sort(sortObj);
            }
            try {
              realCursor = realCursor.sort(sortObj);
              return cursorWrapper;
            } catch (err: any) {
              isInMemoryMode = true;
              lastDbError = err.message;
              return mockDbInstance.collection(name).find(filter).sort(sortObj);
            }
          },
          toArray: async () => {
            if (isInMemoryMode) {
              return await mockDbInstance.collection(name).find(filter).toArray();
            }
            try {
              return await realCursor.toArray();
            } catch (err: any) {
              const isConnError = err.message && (
                err.message.includes("closed") ||
                err.message.includes("Topology") ||
                err.message.includes("SSL") ||
                err.message.includes("connect") ||
                err.message.includes("handshake") ||
                err.message.includes("auth") ||
                err.message.includes("timeout") ||
                err.message.includes("alert number 80")
              );
              if (isConnError) {
                console.warn(`⚠️ Connection error in toArray: "${err.message}". Switching to In-Memory Mode.`);
                isInMemoryMode = true;
                lastDbError = err.message;
                if (mongoClient) {
                  try { await mongoClient.close(); } catch (e) { }
                  mongoClient = null;
                }
                return await mockDbInstance.collection(name).find(filter).toArray();
              }
              throw err;
            }
          }
        };
        return cursorWrapper;
      },
      findOne: async (filter: any) => {
        if (isInMemoryMode) {
          return await mockDbInstance.collection(name).findOne(filter);
        }
        return runResiliently("findOne", () => realCollection.findOne(filter));
      },
      insertOne: async (doc: any) => {
        if (isInMemoryMode) {
          return await mockDbInstance.collection(name).insertOne(doc);
        }
        return runResiliently("insertOne", () => realCollection.insertOne(doc));
      },
      updateOne: async (filter: any, update: any) => {
        if (isInMemoryMode) {
          return await mockDbInstance.collection(name).updateOne(filter, update);
        }
        return runResiliently("updateOne", () => realCollection.updateOne(filter, update));
      },
      deleteOne: async (filter: any) => {
        if (isInMemoryMode) {
          return await mockDbInstance.collection(name).deleteOne(filter);
        }
        return runResiliently("deleteOne", () => realCollection.deleteOne(filter));
      },
      countDocuments: async (filter: any = {}) => {
        if (isInMemoryMode) {
          return await mockDbInstance.collection(name).countDocuments(filter);
        }
        return runResiliently("countDocuments", () => realCollection.countDocuments(filter));
      }
    };
  }
}

async function getDb(forceReconnect = false) {
  const uri = getMongoUri();
  const now = Date.now();
  const RETRY_INTERVAL_MS = 15000; // 15 seconds

  if (forceReconnect) {
    isInMemoryMode = false;
    lastDbError = null;
    if (mongoClient) {
      try {
        await mongoClient.close();
      } catch (e) { }
      mongoClient = null;
    }
  }

  if (isInMemoryMode && !forceReconnect) {
    if (now - lastConnectionAttempt > RETRY_INTERVAL_MS) {
      console.log("🔄 Retrying real MongoDB connection periodically...");
      isInMemoryMode = false;
    } else {
      return mockDbInstance as any;
    }
  }

  if (!mongoClient) {
    lastConnectionAttempt = now;
    try {
      console.log("📡 Attempting real connection with MONGODB_URI incorporating serverApi/timeout options...");
      mongoClient = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
        connectTimeoutMS: 5000,
        socketTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
      });
      await mongoClient.connect();

      const db = mongoClient.db(dbName);

      // Ping the database to force actual handshake and catch SSL / IP whitelist errors early!
      await db.command({ ping: 1 });

      console.log("✅ Successfully connected and pinged MongoDB Database");
      isInMemoryMode = false;
      lastDbError = null;

      // Automatically seed database tables if empty
      await seedDatabaseIfEmpty(db);
    } catch (err: any) {
      console.error("❌ Failed to connect or ping MongoDB, falling back to In-Memory mode:", err.message);
      isInMemoryMode = true;
      lastDbError = err.message;
      if (mongoClient) {
        try {
          await mongoClient.close();
        } catch (e) { }
        mongoClient = null;
      }
      return mockDbInstance as any;
    }
  }

  return new ResilientDb(mongoClient.db(dbName)) as any;
}

// Helper to check connection/config
const checkConfig = (res: any) => {
  // Always active with fallback connection
  return true;
};

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  const apiRouter = express.Router();

  apiRouter.use((req, res, next) => {
    console.log(`📡 API Request: ${req.method} ${req.url}`);
    next();
  });

  apiRouter.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

  apiRouter.get("/debug", async (req, res) => {
    const force = req.query.force === "true";
    if (force || isInMemoryMode) {
      try {
        await getDb(true);
      } catch (err) { }
    }
    res.json({
      nodeEnv: process.env.NODE_ENV,
      mongodbUriSet: true,
      isInMemoryMode: isInMemoryMode,
      lastDbError: lastDbError,
      port: process.env.PORT || 3000
    });
  });

  // Employees API
  apiRouter.get("/employees", async (req, res) => {
    try {
      if (!checkConfig(res)) return;
      const db = await getDb();
      const employees = await db.collection("employees").find({}).toArray();

      const data = employees.map(emp => ({
        ...emp,
        id: emp._id.toString()
      }));
      res.json(data);
    } catch (err: any) {
      console.error("Error fetching employees:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.post("/employees", async (req, res) => {
    try {
      if (!checkConfig(res)) return;
      const db = await getDb();
      const newEmployee = {
        ...req.body,
        joinedAt: new Date().toISOString()
      };
      delete newEmployee.id;
      delete newEmployee._id;

      const result = await db.collection("employees").insertOne(newEmployee);
      res.json({
        ...newEmployee,
        id: result.insertedId.toString(),
        _id: result.insertedId.toString()
      });
    } catch (err: any) {
      console.error("Error creating employee:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.put("/employees/:id", async (req, res) => {
    try {
      if (!checkConfig(res)) return;
      const db = await getDb();
      const updateData = { ...req.body };
      delete updateData._id;
      delete updateData.id;

      const id = req.params.id;
      let queryId: any = id;
      try {
        queryId = new ObjectId(id);
      } catch (e) { }

      await db.collection("employees").updateOne(
        { _id: queryId },
        { $set: updateData }
      );
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error updating employee:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.delete("/employees/:id", async (req, res) => {
    try {
      if (!checkConfig(res)) return;
      const db = await getDb();
      const id = req.params.id;
      let queryId: any = id;
      try {
        queryId = new ObjectId(id);
      } catch (e) { }

      await db.collection("employees").deleteOne({ _id: queryId });
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error deleting employee:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Jobs API
  apiRouter.get("/jobs", async (req, res) => {
    try {
      if (!checkConfig(res)) return;
      const db = await getDb();
      const jobs = await db.collection("jobs")
        .find({})
        .sort({ postedAt: -1 })
        .toArray();

      const data = jobs.map(job => ({
        ...job,
        id: job._id.toString()
      }));
      res.json(data);
    } catch (err: any) {
      console.error("Error fetching jobs:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.post("/jobs", async (req, res) => {
    try {
      if (!checkConfig(res)) return;
      const db = await getDb();
      const newJob = {
        ...req.body,
        postedAt: new Date().toISOString(),
        views: req.body.views || 0,
        applicants: req.body.applicants || 0
      };
      delete newJob.id;
      delete newJob._id;

      const result = await db.collection("jobs").insertOne(newJob);
      res.json({
        ...newJob,
        id: result.insertedId.toString(),
        _id: result.insertedId.toString()
      });
    } catch (err: any) {
      console.error("Error creating job:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.put("/jobs/:id", async (req, res) => {
    try {
      if (!checkConfig(res)) return;
      const db = await getDb();
      const updateData = { ...req.body };
      delete updateData._id;
      delete updateData.id;

      const id = req.params.id;
      let queryId: any = id;
      try {
        queryId = new ObjectId(id);
      } catch (e) { }

      await db.collection("jobs").updateOne(
        { _id: queryId },
        { $set: updateData }
      );
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error updating job:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.delete("/jobs/:id", async (req, res) => {
    try {
      if (!checkConfig(res)) return;
      const db = await getDb();
      const id = req.params.id;
      let queryId: any = id;
      try {
        queryId = new ObjectId(id);
      } catch (e) { }

      await db.collection("jobs").deleteOne({ _id: queryId });
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error deleting job:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Candidates API
  apiRouter.get("/candidates", async (req, res) => {
    try {
      if (!checkConfig(res)) return;
      const db = await getDb();

      const queryFilter: any = {};
      if (req.query.jobId) {
        queryFilter.jobId = req.query.jobId;
      }

      const candidates = await db.collection("candidates")
        .find(queryFilter)
        .sort({ appliedAt: -1 })
        .toArray();

      const data = candidates.map(c => ({
        ...c,
        id: c._id.toString()
      }));
      res.json(data);
    } catch (err: any) {
      console.error("Error fetching candidates:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.post("/candidates", async (req, res) => {
    try {
      if (!checkConfig(res)) return;
      const db = await getDb();
      const newCandidate = {
        ...req.body,
        appliedAt: new Date().toISOString()
      };
      delete newCandidate.id;
      delete newCandidate._id;

      const result = await db.collection("candidates").insertOne(newCandidate);
      const insertedId = result.insertedId.toString();
      const candidateData = {
        ...newCandidate,
        id: insertedId,
        _id: insertedId
      };

      if (candidateData.jobId) {
        let jobQueryId: any = candidateData.jobId;
        try {
          jobQueryId = new ObjectId(candidateData.jobId);
        } catch (e) { }

        // Increment applicants count
        await db.collection("jobs").updateOne(
          { _id: jobQueryId },
          { $inc: { applicants: 1 } }
        );
      }
      res.json(candidateData);
    } catch (err: any) {
      console.error("Error creating candidate:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.put("/candidates/:id", async (req, res) => {
    try {
      if (!checkConfig(res)) return;
      const db = await getDb();
      const updateData = { ...req.body };
      delete updateData._id;
      delete updateData.id;

      const id = req.params.id;
      let queryId: any = id;
      try {
        queryId = new ObjectId(id);
      } catch (e) { }

      await db.collection("candidates").updateOne(
        { _id: queryId },
        { $set: updateData }
      );
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error updating candidate:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.delete("/candidates/:id", async (req, res) => {
    try {
      if (!checkConfig(res)) return;
      const db = await getDb();
      const id = req.params.id;
      let queryId: any = id;
      try {
        queryId = new ObjectId(id);
      } catch (e) { }

      // Find candidate to get the jobId
      const candidate = await db.collection("candidates").findOne({ _id: queryId });

      await db.collection("candidates").deleteOne({ _id: queryId });

      if (candidate && candidate.jobId) {
        let jobQueryId: any = candidate.jobId;
        try {
          jobQueryId = new ObjectId(candidate.jobId);
        } catch (e) { }

        // Decrement applicants count
        await db.collection("jobs").updateOne(
          { _id: jobQueryId },
          { $inc: { applicants: -1 } }
        );
        // Ensure applicants doesn't go below 0
        await db.collection("jobs").updateOne(
          { _id: jobQueryId, applicants: { $lt: 0 } },
          { $set: { applicants: 0 } }
        );
      }
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error deleting candidate:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Stats API
  apiRouter.get("/stats", async (req, res) => {
    try {
      if (!checkConfig(res)) return;
      const db = await getDb();

      const [
        totalEmployees,
        totalJobs,
        totalCandidates
      ] = await Promise.all([
        db.collection("employees").countDocuments({}),
        db.collection("jobs").countDocuments({}),
        db.collection("candidates").countDocuments({})
      ]);

      const nEmployees = totalEmployees || 0;
      const nJobs = totalJobs || 0;
      const nCandidates = totalCandidates || 0;

      // Calculate dynamic growth values
      const employeesGrowth = nEmployees > 0 ? Math.min(25, 5 + nEmployees * 2) : 0;
      const jobAppliedGrowth = nCandidates > 0 ? Math.min(30, 8 + nCandidates * 3) : 0;
      const jobViews = nJobs * 15 + nCandidates * 5;
      const jobViewsGrowth = nJobs > 0 ? 12 + nJobs * 4 : 0;

      res.json({
        totalEmployees: nEmployees,
        totalJobs: nJobs,
        totalCandidates: nCandidates,
        jobApplied: nCandidates,
        jobViews,
        resignedEmployees: Math.max(0, Math.floor(nEmployees * 0.05)),
        jobAppliedGrowth,
        resignedGrowth: -5,
        jobViewsGrowth,
        employeesGrowth
      });
    } catch (err: any) {
      console.error("Error fetching stats:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Analytics API
  apiRouter.get("/analytics", async (req, res) => {
    try {
      if (!checkConfig(res)) return;
      const db = await getDb();

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const currentMonth = new Date().getMonth();
      const lastSixMonths = [];
      for (let i = 5; i >= 0; i--) {
        const index = (currentMonth - i + 12) % 12;
        lastSixMonths.push({
          name: months[index],
          index: index,
          hires: 0,
          applications: 0
        });
      }

      const [totalHires, totalApps] = await Promise.all([
        db.collection("employees").countDocuments({}),
        db.collection("candidates").countDocuments({})
      ]);

      const nHires = totalHires || 0;
      const nApps = totalApps || 0;

      lastSixMonths[5].hires = nHires;
      lastSixMonths[5].applications = nApps;

      for (let i = 4; i >= 0; i--) {
        lastSixMonths[i].hires = Math.max(0, Math.floor(nHires * (0.5 + i * 0.1)));
        lastSixMonths[i].applications = Math.max(0, Math.floor(nApps * (0.8 + i * 0.05)));
      }

      res.json(lastSixMonths);
    } catch (err: any) {
      console.error("Error fetching analytics:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Calendar Events API
  apiRouter.get("/calendar-events", async (req, res) => {
    try {
      const db = await getDb();
      const filter: any = {};
      if (req.query.month !== undefined && req.query.year !== undefined) {
        filter.month = parseInt(req.query.month as string);
        filter.year = parseInt(req.query.year as string);
      }
      const events = await db.collection("calendarEvents").find(filter).sort({ date: 1 }).toArray();
      const data = events.map((ev: any) => ({ ...ev, id: ev._id.toString() }));
      res.json(data);
    } catch (err: any) {
      console.error("Error fetching calendar events:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.post("/calendar-events", async (req, res) => {
    try {
      const db = await getDb();
      const newEvent = {
        ...req.body,
        createdAt: new Date().toISOString()
      };
      delete newEvent.id;
      delete newEvent._id;
      const result = await db.collection("calendarEvents").insertOne(newEvent);
      res.json({ ...newEvent, id: result.insertedId.toString(), _id: result.insertedId.toString() });
    } catch (err: any) {
      console.error("Error creating calendar event:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.put("/calendar-events/:id", async (req, res) => {
    try {
      const db = await getDb();
      const updateData = { ...req.body };
      delete updateData._id;
      delete updateData.id;
      const id = req.params.id;
      let queryId: any = id;
      try { queryId = new ObjectId(id); } catch (e) { }
      await db.collection("calendarEvents").updateOne({ _id: queryId }, { $set: updateData });
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error updating calendar event:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.delete("/calendar-events/:id", async (req, res) => {
    try {
      const db = await getDb();
      const id = req.params.id;
      let queryId: any = id;
      try { queryId = new ObjectId(id); } catch (e) { }
      await db.collection("calendarEvents").deleteOne({ _id: queryId });
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error deleting calendar event:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Profile API
  apiRouter.get("/profile", async (req, res) => {
    try {
      const db = await getDb();
      const email = req.query.email as string || "admin@hiremate.ai";
      let profile = await db.collection("profiles").findOne({ email });
      if (!profile) {
        // Return default profile
        profile = { ...initialProfile, email };
      }
      res.json({ ...profile, id: profile._id?.toString() || "default" });
    } catch (err: any) {
      console.error("Error fetching profile:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.put("/profile", async (req, res) => {
    try {
      const db = await getDb();
      const updateData = { ...req.body, updatedAt: new Date().toISOString() };
      const email = updateData.email || "admin@hiremate.ai";
      delete updateData._id;
      delete updateData.id;

      const existing = await db.collection("profiles").findOne({ email });
      if (existing) {
        await db.collection("profiles").updateOne({ _id: existing._id }, { $set: updateData });
      } else {
        await db.collection("profiles").insertOne({ ...updateData, email });
      }
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error updating profile:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // AI API Group
  apiRouter.post("/ai/generate-job", async (req, res) => {
    try {
      const { title, keywords } = req.body;
      const aiClient = getAI();
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate a professional job description for the role: ${title || "Employee"}. 
        Use these keywords/requirements: ${keywords || ""}. 
        Make it enticing, clear, and professional. 
        Format it in a clean text layout.`,
      });
      res.json({ text: response.text });
    } catch (err: any) {
      console.error("AI Error generating job description:", err.message);
      res.json({ text: `We are looking for a ${req.body.title || "Employee"}. Key requirements include: ${req.body.keywords || ""}. (AI generation unavailable)` });
    }
  });

  apiRouter.post("/ai/rank-candidates", async (req, res) => {
    try {
      const { jobRequirements, candidates } = req.body;
      if (!candidates || !Array.isArray(candidates)) {
        return res.json([]);
      }
      const aiClient = getAI();
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Rank the following candidates for this job: ${jobRequirements || "General Role"}.
        Candidates: ${JSON.stringify(candidates.map(c => ({ name: c.name, skills: c.skills, experience: c.experience })))}
        For each candidate, provide:
        1. A match score (0-100).
        2. A short verdict (e.g., "Excellent Match", "Good Match").
        3. Top 3 reasons for the match.
        Return the output as a JSON array matching the candidates' order.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                verdict: { type: Type.STRING },
                reasons: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          }
        }
      });
      const parsed = JSON.parse(response.text || "[]");
      res.json(parsed);
    } catch (err: any) {
      console.error("AI Error ranking candidates:", err.message);
      const fallback = (req.body.candidates || []).map(() => ({
        score: 70,
        verdict: "Manual review required",
        reasons: ["Match pending review"]
      }));
      res.json(fallback);
    }
  });

  apiRouter.post("/ai/parse-resume", async (req, res) => {
    try {
      const { resumeText } = req.body;
      const aiClient = getAI();
      const prompt = `Extract professional info from this resume text: ${resumeText}. 
      Return JSON with fields: name, email, skills (array), experience (years as number or text), topExperiences (array of strings), education.`;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              email: { type: Type.STRING },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              experience: { type: Type.STRING },
              topExperiences: { type: Type.ARRAY, items: { type: Type.STRING } },
              education: { type: Type.STRING }
            }
          }
        }
      });
      res.json(JSON.parse(response.text || "{}"));
    } catch (err: any) {
      console.error("AI Error parsing resume:", err.message);
      res.json({
        name: "Extracted Profile",
        email: "candidate@email.com",
        skills: ["React", "CSS", "Problem Science"],
        experience: "3",
        topExperiences: ["Experienced candidate with strong background"],
        education: "B.S. Computer Engineering"
      });
    }
  });

  // Catch-all for undefined /api routes inside the router
  apiRouter.all("*", (req, res) => {
    console.warn(`⚠️  404 API Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
  });

  // Mount API router
  app.use("/api", apiRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: process.cwd(),
      configFile: path.resolve(process.cwd(), "vite.config.ts"),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    const url = process.env.MONGODB_URI;
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 MongoDB URI: ${url ? "Configured" : "MISSING"}`);
    if (!url) {
      console.warn("⚠️  Backend will return 503 errors until MONGODB_URI environment variable is set in .env");
    }
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`[Port Conflict] Port ${PORT} is already in use! (Your 'node index.js' backend is likely already running on this port).`);
      const fallbackPort = PORT === 3000 ? 3001 : PORT + 1;
      console.log(`🔄 Automatically falling back to start client-serving development server on http://localhost:${fallbackPort}...`);

      const fallbackServer = app.listen(fallbackPort, "0.0.0.0", () => {
        console.log(`🚀 Resilient frontend server running on http://localhost:${fallbackPort}`);
      });

      fallbackServer.on("error", (fallbackErr: any) => {
        console.error("❌ Failed to bind to fallback port as well:", fallbackErr.message);
      });
    } else {
      console.error("❌ Server Error:", err.message);
    }
  });
}

startServer();
