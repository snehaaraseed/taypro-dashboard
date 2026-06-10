import type { DynamicBlog } from "@/app/api/blog/list/route";
import NotFoundContent from "@/app/components/NotFoundContent";
import type { NotFoundContentLabels } from "@/app/components/NotFoundContent";
import type { RecoveryResult } from "@/lib/url-recovery/types";

type RecoveryNotFoundViewProps = {
  labels: NotFoundContentLabels;
  suggestion?: RecoveryResult;
  similarBlogs?: DynamicBlog[];
  currentBlogSlug?: string;
};

export default function RecoveryNotFoundView({
  labels,
  suggestion,
  similarBlogs,
  currentBlogSlug,
}: RecoveryNotFoundViewProps) {
  const didYouMeanHref =
    suggestion?.kind === "suggest" ? suggestion.destination : undefined;

  return (
    <NotFoundContent
      labels={labels}
      didYouMeanHref={didYouMeanHref}
      similarBlogs={similarBlogs}
      currentBlogSlug={currentBlogSlug}
    />
  );
}
