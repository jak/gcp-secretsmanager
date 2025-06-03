import { accessSecret } from "./lib/accessSecret";
import { parseSecretManagerUri } from "./lib/parseSecretManagerUri";

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