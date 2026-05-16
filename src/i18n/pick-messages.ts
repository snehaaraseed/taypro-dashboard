/** Top-level namespaces passed to NextIntlClientProvider (reduces serialized HTML). */
export function pickMessages(
  messages: Record<string, unknown>,
  namespaces: readonly string[]
): Record<string, unknown> {
  const picked: Record<string, unknown> = {};
  for (const key of namespaces) {
    if (key in messages) {
      picked[key] = messages[key];
    }
  }
  return picked;
}
