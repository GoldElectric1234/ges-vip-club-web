import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import {
  getMemberPropertyByIdWithClient,
  isValidPropertyId,
  listMemberPropertiesWithClient,
} from "@/lib/properties-read";

test.describe("properties read model 2C-3", () => {
  test("list maps rows to read-only summaries", async () => {
    const client = {
      from: () => ({
        select: () => ({
          eq: () => ({
            order: async () => ({
              data: [
                {
                  id: "11111111-1111-4111-8111-111111111111",
                  property_name: "  Main House  ",
                  property_type: "residential",
                  address: "  123 Main St  ",
                  city: "  Tampa  ",
                  state: " FL ",
                  zip_code: " 33610 ",
                  property_photo_url: null,
                  created_at: "2026-07-19T00:00:00.000Z",
                },
              ],
              error: null,
            }),
          }),
        }),
      }),
    };

    const result = await listMemberPropertiesWithClient(client as never, "user-id");

    expect(result.status).toBe("success");
    if (result.status !== "success") {
      return;
    }

    expect(result.properties).toHaveLength(1);
    expect(result.properties[0]).toEqual({
      id: "11111111-1111-4111-8111-111111111111",
      propertyName: "Main House",
      propertyType: "residential",
      address: "123 Main St",
      city: "Tampa",
      state: "FL",
      zipCode: "33610",
      photoUrl: null,
      createdAt: "2026-07-19T00:00:00.000Z",
    });
  });

  test("list returns empty state when no rows exist", async () => {
    const client = {
      from: () => ({
        select: () => ({
          eq: () => ({
            order: async () => ({ data: [], error: null }),
          }),
        }),
      }),
    };

    const result = await listMemberPropertiesWithClient(client as never, "user-id");
    expect(result).toEqual({ status: "empty", properties: [] });
  });

  test("get returns not_found for malformed id before querying", async () => {
    let queried = false;
    const client = {
      from: () => ({
        select: () => ({
          eq: () => {
            queried = true;
            return {
              eq: () => ({
                maybeSingle: async () => ({ data: null, error: null }),
              }),
            };
          },
        }),
      }),
    };

    const result = await getMemberPropertyByIdWithClient(client as never, "user-id", "bad-id");
    expect(result).toEqual({ status: "not_found" });
    expect(queried).toBe(false);
  });

  test("uuid validator accepts canonical v4/v5-ish ids and rejects random text", () => {
    expect(isValidPropertyId("11111111-1111-4111-8111-111111111111")).toBe(true);
    expect(isValidPropertyId("22222222-2222-5222-a222-222222222222")).toBe(true);
    expect(isValidPropertyId("not-a-uuid")).toBe(false);
  });

  test("read model file contains no mutation tokens", () => {
    const filePath = path.join(process.cwd(), "src", "lib", "properties-read.ts");
    const source = fs.readFileSync(filePath, "utf8");
    const forbidden = [
      ".insert(",
      ".update(",
      ".delete(",
      ".upsert(",
      "storage.upload",
      "storage.remove",
      ".rpc(",
    ];

    for (const token of forbidden) {
      expect(source.includes(token)).toBe(false);
    }
  });
});
