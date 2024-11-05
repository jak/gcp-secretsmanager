import { afterEach, describe, expect, it, vi } from "vitest";

let accessSecretVersionMock = vi.fn();
vi.mock("@google-cloud/secret-manager", async () => {
  const secretManager = await vi.importActual("@google-cloud/secret-manager");

  return {
    ...secretManager,
    SecretManagerServiceClient: vi.fn().mockImplementation(() => ({
      accessSecretVersion: accessSecretVersionMock,
    })),
  };
});

describe("retrieveSecret", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch the latest secret from GCP Secret Manager by default", async () => {
    const { default: retrieveSecret } = await import("./retrieveSecret");
    const expectedSecret = "test-secret";
    accessSecretVersionMock.mockResolvedValue([
      { payload: { data: expectedSecret } },
    ]);

    const secret = await retrieveSecret("sm://test-project/test-secret-name");

    expect(secret).toEqual(expectedSecret);

    expect(accessSecretVersionMock).toHaveBeenCalledWith({
      name: "projects/test-project/secrets/test-secret-name/versions/latest",
    });
  });

  it("should fetch the specified version secret from GCP Secret Manager when provided", async () => {
    const { default: retrieveSecret } = await import("./retrieveSecret");
    const expectedSecret = "test-secret";
    accessSecretVersionMock.mockResolvedValue([
      { payload: { data: expectedSecret } },
    ]);

    const secret = await retrieveSecret("sm://test-project/test-secret-name#5");

    expect(secret).toEqual(expectedSecret);

    expect(accessSecretVersionMock).toHaveBeenCalledWith({
      name: "projects/test-project/secrets/test-secret-name/versions/5",
    });
  });
});