import { afterEach, describe, expect, it, vi } from "vitest";

let accessSecretVersionMock = vi.fn();
vi.mock("@google-cloud/secret-manager", async () => {
  const mod = await vi.importActual<any>("@google-cloud/secret-manager");
  return {
    ...mod,
    SecretManagerServiceClient: vi.fn().mockImplementation(() => ({
      accessSecretVersion: accessSecretVersionMock,
    })),
  };
});

describe("package integration", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("retrieveSecret example works", async () => {
    const { retrieveSecret } = await import("../dist/index.js");
    const expected = "hello";
    accessSecretVersionMock.mockResolvedValue([{ payload: { data: expected } }]);

    const value = await retrieveSecret<string>("sm://my-project/my-secret");
    expect(value).toEqual(expected);
    expect(accessSecretVersionMock).toHaveBeenCalledWith({
      name: "projects/my-project/secrets/my-secret/versions/latest",
    });
  });

  it("resolveProcessEnv example works", async () => {
    vi.stubEnv("MY_SECRET", "sm://another-project/another-secret");
    vi.stubEnv("NOT_SECRET", "plain");
    const { resolveProcessEnv } = await import("../dist/index.js");
    const expected = "resolved";
    accessSecretVersionMock.mockResolvedValue([{ payload: { data: expected } }]);

    await resolveProcessEnv();

    expect(process.env.MY_SECRET).toEqual(expected);
    expect(process.env.NOT_SECRET).toEqual("plain");
    expect(accessSecretVersionMock).toHaveBeenCalledWith({
      name: "projects/another-project/secrets/another-secret/versions/latest",
    });
  });
});
