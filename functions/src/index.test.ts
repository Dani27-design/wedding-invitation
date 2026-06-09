/* eslint-disable @typescript-eslint/no-explicit-any */
import {describe, it, expect, jest, beforeEach} from "@jest/globals";

// ---------------------------------------------------------------------------
// Mocks — must be declared before importing the module under test
// ---------------------------------------------------------------------------

const mockSendMail = jest.fn().mockResolvedValue(undefined);
const mockCreateTransport = jest.fn().mockReturnValue({
  sendMail: mockSendMail,
});

jest.mock("nodemailer", () => ({
  createTransport: mockCreateTransport,
}));

jest.mock("firebase-admin/app", () => ({
  initializeApp: jest.fn(),
}));

const mockGet = jest.fn<() => Promise<any>>();
const mockDoc = jest.fn().mockReturnValue({get: mockGet});
jest.mock("firebase-admin/firestore", () => ({
  getFirestore: jest.fn().mockReturnValue({doc: mockDoc}),
}));

jest.mock("firebase-admin/storage", () => ({
  getStorage: jest.fn().mockReturnValue({bucket: jest.fn()}),
}));

jest.mock("@ffmpeg-installer/ffmpeg", () => ({
  __esModule: true,
  default: {path: "/usr/bin/ffmpeg"},
}));

jest.mock("fluent-ffmpeg", () => {
  const fn = jest.fn();
  (fn as any).setFfmpegPath = jest.fn();
  return {__esModule: true, default: fn};
});

// Minimal firebase-functions stubs
jest.mock("firebase-functions", () => ({
  setGlobalOptions: jest.fn(),
}));

jest.mock("firebase-functions/storage", () => ({
  onObjectFinalized: jest.fn((_opts: any, handler: any) => handler),
}));

jest.mock("firebase-functions/https", () => ({
  onRequest: jest.fn((_handler: any) => _handler),
  onCall: jest.fn((_opts: any, handler: any) => handler),
  HttpsError: class HttpsError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  },
}));

jest.mock("firebase-functions/firestore", () => ({
  onDocumentCreated: jest.fn((_opts: any, handler: any) => handler),
}));

// ---------------------------------------------------------------------------
// Import the module under test (after mocks)
// ---------------------------------------------------------------------------
import {onUserCreated, sendRegistrationEmail} from "./index";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
beforeEach(() => {
  jest.clearAllMocks();
  process.env.EMAIL_USER = "test@gmail.com";
  process.env.EMAIL_APP_PASSWORD = "app-password";
});

// ===========================================================================
// onUserCreated
// ===========================================================================
describe("onUserCreated", () => {
  const handler = onUserCreated as any;

  it("sends welcome email when user doc has email", async () => {
    const event = {
      data: {
        data: () => ({
          email: "user@example.com",
          displayName: "Budi",
        }),
      },
      params: {uid: "uid-123"},
    };

    await handler(event);

    expect(mockCreateTransport).toHaveBeenCalledWith({
      service: "gmail",
      auth: {user: "test@gmail.com", pass: "app-password"},
    });
    expect(mockSendMail).toHaveBeenCalledTimes(1);

    const mailOpts = mockSendMail.mock.calls[0][0] as any;
    expect(mailOpts.to).toBe("user@example.com");
    expect(mailOpts.subject).toBe(
      "Selamat Datang di Marinikah Invitation!",
    );
    expect(mailOpts.html).toContain("Halo Budi,");
    expect(mailOpts.html).toContain("wa.me/628883816403");
  });

  it("uses fallback name when displayName is missing", async () => {
    const event = {
      data: {
        data: () => ({
          email: "noname@example.com",
        }),
      },
      params: {uid: "uid-456"},
    };

    await handler(event);

    const mailOpts = mockSendMail.mock.calls[0][0] as any;
    expect(mailOpts.html).toContain("Halo Pengguna,");
  });

  it("skips when event data is null", async () => {
    const event = {data: null, params: {uid: "uid-789"}};

    await handler(event);

    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("skips when email is missing from user doc", async () => {
    const event = {
      data: {
        data: () => ({displayName: "No Email"}),
      },
      params: {uid: "uid-no-email"},
    };

    await handler(event);

    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("does not throw when sendMail fails", async () => {
    mockSendMail.mockRejectedValueOnce(new Error("SMTP error"));

    const event = {
      data: {
        data: () => ({
          email: "fail@example.com",
          displayName: "Fail",
        }),
      },
      params: {uid: "uid-fail"},
    };

    await expect(handler(event)).resolves.toBeUndefined();
  });

  it("email HTML contains WhatsApp link with user info", async () => {
    const event = {
      data: {
        data: () => ({
          email: "wa@example.com",
          displayName: "Sari",
        }),
      },
      params: {uid: "uid-wa"},
    };

    await handler(event);

    const mailOpts = mockSendMail.mock.calls[0][0] as any;
    expect(mailOpts.html).toContain("Hubungi Admin via WhatsApp");
    expect(mailOpts.html).toContain("slug");
    expect(mailOpts.html).toContain("marinikah.com/dani-marini");
  });

  it("email from address uses EMAIL_USER env", async () => {
    const event = {
      data: {
        data: () => ({
          email: "from@example.com",
          displayName: "Test",
        }),
      },
      params: {uid: "uid-from"},
    };

    await handler(event);

    const mailOpts = mockSendMail.mock.calls[0][0] as any;
    expect(mailOpts.from).toContain("test@gmail.com");
    expect(mailOpts.from).toContain("Marinikah Invitation");
  });
});

// ===========================================================================
// sendRegistrationEmail
// ===========================================================================
describe("sendRegistrationEmail", () => {
  const handler = sendRegistrationEmail as any;

  it("throws unauthenticated when no auth", async () => {
    const request = {auth: null, data: {}};

    await expect(handler(request)).rejects.toThrow("Login diperlukan");
  });

  it("throws permission-denied when not super admin", async () => {
    mockGet.mockResolvedValueOnce({data: () => ({role: "admin"})});

    const request = {
      auth: {uid: "non-super"},
      data: {email: "a@b.com", displayName: "A"},
    };

    await expect(handler(request)).rejects.toThrow("Hanya super admin");
  });

  it("throws invalid-argument when email is empty", async () => {
    mockGet.mockResolvedValueOnce({data: () => ({role: "super"})});

    const request = {
      auth: {uid: "super-uid"},
      data: {email: "", displayName: "B"},
    };

    await expect(handler(request)).rejects.toThrow("Email wajib diisi");
  });

  it("sends email when caller is super admin", async () => {
    mockGet.mockResolvedValueOnce({data: () => ({role: "super"})});

    const request = {
      auth: {uid: "super-uid"},
      data: {email: "resend@example.com", displayName: "Resend User"},
    };

    const result = await handler(request);

    expect(result).toEqual({success: true});
    expect(mockSendMail).toHaveBeenCalledTimes(1);

    const mailOpts = mockSendMail.mock.calls[0][0] as any;
    expect(mailOpts.to).toBe("resend@example.com");
    expect(mailOpts.html).toContain("Halo Resend User,");
  });

  it("verifies caller role via Firestore", async () => {
    mockGet.mockResolvedValueOnce({data: () => ({role: "super"})});

    const request = {
      auth: {uid: "check-uid"},
      data: {email: "x@y.com", displayName: "X"},
    };

    await handler(request);

    expect(mockDoc).toHaveBeenCalledWith("users/check-uid");
  });
});
