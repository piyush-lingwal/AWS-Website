import { buildLlmsTxt } from "@/lib/seo/llms-txt";
import { getSiteUrl } from "@/lib/seo/site";

// llms.txt is an EMERGING, NON-STANDARD convention (llmstxt.org). Google Search
// ignores it; it is served only as low-cost optionality for AI tools that may read it.
export function GET() {
  return new Response(buildLlmsTxt(getSiteUrl()), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
