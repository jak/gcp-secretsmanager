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

describe("resolveProcessEnv", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should convert env vars with sm:// to their values", async () => {
    vi.stubEnv("NOT_A_SECRET", "sm-not-a-secret");
    vi.stubEnv("A_SECRET", "sm://env-test-project/env-test-secret-name");

    const { resolveProcessEnv } = await import("./resolveProcessEnv");
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