import type { APIRequestContext } from "@playwright/test";

export async function cleanupDemoData(request: APIRequestContext) {
  const response = await request.post("http://localhost:3001/api/v1/demo/cleanup");
  if (!response.ok()) {
    throw new Error(`Demo cleanup failed: ${response.status()} ${await response.text()}`);
  }
}
