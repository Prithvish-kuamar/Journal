import process from "node:process";
import fs from "node:fs";

for (const file of [".env", ".env.local"]) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    let value = match[2];
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (!process.env[match[1]]) process.env[match[1]] = value;
  }
}

const required = [
  ["DATABASE_URL", (value) => /^(postgres|postgresql):\/\//.test(value) && !/(YOUR[-_]PASSWORD|PROJECT_REF|POOLER_HOST|\[|\]|\s)/i.test(value), "a complete PostgreSQL URL without placeholders"],
  ["DIRECT_URL", (value) => /^(postgres|postgresql):\/\//.test(value) && !/(YOUR[-_]PASSWORD|PROJECT_REF|POOLER_HOST|\[|\]|\s)/i.test(value), "a complete direct PostgreSQL URL without placeholders"],
  ["NEXT_PUBLIC_SUPABASE_URL", (value) => /^https:\/\//.test(value), "an HTTPS Supabase URL"],
  ["NEXT_PUBLIC_SUPABASE_ANON_KEY", (value) => value.length > 10, "a Supabase anon key"],
  ["SUPABASE_SERVICE_ROLE_KEY", (value) => value.length > 10 && !value.startsWith("NEXT_PUBLIC_"), "a private Supabase service-role key"],
  ["OWNER_EMAIL", (value) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value), "an owner email"],
  ["APP_URL", (value) => /^https?:\/\//.test(value), "an application URL"]
];

if (process.argv.includes("--required")) {
  const errors = required.flatMap(([name, check, description]) => {
    const value = process.env[name];
    return !value ? [`${name} is missing (expected ${description})`] : !check(value) ? [`${name} is invalid (expected ${description})`] : [];
  });
  if (errors.length) {
    console.error(`Production environment validation failed: ${errors.join("; ")}`);
    process.exit(1);
  }
}

console.log("Production environment configuration is valid.");
