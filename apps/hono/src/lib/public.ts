import tailwindcss from "@tailwindcss/postcss";
import type { BuildArtifact } from "bun";
import postcss from "postcss";
import { rspack } from "@rspack/core";

export const generateTailwind = async () : Promise<BuildArtifact> => {
  const { outputs } = await Bun.build({
    entrypoints: ["./public/index.css"],
    plugins: [
      {
        name: "CSS Loader",
        setup(build) {
          build.onLoad({ filter: /.\.(css)$/ }, async (args) => {
            const css = await Bun.file(args.path).text();
            
            const result = await postcss([tailwindcss()]).process(css, {
              from: args.path,
            });
            return {
              contents: result.css,
              loader: "css",
            };
          });
        },
      },
    ],
  });
  return outputs[0];
}
// @ts-ignore
const blankCallback = (...args) => {
	const cb = args.pop();
	cb(null);
};

export const generateJS = async () : Promise<Map<string, Blob>> => {
  const inMemoryFS = new Map<string, Blob>();
  const compiler = rspack({
    entry: "./public/main.ts",
    optimization: {
      moduleIds: "named",
      minimize: false,
    },
    devtool: "source-map",
    output: { filename: "main.js", path: "/" },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: [/node_modules/],
          loader: "builtin:swc-loader",
          options: {
            jsc: {
              parser: {
                syntax: "typescript",
                tsx: true,
              },
              transform: {
                react: {
                  runtime: "automatic"
                }
              }
            },
          },
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        },
      ],
    },
    resolve: {
      alias: {
        // "@/db/schema": "../src/db/schema",
        // "@/db/service": "../src/db/service",
      },
      extensions: [".ts", ".js", ".tsx"],
    },
  });

  compiler.outputFileSystem = {
    writeFile(filename: string | number, buffer: string | Buffer, callback) {
      const extensionsToType: Record<string, string> = {
        ".js": "application/javascript",
        ".wasm": "application/wasm",
        ".data": "application/octet-stream",
        ".json": "application/json",
        ".txt": "text/plain",
      };

      // Get file extension
      const extension = String(filename).split(".").pop()?.toLowerCase();
      const mimeType =
        extensionsToType[`.${extension}`] || "application/octet-stream";

      // Convert Buffer to Uint8Array if needed
      const data =
        typeof buffer === "string"
          ? new TextEncoder().encode(buffer)
          : Buffer.isBuffer(buffer)
            ? new Uint8Array(buffer)
            : buffer;

      // Create a Blob with the appropriate MIME type
      const blob = new Blob([data], { type: mimeType });

      // Store the Blob in the in-memory file system
      inMemoryFS.set(String(filename), blob);
      callback(null);
    },
    chmod: blankCallback,
    readFile: blankCallback,
    mkdir: blankCallback,
    readdir: blankCallback,
    rmdir: blankCallback,
    unlink: blankCallback,
    stat: blankCallback,
  };

  return await new Promise<Map<string, Blob>>((resolve, reject) => {
    compiler.run((er, stats) => {
      if (stats?.hasErrors()) reject(stats.toString("errors-warnings"));
      resolve(inMemoryFS);
    });
  })
}