import { defineConfig } from "tsup";
import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    resolver: "src/resolver.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  external: ["react", "react-dom"],
  // Ship the CSS alongside the bundle so consumers can import "@asafarim/navigation/styles.css".
  async onSuccess() {
    copyFileSync(
      resolve(__dirname, "src/styles.css"),
      resolve(__dirname, "dist/styles.css")
    );
  },
});
