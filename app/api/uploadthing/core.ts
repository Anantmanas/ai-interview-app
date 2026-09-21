import { createUploadthing, type FileRouter } from "uploadthing/next";
import { createClient } from "@/lib/supabase/server";
import { ResumeUploadService } from "@/lib/resume/upload-service";

if (!process.env.UPLOADTHING_TOKEN) {
  console.error('[UploadThing] UPLOADTHING_TOKEN is not set — file uploads will fail with 401')
}

const f = createUploadthing();


export const ourFileRouter = {
  resumeUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL", file.url);
      
      const supabase = await createClient();
      const uploadService = new ResumeUploadService(supabase);
      const resume = await uploadService.processUploadedResume(metadata.userId, {
        url: file.url,
        name: file.name,
        size: file.size,
      }, { force: true });

      return {
        uploadedBy: metadata.userId,
        url: file.url,
        status: resume?.status || "READY",
        versionNumber: resume?.versionNumber || 1,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
