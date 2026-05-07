// =============================================================================
// DEMO MODE
// Set NEXT_PUBLIC_DEMO_MODE=true in .env.local to bypass all real API calls.
// In demo mode: no DB, no AWS, no iVALT credentials needed.
// =============================================================================

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const DEMO_USER = {
  id: "demo-user-001",
  phoneNumber: "+919876543210",
  name: "Demo User",
  createdAt: new Date("2025-01-15T10:00:00Z"),
  updatedAt: new Date("2025-04-01T09:00:00Z"),
  lastLoginAt: new Date("2025-05-07T08:30:00Z"),
};

export const DEMO_SESSION = {
  userId: DEMO_USER.id,
  phoneNumber: DEMO_USER.phoneNumber,
  isLoggedIn: true,
};

export const DEMO_API_KEYS = [
  {
    id: "demo-key-001",
    userId: DEMO_USER.id,
    awsKeyId: "abc1234567890xyz",
    keyName: "Production App",
    keyValue: "ivalt••••••••••••••••••••3f9a",
    isActive: true,
    usagePlanId: "demo-plan-001",
    createdAt: new Date("2025-03-01T12:00:00Z"),
    lastUsedAt: new Date("2025-05-06T16:45:00Z"),
  },
  {
    id: "demo-key-002",
    userId: DEMO_USER.id,
    awsKeyId: "def9876543210uvw",
    keyName: "Mobile SDK",
    keyValue: "ivalt••••••••••••••••••••8b2c",
    isActive: true,
    usagePlanId: "demo-plan-001",
    createdAt: new Date("2025-03-20T09:15:00Z"),
    lastUsedAt: new Date("2025-05-07T07:10:00Z"),
  },
  {
    id: "demo-key-003",
    userId: DEMO_USER.id,
    awsKeyId: "ghi5432109876rst",
    keyName: "Staging Environment",
    keyValue: "ivalt••••••••••••••••••••1d4e",
    isActive: false,
    usagePlanId: "demo-plan-001",
    createdAt: new Date("2025-04-10T14:30:00Z"),
    lastUsedAt: null,
  },
];

let _demoKeys = [...DEMO_API_KEYS];

export function getDemoKeys() {
  return _demoKeys;
}

export function addDemoKey(key: (typeof DEMO_API_KEYS)[0]) {
  _demoKeys = [key, ..._demoKeys];
}

export function deleteDemoKey(id: string) {
  _demoKeys = _demoKeys.filter((k) => k.id !== id);
}

export function toggleDemoKey(id: string, isActive: boolean) {
  _demoKeys = _demoKeys.map((k) => (k.id === id ? { ...k, isActive } : k));
}
