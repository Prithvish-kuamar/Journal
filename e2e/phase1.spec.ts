import { test, expect } from "@playwright/test";

test("happy path exposes the strategy-first workflow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Execution accuracy")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Evidence Ledger Journal Calendar" })).toBeVisible();
  await page.getByRole("link", { name: "Strategy Library", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "Strategy library" })).toBeVisible();
  await page.getByRole("link", { name: "Daily Plan", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Daily Plan" })).toBeVisible();
});

test("rejected-path setup displays rejection rather than a letter grade", async ({ page }) => {
  await page.goto("/journal");
  const rejectedRow = page.getByRole("row").filter({ hasText: "DEMO: Confirmation-candle rejection" });
  await rejectedRow.getByRole("link", { name: /Open workflow/ }).click();
  await expect(page.getByText("REJECTED").first()).toBeVisible();
  await expect(page.getByText("First failed gate: G09")).toBeVisible();
  await expect(page.getByText("Setup grading")).not.toBeVisible();
});

for (const viewport of [
  { name: "1920 desktop", width: 1920, height: 1080 },
  { name: "1440 desktop", width: 1440, height: 900 },
  { name: "1366 desktop", width: 1366, height: 768 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "mobile", width: 390, height: 844 }
]) {
  test(`core pages render at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    for (const path of ["/", "/journal/new", "/strategy"]) {
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
      await expect(page.locator("body")).not.toContainText("Unhandled Runtime Error");
    }
  });
}
