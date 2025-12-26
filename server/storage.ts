import { db } from "./db";
import {
  projects,
  type CreateProjectRequest,
  type Project,
  type UpdateProjectRequest
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: { originalVideoUrl: string }): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project>;
}

export class DatabaseStorage implements IStorage {
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: { originalVideoUrl: string }): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project> {
    const [updated] = await db.update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
