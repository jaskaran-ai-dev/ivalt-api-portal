// iVALT API client — only called in non-demo mode.

const IVALT_BASE_URL = process.env.IVALT_API_BASE_URL || "https://api.ivalt.com";
const SECURITY_TOKEN = process.env.IVALT_SECURITY_TOKEN || "";

export type BiometricAuthStatus = "pending" | "authenticated" | "failed" | "not_found" | "timeout";

export interface BiometricAuthRequestResponse {
  success: boolean;
  message?: string;
  statusCode: number;
}

export interface BiometricResultResponse {
  status: BiometricAuthStatus;
  statusCode: number;
  data?: Record<string, unknown>;
}

export async function sendBiometricAuthRequest(mobileNumber: string): Promise<BiometricAuthRequestResponse> {
  try {
    const response = await fetch(`${IVALT_BASE_URL}/BiometricAuthRequest`, {
      method: "POST",
      headers: { "Content-Type": "application/json", token: SECURITY_TOKEN },
      body: JSON.stringify({ mobile_number: mobileNumber }),
    });

    if (response.status === 404) {
      return { success: false, message: "User not found in iVALT system", statusCode: 404 };
    }
    if (!response.ok) {
      return { success: false, message: "Failed to send auth request", statusCode: response.status };
    }
    return { success: true, statusCode: response.status };
  } catch {
    return { success: false, message: "Network error contacting iVALT", statusCode: 0 };
  }
}

export async function getBiometricResult(mobileNumber: string): Promise<BiometricResultResponse> {
  try {
    const response = await fetch(`${IVALT_BASE_URL}/BiometricResultRequest`, {
      method: "POST",
      headers: { "Content-Type": "application/json", token: SECURITY_TOKEN },
      body: JSON.stringify({ mobile_number: mobileNumber }),
    });

    switch (response.status) {
      case 200: return { status: "authenticated", statusCode: 200, data: await response.json().catch(() => ({})) };
      case 422: return { status: "pending", statusCode: 422 };
      case 403: return { status: "failed", statusCode: 403 };
      case 404: return { status: "not_found", statusCode: 404 };
      default:  return { status: "failed", statusCode: response.status };
    }
  } catch {
    return { status: "failed", statusCode: 0 };
  }
}
