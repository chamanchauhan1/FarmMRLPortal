import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import multer from "multer";
import { storage } from "../../database/storage";
import { generateToken, hashPassword, verifyPassword, authMiddleware, type AuthRequest } from "../middleware/auth";
import { insertUserSchema, loginSchema, insertFarmSchema, insertAnimalSchema, insertTreatmentRecordSchema } from "../../database/schema";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = hashPassword(validatedData.password);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      res.status(201).json({ message: "User created successfully", userId: user.id });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);

      const user = await storage.getUserByUsername(validatedData.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = verifyPassword(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user);
      const { password, ...userWithoutPassword } = user;

      res.json({
        token,
        user: userWithoutPassword,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid data" });
    }
  });

  // Farm routes
  app.get("/api/farms", authMiddleware, async (req, res) => {
    try {
      const farms = await storage.getAllFarms();
      res.json(farms);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch farms" });
    }
  });

  app.post("/api/farms", authMiddleware, async (req, res) => {
    try {
      const validatedData = insertFarmSchema.parse(req.body);
      const farm = await storage.createFarm(validatedData);
      res.status(201).json(farm);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid data" });
    }
  });

  // Animal routes
  app.get("/api/animals", authMiddleware, async (req, res) => {
    try {
      const animals = await storage.getAllAnimals();
      res.json(animals);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch animals" });
    }
  });

  app.post("/api/animals", authMiddleware, async (req, res) => {
    try {
      const validatedData = insertAnimalSchema.parse(req.body);
      const animal = await storage.createAnimal(validatedData);
      res.status(201).json(animal);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid data" });
    }
  });

  // Treatment Record routes
  app.get("/api/treatments", authMiddleware, async (req, res) => {
    try {
      const treatments = await storage.getAllTreatmentRecords();
      res.json(treatments);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch treatments" });
    }
  });

  app.post("/api/treatments", authMiddleware, async (req, res) => {
    try {
      const validatedData = insertTreatmentRecordSchema.parse(req.body);
      const treatment = await storage.createTreatmentRecord(validatedData);
      res.status(201).json(treatment);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid data" });
    }
  });

  // Farm Report routes
  app.get("/api/reports", authMiddleware, async (req, res) => {
    try {
      const reports = await storage.getAllFarmReports();
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch reports" });
    }
  });

  app.post("/api/upload", authMiddleware, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { farmId, reportType, description, uploadedBy } = req.body;

      if (!farmId || !reportType || !uploadedBy) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const fileType = req.file.mimetype.includes("pdf")
        ? "pdf"
        : req.file.mimetype.includes("excel") || req.file.mimetype.includes("spreadsheet")
        ? "excel"
        : "csv";

      const report = await storage.createFarmReport({
        farmId,
        fileName: req.file.originalname,
        fileType,
        fileSize: req.file.size,
        uploadedBy,
        reportType,
        description: description || "",
      });

      res.status(201).json(report);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Upload failed" });
    }
  });

  // Dashboard statistics routes
  app.get("/api/dashboard/stats", authMiddleware, async (req, res) => {
    try {
      const animals = await storage.getAllAnimals();
      const treatments = await storage.getAllTreatmentRecords();
      
      const now = new Date();
      const activeTreatments = treatments.filter((t) => {
        const endDate = new Date(t.withdrawalEndDate);
        return endDate > now;
      });

      const compliantTreatments = treatments.filter((t) => t.complianceStatus === "compliant");
      const complianceRate = treatments.length > 0
        ? Math.round((compliantTreatments.length / treatments.length) * 100)
        : 100;

      const violationCount = treatments.filter((t) => t.complianceStatus === "violation").length;
      const warningCount = treatments.filter((t) => t.complianceStatus === "warning").length;

      res.json({
        totalAnimals: animals.length,
        activeTreatments: activeTreatments.length,
        complianceRate,
        pendingReports: treatments.filter((t) => t.complianceStatus === "pending").length,
        violationCount,
        warningCount,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch stats" });
    }
  });

  app.get("/api/dashboard/trends", authMiddleware, async (req, res) => {
    try {
      const treatments = await storage.getAllTreatmentRecords();
      
      // Generate last 6 months of data
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const now = new Date();
      const trends = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = monthNames[date.getMonth()];
        const year = date.getFullYear();
        
        const monthTreatments = treatments.filter((t) => {
          const treatmentDate = new Date(t.administeredDate);
          return (
            treatmentDate.getMonth() === date.getMonth() &&
            treatmentDate.getFullYear() === date.getFullYear()
          );
        });

        trends.push({
          month: `${monthName} '${year.toString().slice(-2)}`,
          treatments: monthTreatments.length,
        });
      }

      res.json(trends);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch trends" });
    }
  });

  app.get("/api/dashboard/compliance", authMiddleware, async (req, res) => {
    try {
      const treatments = await storage.getAllTreatmentRecords();
      
      const compliance = [
        {
          name: "Compliant",
          value: treatments.filter((t) => t.complianceStatus === "compliant").length,
          color: "hsl(var(--chart-1))",
        },
        {
          name: "Warning",
          value: treatments.filter((t) => t.complianceStatus === "warning").length,
          color: "hsl(var(--chart-4))",
        },
        {
          name: "Violation",
          value: treatments.filter((t) => t.complianceStatus === "violation").length,
          color: "hsl(var(--destructive))",
        },
        {
          name: "Pending",
          value: treatments.filter((t) => t.complianceStatus === "pending").length,
          color: "hsl(var(--muted))",
        },
      ].filter((item) => item.value > 0);

      res.json(compliance);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch compliance data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
