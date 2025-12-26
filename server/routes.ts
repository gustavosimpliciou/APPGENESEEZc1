import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

const upload = multer({ 
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  app.post(api.projects.create.path, upload.single('video'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No video file provided" });
      }

      // In a real app with Object Storage, we would upload to the bucket here.
      // For MVP with local storage, we just use the local path.
      // Ideally we should use the object storage integration if it was fully set up,
      // but 'uploads/' works for local dev/preview.
      
      const videoUrl = `/uploads/${req.file.filename}`;
      
      const project = await storage.createProject({
        originalVideoUrl: videoUrl
      });
      
      res.status(201).json(project);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.projects.get.path, async (req, res) => {
    const project = await storage.getProject(Number(req.params.id));
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  });

  app.post(api.projects.process.path, async (req, res) => {
    const id = Number(req.params.id);
    const project = await storage.getProject(id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Mock processing
    // 1. Update status to processing
    await storage.updateProject(id, { status: "processing" });

    // 2. Simulate delay and "finish"
    setTimeout(async () => {
      // In a real app, this would be an API call to the AI service
      // Here we just pretend we generated something (using the original as placeholder)
      await storage.updateProject(id, { 
        status: "completed",
        identityFrameUrl: "https://placehold.co/600x400/1a1a1a/FFF?text=Identity+Frame",
        generatedVideoUrl: project.originalVideoUrl // Loop back the original for now
      });
    }, 5000); // 5 seconds processing time

    const updated = await storage.getProject(id);
    res.json(updated!);
  });

  return httpServer;
}
