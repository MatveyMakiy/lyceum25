import { describe, it, expect } from "vitest";
import { getPosts } from "../src/api/posts.js";

describe("posts", () => {
  it("returns posts", async () => {
    const result = await getPosts(1, 2);

    expect(result.items.length).toBeGreaterThan(0);
    expect(typeof result.hasMore).toBe("boolean");
  });
});