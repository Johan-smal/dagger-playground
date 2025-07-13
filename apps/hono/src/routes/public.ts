import { generateJS, generateTailwind } from "@/lib/public";
import type { BuildArtifact } from "bun";
import { Hono } from "hono";

const files = new Map<"js" | "css", BuildArtifact | Map<string, Blob>>();

export const app = new Hono()
	.get("/index.css", async (c) => {
		let output: BuildArtifact;
		if (files.has("css")) {
			output = files.get("css") as BuildArtifact;
		} else {
			output = await generateTailwind();
      files.set("css", output);
		}

		c.header("Content-Type", output.type);
		return c.body(await output.text());
	})
  .get("/:file", async (c) => {
    const { file } = c.req.param();
    const identifier = `/${file}`;
    let inMemoryFS: Map<string, Blob> | undefined;
    if (files.has("js")) {
      inMemoryFS = files.get("js") as Map<string, Blob>;
    } else {
      inMemoryFS = await generateJS();
      files.set("js", inMemoryFS);
    }
    if (!inMemoryFS.has(identifier)) {
      throw new Error(`file not found ${identifier}`);
    }
    const output = inMemoryFS.get(identifier) as Blob;
    c.header("Content-Type", output.type);
    return c.body(output.stream());
  })
