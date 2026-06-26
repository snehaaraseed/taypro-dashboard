export type LeadContextInput = {
  pathname: string;
  leadIntent?: string;
  leadContext?: string;
  analyticsFormType?: string;
  analyticsSource?: string;
  analyticsTopic?: string;
  title?: string;
};

export function buildLeadContext(input: LeadContextInput): string {
  if (input.leadContext?.trim()) {
    return input.leadContext.trim();
  }

  const lines: string[] = [];
  const intent =
    input.leadIntent?.trim() ||
    input.analyticsTopic?.trim() ||
    input.analyticsFormType?.trim() ||
    "Website lead";

  lines.push(`Intent: ${intent}`);
  lines.push(`Page: ${input.pathname}`);

  if (input.analyticsSource?.trim()) {
    lines.push(`Source: ${input.analyticsSource.trim()}`);
  }
  if (input.title?.trim()) {
    lines.push(`Form: ${input.title.trim()}`);
  }

  return lines.join("\n");
}

export function buildLeadComments(
  context: string,
  userMessage?: string
): string {
  const trimmedContext = context.trim();
  const trimmedMessage = userMessage?.trim() ?? "";

  if (!trimmedContext && !trimmedMessage) return "";
  if (!trimmedMessage) {
    return `--- Lead context ---\n${trimmedContext}`;
  }
  if (!trimmedContext) {
    return `--- Visitor notes ---\n${trimmedMessage}`;
  }

  return `--- Lead context ---\n${trimmedContext}\n\n--- Visitor notes ---\n${trimmedMessage}`;
}
