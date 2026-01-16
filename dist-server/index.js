// server/index.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// server/routes/index.ts
import { Router as Router5 } from "express";

// server/routes/auth.routes.ts
import { Router } from "express";

// server/controllers/auth.controller.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// server/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
var prisma = new PrismaClient();

// server/controllers/auth.controller.ts
var AuthController = class {
  async setupStatus(req, res) {
    try {
      const userCount = await prisma.user.count();
      return res.json({ needsSetup: userCount === 0 });
    } catch (error) {
      return res.status(500).json({ error: "Failed to check setup status" });
    }
  }
  async setupAdmin(req, res) {
    const { email, password, name } = req.body;
    try {
      const userCount = await prisma.user.count();
      if (userCount > 0) {
        return res.status(403).json({ error: "Setup already completed" });
      }
      const hashedPassword = await bcrypt.hash(password, 8);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: "admin_ti"
        }
      });
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      const { password: _, ...userWithoutPassword } = user;
      console.log("Setup completed successfully for:", email);
      return res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error("Setup Error Detail:", error);
      return res.status(500).json({
        error: "Setup failed",
        detail: error.message,
        code: error.code
      });
    }
  }
  async register(req, res) {
    const { email, password, name, role } = req.body;
    try {
      if (req.userRole !== "admin_ti") {
        return res.status(403).json({ error: "Access denied: only admin_ti can register new users" });
      }
      const userExists = await prisma.user.findUnique({
        where: { email }
      });
      if (userExists) {
        return res.status(400).json({ error: "User already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 8);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: role || "guest"
        }
      });
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      const { password: _, ...userWithoutPassword } = user;
      return res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Registration failed" });
    }
  }
  async login(req, res) {
    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      const { password: _, ...userWithoutPassword } = user;
      return res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error("Login Error Detail:", error);
      return res.status(500).json({
        error: "Login failed",
        detail: error.message,
        code: error.code
      });
    }
  }
  async me(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId }
      });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      return res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Fetch Me Error Detail:", error);
      return res.status(500).json({
        error: "Failed to fetch user",
        detail: error.message,
        code: error.code
      });
    }
  }
};

// server/middleware/auth.ts
import jwt2 from "jsonwebtoken";
function authMiddleware(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "Token not provided" });
  }
  const [, token] = authorization.split(" ");
  try {
    const decoded = jwt2.verify(token, process.env.JWT_SECRET);
    const { id, role } = decoded;
    req.userId = id;
    req.userRole = role;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalid" });
  }
}

// server/routes/auth.routes.ts
var router = Router();
var authController = new AuthController();
router.get("/setup-status", authController.setupStatus);
router.post("/setup-admin", authController.setupAdmin);
router.post("/register", authMiddleware, authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.me);
var auth_routes_default = router;

// server/routes/generic.routes.ts
import { Router as Router2 } from "express";

// server/controllers/generic.controller.ts
var GenericController = class {
  model;
  constructor(modelName) {
    this.model = prisma[modelName];
    if (!this.model) {
      console.error(`[GenericController] MODEL NOT FOUND: ${modelName}. Check prisma client and model names.`);
    }
  }
  async getAll(req, res) {
    try {
      const items = await this.model.findMany();
      return res.json(items);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch items" });
    }
  }
  async getOne(req, res) {
    const { id } = req.params;
    try {
      const item = await this.model.findUnique({ where: { id } });
      if (!item) return res.status(404).json({ error: "Item not found" });
      return res.json(item);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch item" });
    }
  }
  async create(req, res) {
    try {
      const item = await this.model.create({ data: req.body });
      return res.status(201).json(item);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to create item" });
    }
  }
  async update(req, res) {
    const { id } = req.params;
    try {
      const item = await this.model.update({ where: { id }, data: req.body });
      return res.json(item);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update item" });
    }
  }
  async delete(req, res) {
    const { id } = req.params;
    try {
      await this.model.delete({ where: { id } });
      return res.sendStatus(204);
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete item" });
    }
  }
};

// server/routes/generic.routes.ts
var createGenericRouter = (modelName) => {
  const router5 = Router2();
  const controller3 = new GenericController(modelName);
  router5.use(authMiddleware);
  router5.get("/", (req, res) => controller3.getAll(req, res));
  router5.get("/:id", (req, res) => controller3.getOne(req, res));
  router5.post("/", (req, res) => controller3.create(req, res));
  router5.put("/:id", (req, res) => controller3.update(req, res));
  router5.delete("/:id", (req, res) => controller3.delete(req, res));
  return router5;
};

// server/routes/class.routes.ts
import { Router as Router3 } from "express";

// server/controllers/class.controller.ts
var ClassController = class {
  async getAll(req, res) {
    try {
      const classes = await prisma.class.findMany({
        include: {
          subjects: true
        }
      });
      const formattedClasses = classes.map((c) => ({
        ...c,
        subjectIds: c.subjects ? c.subjects.map((s) => s.id) : []
      }));
      return res.json(formattedClasses);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch classes" });
    }
  }
  async getOne(req, res) {
    const { id } = req.params;
    try {
      const cls = await prisma.class.findUnique({
        where: { id },
        include: { subjects: true }
      });
      if (!cls) return res.status(404).json({ error: "Class not found" });
      const formattedClass = {
        ...cls,
        subjectIds: cls.subjects.map((s) => s.id)
      };
      return res.json(formattedClass);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch class" });
    }
  }
  async create(req, res) {
    try {
      const { subjectIds, ...data } = req.body;
      const createData = { ...data };
      if (subjectIds && Array.isArray(subjectIds)) {
        createData.subjects = {
          connect: subjectIds.map((id) => ({ id }))
        };
      }
      const newClass = await prisma.class.create({
        data: createData,
        include: { subjects: true }
      });
      const formattedClass = {
        ...newClass,
        subjectIds: newClass.subjects.map((s) => s.id)
      };
      return res.status(201).json(formattedClass);
    } catch (error) {
      console.error("[ClassController] Create Error:", error);
      return res.status(500).json({ error: "Failed to create class" });
    }
  }
  async update(req, res) {
    const { id } = req.params;
    try {
      const { subjectIds, ...data } = req.body;
      const updateData = { ...data };
      if (subjectIds && Array.isArray(subjectIds)) {
        updateData.subjects = {
          set: subjectIds.map((id2) => ({ id: id2 }))
        };
      }
      const updatedClass = await prisma.class.update({
        where: { id },
        data: updateData,
        include: { subjects: true }
      });
      const formattedClass = {
        ...updatedClass,
        subjectIds: updatedClass.subjects.map((s) => s.id)
      };
      return res.json(formattedClass);
    } catch (error) {
      console.error("[ClassController] Update Error:", error);
      return res.status(500).json({ error: "Failed to update class" });
    }
  }
  async delete(req, res) {
    const { id } = req.params;
    try {
      await prisma.class.delete({ where: { id } });
      return res.sendStatus(204);
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete class" });
    }
  }
};

// server/routes/class.routes.ts
var router2 = Router3();
var controller = new ClassController();
router2.use(authMiddleware);
router2.get("/", (req, res) => controller.getAll(req, res));
router2.get("/:id", (req, res) => controller.getOne(req, res));
router2.post("/", (req, res) => controller.create(req, res));
router2.put("/:id", (req, res) => controller.update(req, res));
router2.delete("/:id", (req, res) => controller.delete(req, res));
var class_routes_default = router2;

// server/routes/grade.routes.ts
import { Router as Router4 } from "express";

// server/controllers/grade.controller.ts
var GradeController = class {
  async getAll(req, res) {
    try {
      const grades = await prisma.grade.findMany();
      return res.json(grades);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch grades" });
    }
  }
  async getOne(req, res) {
    const { id } = req.params;
    try {
      const grade = await prisma.grade.findUnique({ where: { id } });
      if (!grade) return res.status(404).json({ error: "Grade not found" });
      return res.json(grade);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch grade" });
    }
  }
  async create(req, res) {
    try {
      const { studentId, subjectId, term, value } = req.body;
      const existing = await prisma.grade.findFirst({
        where: {
          studentId,
          subjectId,
          term: Number(term)
        }
      });
      let grade;
      if (existing) {
        grade = await prisma.grade.update({
          where: { id: existing.id },
          data: { value: Number(value) }
        });
      } else {
        grade = await prisma.grade.create({
          data: {
            studentId,
            subjectId,
            term: Number(term),
            value: Number(value)
          }
        });
      }
      return res.status(200).json(grade);
    } catch (error) {
      console.error("[GradeController] Create/Upsert Error:", error);
      return res.status(500).json({ error: "Failed to save grade" });
    }
  }
  async bulkUpdate(req, res) {
    try {
      const { grades } = req.body;
      if (!Array.isArray(grades)) {
        return res.status(400).json({ error: "Invalid payload: grades must be an array" });
      }
      const results = [];
      for (const g of grades) {
        const { studentId, subjectId, term, value } = g;
        if (!studentId || !subjectId || term === void 0 || value === void 0) continue;
        const existing = await prisma.grade.findFirst({
          where: {
            studentId,
            subjectId,
            term: Number(term)
          }
        });
        if (existing) {
          results.push(await prisma.grade.update({
            where: { id: existing.id },
            data: { value: Number(value) }
          }));
        } else {
          results.push(await prisma.grade.create({
            data: {
              studentId,
              subjectId,
              term: Number(term),
              value: Number(value)
            }
          }));
        }
      }
      return res.json({ message: "Grades processed", count: results.length });
    } catch (error) {
      console.error("[GradeController] Bulk Update Error:", error);
      return res.status(500).json({ error: "Failed to process bulk grades" });
    }
  }
  async update(req, res) {
    const { id } = req.params;
    try {
      const grade = await prisma.grade.update({ where: { id }, data: req.body });
      return res.json(grade);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update grade" });
    }
  }
  async delete(req, res) {
    const { id } = req.params;
    try {
      await prisma.grade.delete({ where: { id } });
      return res.sendStatus(204);
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete grade" });
    }
  }
};

// server/routes/grade.routes.ts
var router3 = Router4();
var controller2 = new GradeController();
router3.use(authMiddleware);
router3.get("/", (req, res) => controller2.getAll(req, res));
router3.get("/:id", (req, res) => controller2.getOne(req, res));
router3.post("/", (req, res) => controller2.create(req, res));
router3.post("/bulk", (req, res) => controller2.bulkUpdate(req, res));
router3.put("/:id", (req, res) => controller2.update(req, res));
router3.delete("/:id", (req, res) => controller2.delete(req, res));
var grade_routes_default = router3;

// server/routes/index.ts
var router4 = Router5();
router4.use("/auth", auth_routes_default);
router4.use("/students", createGenericRouter("student"));
router4.use("/teachers", createGenericRouter("teacher"));
router4.use("/subjects", createGenericRouter("subject"));
router4.use("/classes", class_routes_default);
router4.use("/assignments", createGenericRouter("assignment"));
router4.use("/grades", grade_routes_default);
router4.use("/formations", createGenericRouter("formationType"));
router4.use("/knowledge-areas", createGenericRouter("knowledgeArea"));
router4.use("/sub-areas", createGenericRouter("subArea"));
router4.use("/settings", createGenericRouter("schoolSettings"));
router4.use("/academic-years", createGenericRouter("academicYearConfig"));
router4.use("/users", createGenericRouter("user"));
var routes_default = router4;

// server/index.ts
dotenv.config();
var app = express();
var port = process.env.PORT || 3e3;
app.use(cors());
app.use(express.json());
app.use("/api", routes_default);
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var distPath = path.join(__dirname, "../dist");
if (!fs.existsSync(distPath)) {
  distPath = path.join(__dirname, "../../dist");
}
app.use(express.static(distPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
