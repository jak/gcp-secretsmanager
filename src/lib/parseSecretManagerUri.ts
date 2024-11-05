import { SecretReference } from "./types";

export default function parseSecretManagerUri(uri: string): SecretReference {
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