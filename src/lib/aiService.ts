import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRandomCategory } from "./topicCategories";
import { getProductKnowledgeBase } from "./productKnowledge";
import { isTopicPublished } from "./topicTracker";

function getGenAI(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set — add it to run AI features.");
  }
  return new GoogleGenerativeAI(key);
}

/**
 * Generate a unique blog topic using Gemini AI
 */
export async function generateUniqueTopic(
  maxRetries: number = 5
): Promise<{ title: string; category: string }> {
  const category = getRandomCategory();
  const productKnowledge = getProductKnowledgeBase();

  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are a content strategist for a solar panel cleaning robot company called Taypro.

Generate 5 unique, SEO-friendly blog topic titles about: ${category.name}

Category Description: ${category.description}
Category Keywords: ${category.keywords.join(", ")}

Requirements:
- Each topic should be unique and not repeated
- Topics should be relevant to solar panel cleaning robots, solar power plant operations & maintenance (O&M), or related solar energy topics
- Topics should be SEO-optimized and engaging
- Each topic should be 8-15 words long
- Topics should sound natural and human-written
- Focus on practical, valuable content for solar plant operators and managers

${productKnowledge}

IMPORTANT: 
- Only reference Taypro products if the topic naturally calls for it
- Use ONLY verified information from the knowledge base above
- Do NOT invent product features or specifications

Return ONLY a JSON array of 5 topic titles, like this:
["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"]`;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      // Extract JSON array from response
      let topics: string[] = [];
      try {
        // Try to parse as JSON directly
        topics = JSON.parse(text);
      } catch {
        // If that fails, try to extract JSON from markdown code blocks or text
        // Use a cross-line-safe pattern without relying on the /s flag
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          topics = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: split by newlines and clean up
          topics = text
            .split("\n")
            .map((line) => line.replace(/^[-*•]\s*/, "").replace(/^"\s*|\s*"$/g, "").trim())
            .filter((line) => line.length > 0)
            .slice(0, 5);
        }
      }

      // Check each topic for uniqueness
      for (const topicTitle of topics) {
        if (!topicTitle || typeof topicTitle !== "string") continue;

        const isPublished = await isTopicPublished(topicTitle);
        if (!isPublished) {
          return {
            title: topicTitle.trim(),
            category: category.name,
          };
        }
      }

      // If all topics are duplicates, try again
      if (attempt < maxRetries - 1) {
        console.log(`All topics were duplicates, retrying... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
        continue;
      }
    } catch (error) {
      console.error(`Error generating topic (attempt ${attempt + 1}):`, error);
      if (attempt === maxRetries - 1) {
        throw new Error(`Failed to generate unique topic after ${maxRetries} attempts: ${error}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error(`Failed to generate unique topic after ${maxRetries} attempts`);
}

/**
 * Generate blog content using Gemini AI
 */
export async function generateBlogContent(
  topic: string,
  category: string
): Promise<{
  title: string;
  description: string;
  content: string;
}> {
  const productKnowledge = getProductKnowledgeBase();
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are an expert content writer specializing in solar panel cleaning robots and solar power plant operations & maintenance. Write a comprehensive, SEO-optimized blog post about: ${topic}

CRITICAL: Product/Service Information Accuracy
- ONLY use the following verified information about Taypro products/services. DO NOT invent or hallucinate any features, specifications, or capabilities.
- If you need to mention Taypro products, refer ONLY to this knowledge base:

${productKnowledge}

- DO NOT make up specifications, features, or capabilities
- DO NOT invent model numbers or product names
- If unsure about a product detail, either omit it or state it generically
- Always verify any technical claims against the knowledge base

Requirements:
- Word count: 1500-2500 words
- Natural, conversational tone (avoid AI-sounding language)
- Factual, accurate information about solar panel cleaning and solar plant O&M
- Include relevant statistics and data points (use industry-standard ranges, not specific unverified numbers)
- Use headings (H2, H3) for structure
- Include bullet points and examples
- Natural keyword integration (solar panel cleaning robot, solar plant maintenance, solar O&M, etc.)
- Good readability (aim for Flesch Reading Ease 60+)
- Original content (do not copy from other sources)
- Include practical tips and actionable insights
- Cover overall solar power plant operations and maintenance when relevant
- Reference Taypro's solutions naturally where relevant, but ONLY use verified information

Format the output as clean HTML with proper paragraph tags (<p>), headings (<h2>, <h3>), and lists (<ul>, <ol>).

Return the response in the following JSON format:
{
  "title": "Blog post title (SEO-optimized, 50-60 characters)",
  "description": "Meta description (150-160 characters, SEO-optimized)",
  "content": "<p>Full HTML content here...</p>"
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Extract JSON from response
    let blogData: { title: string; description: string; content: string };
    try {
      // Try to parse as JSON directly
      blogData = JSON.parse(text);
    } catch {
      // If that fails, try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        blogData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse JSON from AI response");
      }
    }

    // Validate response structure
    if (!blogData.title || !blogData.description || !blogData.content) {
      throw new Error("AI response missing required fields (title, description, content)");
    }

    return {
      title: blogData.title.trim(),
      description: blogData.description.trim(),
      content: blogData.content.trim(),
    };
  } catch (error) {
    console.error("Error generating blog content:", error);
    throw new Error(
      `Failed to generate blog content: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
