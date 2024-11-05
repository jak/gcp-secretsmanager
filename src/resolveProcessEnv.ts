import retrieveSecret from "./retrieveSecret";

/**
 * Resolve all process.env variables that are secret manager references.
 */
export default async function resolveProcessEnv(): Promise<void> {
  for (const key of Object.keys(process.env)) {
    if (process.env[key]?.startsWith("sm://")) {
      process.env[key] = await retrieveSecret<string>(process.env[key]);
    }
  }
}