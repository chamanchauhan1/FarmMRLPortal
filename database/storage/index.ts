import {
  type User,
  type InsertUser,
  type Farm,
  type InsertFarm,
  type Animal,
  type InsertAnimal,
  type TreatmentRecord,
  type InsertTreatmentRecord,
  type FarmReport,
  type InsertFarmReport,
} from "../schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Farm methods
  getAllFarms(): Promise<Farm[]>;
  getFarmById(id: string): Promise<Farm | undefined>;
  createFarm(farm: InsertFarm): Promise<Farm>;
  updateFarmAnimalCount(farmId: string, count: number): Promise<void>;

  // Animal methods
  getAllAnimals(): Promise<Animal[]>;
  getAnimalById(id: string): Promise<Animal | undefined>;
  getAnimalsByFarmId(farmId: string): Promise<Animal[]>;
  createAnimal(animal: InsertAnimal): Promise<Animal>;

  // Treatment Record methods
  getAllTreatmentRecords(): Promise<TreatmentRecord[]>;
  getTreatmentRecordById(id: string): Promise<TreatmentRecord | undefined>;
  getTreatmentRecordsByFarmId(farmId: string): Promise<TreatmentRecord[]>;
  getTreatmentRecordsByAnimalId(animalId: string): Promise<TreatmentRecord[]>;
  createTreatmentRecord(record: InsertTreatmentRecord): Promise<TreatmentRecord>;

  // Farm Report methods
  getAllFarmReports(): Promise<FarmReport[]>;
  getFarmReportById(id: string): Promise<FarmReport | undefined>;
  getFarmReportsByFarmId(farmId: string): Promise<FarmReport[]>;
  createFarmReport(report: InsertFarmReport): Promise<FarmReport>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private farms: Map<string, Farm>;
  private animals: Map<string, Animal>;
  private treatmentRecords: Map<string, TreatmentRecord>;
  private farmReports: Map<string, FarmReport>;

  constructor() {
    this.users = new Map();
    this.farms = new Map();
    this.animals = new Map();
    this.treatmentRecords = new Map();
    this.farmReports = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      farmId: insertUser.farmId ?? null
    };
    this.users.set(id, user);
    return user;
  }

  // Farm methods
  async getAllFarms(): Promise<Farm[]> {
    return Array.from(this.farms.values());
  }

  async getFarmById(id: string): Promise<Farm | undefined> {
    return this.farms.get(id);
  }

  async createFarm(insertFarm: InsertFarm): Promise<Farm> {
    const id = randomUUID();
    const farm: Farm = { ...insertFarm, id, totalAnimals: 0 };
    this.farms.set(id, farm);
    return farm;
  }

  async updateFarmAnimalCount(farmId: string, count: number): Promise<void> {
    const farm = this.farms.get(farmId);
    if (farm) {
      farm.totalAnimals = count;
      this.farms.set(farmId, farm);
    }
  }

  // Animal methods
  async getAllAnimals(): Promise<Animal[]> {
    return Array.from(this.animals.values());
  }

  async getAnimalById(id: string): Promise<Animal | undefined> {
    return this.animals.get(id);
  }

  async getAnimalsByFarmId(farmId: string): Promise<Animal[]> {
    return Array.from(this.animals.values()).filter(
      (animal) => animal.farmId === farmId
    );
  }

  async createAnimal(insertAnimal: InsertAnimal): Promise<Animal> {
    const id = randomUUID();
    const animal: Animal = { 
      ...insertAnimal, 
      id,
      status: insertAnimal.status ?? "active",
      breed: insertAnimal.breed ?? null,
      dateOfBirth: insertAnimal.dateOfBirth ?? null,
      weight: insertAnimal.weight ?? null
    };
    this.animals.set(id, animal);

    // Update farm animal count
    const farmAnimals = await this.getAnimalsByFarmId(animal.farmId);
    await this.updateFarmAnimalCount(animal.farmId, farmAnimals.length);

    return animal;
  }

  // Treatment Record methods
  async getAllTreatmentRecords(): Promise<TreatmentRecord[]> {
    return Array.from(this.treatmentRecords.values());
  }

  async getTreatmentRecordById(id: string): Promise<TreatmentRecord | undefined> {
    return this.treatmentRecords.get(id);
  }

  async getTreatmentRecordsByFarmId(farmId: string): Promise<TreatmentRecord[]> {
    return Array.from(this.treatmentRecords.values()).filter(
      (record) => record.farmId === farmId
    );
  }

  async getTreatmentRecordsByAnimalId(animalId: string): Promise<TreatmentRecord[]> {
    return Array.from(this.treatmentRecords.values()).filter(
      (record) => record.animalId === animalId
    );
  }

  async createTreatmentRecord(insertRecord: InsertTreatmentRecord): Promise<TreatmentRecord> {
    const id = randomUUID();
    
    // Determine compliance status based on MRL level
    let complianceStatus = insertRecord.complianceStatus || "pending";
    if (insertRecord.mrlLevel) {
      const mrlValue = parseFloat(insertRecord.mrlLevel.toString());
      if (mrlValue < 50) {
        complianceStatus = "compliant";
      } else if (mrlValue < 100) {
        complianceStatus = "warning";
      } else {
        complianceStatus = "violation";
      }
    }

    const record: TreatmentRecord = {
      ...insertRecord,
      id,
      complianceStatus,
      mrlLevel: insertRecord.mrlLevel ?? null,
      notes: insertRecord.notes ?? null
    };
    this.treatmentRecords.set(id, record);
    return record;
  }

  // Farm Report methods
  async getAllFarmReports(): Promise<FarmReport[]> {
    return Array.from(this.farmReports.values());
  }

  async getFarmReportById(id: string): Promise<FarmReport | undefined> {
    return this.farmReports.get(id);
  }

  async getFarmReportsByFarmId(farmId: string): Promise<FarmReport[]> {
    return Array.from(this.farmReports.values()).filter(
      (report) => report.farmId === farmId
    );
  }

  async createFarmReport(insertReport: InsertFarmReport): Promise<FarmReport> {
    const id = randomUUID();
    const report: FarmReport = {
      ...insertReport,
      id,
      uploadedAt: new Date().toISOString(),
      description: insertReport.description ?? null
    };
    this.farmReports.set(id, report);
    return report;
  }
}

export const storage = new MemStorage();
