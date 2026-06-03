import type { BlogAuthor } from "@/app/data/blogAuthors";

/** Prompt block: topic + article must align with the byline author's bio and role. */
export function formatAuthorVoicePrompt(author: BlogAuthor): string {
  const bio = author.bio?.trim() || "(no bio on file)";
  return `BYLINE AUTHOR (topic choice and article voice MUST fit this person):
Name: ${author.name}
Role: ${author.role}
Bio: ${bio}

Author alignment rules:
- Only choose angles this author can credibly own from their role and bio above.
- Tie solar panel cleaning, utility-scale O&M, and Taypro solutions where natural; do not invent unrelated career details.
- Do not claim degrees, employers, or certifications not implied by the bio.
- Write as an experienced practitioner in their lane, not generic corporate marketing.`;
}
