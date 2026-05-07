import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { DEMO_MODE, DEMO_SESSION } from "./demo";

export interface SessionData {
  userId?: string;
  phoneNumber?: string;
  isLoggedIn?: boolean;
  save?: () => Promise<void>;
  destroy?: () => void;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "demo-secret-key-minimum-32-characters-here!!",
  cookieName: "ivalt_portal_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  },
};

export async function getSession(): Promise<SessionData> {
  if (DEMO_MODE) {
    // Return a fake session object with no-op save/destroy
    return {
      ...DEMO_SESSION,
      save: async () => {},
      destroy: () => {},
    };
  }
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  return session;
}
