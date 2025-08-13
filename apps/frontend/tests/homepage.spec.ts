import { test, expect } from "@playwright/test";

// Basic smoke test: verifies the storefront homepage renders
// and shows the main brand heading. This does not require any
// backend data to be present because the page tolerates empty
// product lists.
test("homepage shows brand heading", async ({ page }) => {
  await page.goto("/");
  // Wait for the heading to be visible
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toContainText(/YEEZUZ2020/i);
});
