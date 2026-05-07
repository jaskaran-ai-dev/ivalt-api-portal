// AWS API Gateway client — only used in non-demo mode.
// In demo mode all routes short-circuit before calling these functions.

import {
  APIGatewayClient,
  CreateApiKeyCommand,
  DeleteApiKeyCommand,
  GetApiKeyCommand,
  UpdateApiKeyCommand,
  CreateUsagePlanKeyCommand,
  DeleteUsagePlanKeyCommand,
} from "@aws-sdk/client-api-gateway";

function getClient() {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error(
      "AWS credentials not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env.local, or enable NEXT_PUBLIC_DEMO_MODE=true"
    );
  }
  return new APIGatewayClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

const USAGE_PLAN_ID = process.env.AWS_API_GATEWAY_USAGE_PLAN_ID;

export interface CreatedApiKey {
  id: string;
  name: string;
  value: string;
  enabled: boolean;
  createdDate?: Date;
}

export async function createAwsApiKey(keyName: string, description?: string): Promise<CreatedApiKey> {
  const client = getClient();

  const createResult = await client.send(
    new CreateApiKeyCommand({
      name: keyName,
      description: description || `iVALT Portal key: ${keyName}`,
      enabled: true,
      generateDistinctId: true,
    })
  );

  if (!createResult.id || !createResult.value) {
    throw new Error("AWS API Gateway did not return key ID or value");
  }

  if (USAGE_PLAN_ID) {
    await client.send(
      new CreateUsagePlanKeyCommand({
        usagePlanId: USAGE_PLAN_ID,
        keyId: createResult.id,
        keyType: "API_KEY",
      })
    );
  }

  return {
    id: createResult.id,
    name: createResult.name || keyName,
    value: createResult.value,
    enabled: createResult.enabled ?? true,
    createdDate: createResult.createdDate,
  };
}

export async function deleteAwsApiKey(keyId: string): Promise<void> {
  const client = getClient();
  if (USAGE_PLAN_ID) {
    try {
      await client.send(new DeleteUsagePlanKeyCommand({ usagePlanId: USAGE_PLAN_ID, keyId }));
    } catch { /* ignore if not attached */ }
  }
  await client.send(new DeleteApiKeyCommand({ apiKey: keyId }));
}

export async function toggleAwsApiKey(keyId: string, enabled: boolean): Promise<void> {
  const client = getClient();
  await client.send(
    new UpdateApiKeyCommand({
      apiKey: keyId,
      patchOperations: [{ op: "replace", path: "/enabled", value: enabled.toString() }],
    })
  );
}

export async function getAwsApiKey(keyId: string) {
  const client = getClient();
  return client.send(new GetApiKeyCommand({ apiKey: keyId, includeValue: false }));
}
