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
    const { retrieveSecret } = await import("./index");
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
    const { retrieveSecret } = await import("./index");
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

describe("resolveProcessEnv", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should convert env vars with sm:// to their values", async () => {
    vi.stubEnv("NOT_A_SECRET", "sm-not-a-secret");
    vi.stubEnv("A_SECRET", "sm://env-test-project/env-test-secret-name");

    const { resolveProcessEnv } = await import("./index");
    const expectedSecret = "resolved-secret";
    accessSecretVersionMock.mockResolvedValue([
      { payload: { data: expectedSecret } },
    ]);

    await resolveProcessEnv();

    expect(process.env.A_SECRET).toEqual(expectedSecret);
    expect(process.env.NOT_A_SECRET).toEqual("sm-not-a-secret");

    expect(accessSecretVersionMock).toHaveBeenCalledWith({
      name: "projects/env-test-project/secrets/env-test-secret-name/versions/latest",
    });
  });
});