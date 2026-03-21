import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export default client;

export function getClient(apiKey?: string | null): Anthropic {
  if (apiKey) {
    return new Anthropic({ apiKey });
  }
  return client;
}
