import path from "node:path";

function getAvatarDirCandidates() {
  const cwd = process.cwd();
  const localAppDir = path.join(cwd, "public", "uploads", "avatars");
  const monorepoDir = path.join(cwd, "apps", "portal", "public", "uploads", "avatars");

  return path.basename(cwd) === "portal"
    ? [localAppDir, monorepoDir]
    : [monorepoDir, localAppDir];
}

export function getPrimaryAvatarUploadsDir() {
  return getAvatarDirCandidates()[0];
}

export function getAvatarPathCandidates(filename: string) {
  return getAvatarDirCandidates().map((dir) => path.join(dir, filename));
}
