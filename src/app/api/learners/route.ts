import { parseLearners, SAMPLE_LEARNERS, type LearnerResponse } from "@/lib/learners";
import { connection } from "next/server";

// Replace the placeholder in .env.local when the Apps Script deployment is ready.
const PLACEHOLDER_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";

export async function GET() {
  await connection();
  const endpoint = process.env.GOOGLE_APPS_SCRIPT_URL || PLACEHOLDER_URL;
  let message = "Sample data is displayed. Connect your Google Sheet to see live learners.";
  if (endpoint !== PLACEHOLDER_URL) {
    try {
      const response = await fetch(endpoint, {
        cache: "no-store",
        redirect: "follow",
        signal: AbortSignal.timeout(12_000),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("The Google Sheet endpoint returned an error.");
      const learners = parseLearners(await response.json());
      if (learners.length > 0) {
        return Response.json({ learners, source: "google-sheets", message: "Learner data refreshed from Google Sheets.", updatedAt: new Date().toISOString() } satisfies LearnerResponse, { headers: { "Cache-Control": "no-store" } });
      }
      message = "Your Google Sheet is empty. Sample learners are displayed for preview.";
    } catch {
      message = "Google Sheets could not be loaded. Sample learners are displayed; try refreshing again.";
    }
  }
  return Response.json({ learners: SAMPLE_LEARNERS, source: "sample", message, updatedAt: new Date().toISOString() } satisfies LearnerResponse, { headers: { "Cache-Control": "no-store" } });
}
