// AWS API Gateway Usage Service
// Fetches key usage statistics from AWS API Gateway

import { 
  APIGatewayClient, 
  GetUsagePlanKeysCommand,
  GetUsageCommand,
  type UsagePlanKey 
} from "@aws-sdk/client-api-gateway";

const REGION = process.env.AWS_REGION || "us-east-1";
const USAGE_PLAN_ID = process.env.AWS_API_GATEWAY_USAGE_PLAN_ID;

// Lazy client initialization
let client: APIGatewayClient | null = null;

function getClient(): APIGatewayClient {
  if (!client) {
    client = new APIGatewayClient({ 
      region: REGION,
      // Credentials from environment variables
    });
  }
  return client;
}

// DEMO MODE - Returns mock data
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export interface ApiKeyUsage {
  awsKeyId: string;
  usageCount: number;
}

export async function fetchApiKeyUsage(): Promise<ApiKeyUsage[]> {
  // In demo mode, return mock usage data
  if (DEMO_MODE) {
    return [
      { awsKeyId: "demo-key-001", usageCount: 15420 },
      { awsKeyId: "demo-key-002", usageCount: 8750 },
      { awsKeyId: "demo-key-003", usageCount: 0 },
    ];
  }

  const apiKeyClient = getClient();
  const usageData: ApiKeyUsage[] = [];

  try {
    // Get all keys in the usage plan
    const keysParams = {
      usagePlanId: USAGE_PLAN_ID!,
      limit: 100,
    };

    const keysCommand = new GetUsagePlanKeysCommand(keysParams);
    const keysResponse = await apiKeyClient.send(keysCommand) as { keys?: { id: string; value: string }[] };

    if (!keysResponse.keys || keysResponse.keys.length === 0) {
      return [];
    }

    // For each key, get its usage
    for (const key of keysResponse.keys) {
      if (!key.id || !key.value) continue;

      // Get usage for this specific key
      const usageParams = {
        usagePlanId: USAGE_PLAN_ID!,
        apiKey: key.value,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
        endDate: new Date().toISOString(),
      };

      const usageCommand = new GetUsageCommand(usageParams);
      const usageResponse = await apiKeyClient.send(usageCommand) as { usage?: { count?: number }[] };

      // Sum up the usage count from all periods
      let totalCount = 0;
      if (usageResponse.usage) {
        for (const period of usageResponse.usage) {
          if (period.count) {
            totalCount += period.count;
          }
        }
      }

      usageData.push({
        awsKeyId: key.id,
        usageCount: totalCount,
      });
    }
  } catch (error) {
    console.error("Error fetching API key usage:", error);
    // Return empty array on error - usage tracking is not critical
    return [];
  }

  return usageData;
}

// Export for server-side usage
export { getClient };