import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type ProjectResponse } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// GET /api/projects/:id
export function useProject(id: number | null) {
  return useQuery({
    queryKey: [api.projects.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.projects.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch project");
      return api.projects.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data as ProjectResponse | undefined;
      // Poll every 2s if status is pending or processing
      return data && (data.status === "pending" || data.status === "processing") ? 2000 : false;
    },
  });
}

// POST /api/projects (Multipart upload)
export function useCreateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("video", file);

      const res = await fetch(api.projects.create.path, {
        method: api.projects.create.method,
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.projects.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create project");
      }

      return api.projects.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      // Invalidate specific project query if we were listing them, 
      // but here we mostly care about setting the active project ID in the UI
      toast({
        title: "Video Uploaded",
        description: "Your project is ready for processing.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message,
      });
    },
  });
}

// POST /api/projects/:id/process
export function useProcessProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.projects.process.path, { id });
      const res = await fetch(url, {
        method: api.projects.process.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to start processing");
      return api.projects.process.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.projects.get.path, data.id] });
      toast({
        title: "Processing Started",
        description: "Extracting motion and frames...",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: error.message,
      });
    },
  });
}
