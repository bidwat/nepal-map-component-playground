import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const githubRepo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const pagesBase = githubRepo ? `/${githubRepo}/` : "/";

// https://vite.dev/config/
export default defineConfig({
  // Use repository-scoped base path on CI (project pages), root path elsewhere.
  base: isGithubActions ? pagesBase : "/",
  plugins: [react()],
});
