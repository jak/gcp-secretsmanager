import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { SecretReference } from "./types";

function referenceToName(reference: SecretReference): string {
  const project = reference.project;
  const name = reference.name;
  const version = reference.version;

  return `projects/${project}/secrets/${name}/versions/${version}`;
}

export async function accessSecret<T extends string | Uint8Array>(
  reference: SecretReference,
): Promise<T> {
  const client = new SecretManagerServiceClient();

  const name = referenceToName(reference);

  const [response] = await client.accessSecretVersion({
    name,
  });

  return response.payload?.data as T;
}
