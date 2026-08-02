import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
if (!databaseUrl.startsWith("file:")) throw new Error("DATABASE_URL must be a local SQLite file URL.");
const source = path.resolve(process.cwd(), "prisma", databaseUrl.slice("file:".length));
const targetDir = path.resolve(process.cwd(), "local-backups", `${new Date().toISOString().slice(0, 10)}-manual`);
if (!fs.existsSync(source)) throw new Error(`Database not found: ${source}`);
if (fs.existsSync(targetDir)) throw new Error(`Refusing to overwrite existing backup: ${targetDir}`);
fs.mkdirSync(targetDir, { recursive: true });
const destination = path.join(targetDir, "dev.db");
fs.copyFileSync(source, destination);
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const summary = { createdAt: new Date().toISOString(), source, destination, sourceSha256: hash(source), destinationSha256: hash(destination), databaseUrl };
fs.writeFileSync(path.join(targetDir, "environment-summary.txt"), Object.entries(summary).map(([key, value]) => `${key}=${value}`).join("\n"));
fs.writeFileSync(path.join(targetDir, "checksums.txt"), `${summary.sourceSha256}  ${source}\n${summary.destinationSha256}  ${destination}\n`);
console.log(`Backup created at ${targetDir}`);
