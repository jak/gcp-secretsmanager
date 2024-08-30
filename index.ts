import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

/**
 * Fetch a Secret from Google Secrets Manager.
 *
 * The URI must follow the format:
 *  sm://project/name
 *
 * If you need a specific version, use the format:
 *  sm://project/name#version
 *
 * @param uri
 */
export async function retrieveSecret<T extends string | Uint8Array>(
  uri: string,
): Promise<T> {
  const secretReference = parseSecretManagerUri(uri);

  return await accessSecret<T>(secretReference);
}

/**
 * Resolve all process.env variables that are secret manager references.
 */
export async function resolveProcessEnv(): Promise<void> {
  for (const key of Object.keys(process.env)) {
    if (process.env[key]?.startsWith("sm://")) {
      process.env[key] = await retrieveSecret<string>(process.env[key]);
    }
  }
}

interface SecretReference {
  project: string;
  name: string;
  version: string;
}

function parseSecretManagerUri(uri: string): SecretReference {
  const u = new URL(uri);
  const project = u.host;
  const name = u.pathname.replace(/^\//, "");
  const version = u.hash.replace(/^#/, "") || "latest";

  if (name.includes("/")) {
    throw new Error(`invalid secret name ${name}`);
  }

  return {
    project,
    name,
    version,
  };
}

function referenceToName(reference: SecretReference): string {
  const project = reference.project;
  const name = reference.name;
  const version = reference.version;

  return `projects/${project}/secrets/${name}/versions/${version}`;
}

async function accessSecret<T extends string | Uint8Array>(
  reference: SecretReference,
): Promise<T> {
  const client = new SecretManagerServiceClient();

  const name = referenceToName(reference);

  const [response] = await client.accessSecretVersion({
    name,
  });

  return response.payload?.data as T;
}
