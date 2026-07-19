import { expect, test } from "@playwright/test";

test.describe("properties read-only recovery 2C-3", () => {
  test("unauthenticated list route redirects to login", async ({ page }) => {
    await page.goto("/properties");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("unauthenticated detail route redirects to login", async ({ page }) => {
    await page.goto("/properties/11111111-1111-4111-8111-111111111111");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("unauthenticated new route redirects to login", async ({ page }) => {
    await page.goto("/properties/new");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("unauthenticated edit route redirects to login", async ({ page }) => {
    await page.goto("/properties/11111111-1111-4111-8111-111111111111/edit");
    await expect(page).toHaveURL(/\/login$/);
  });
});
