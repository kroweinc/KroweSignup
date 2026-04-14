import { notFound } from "next/navigation";
import { isUrlOnboardingScrapeEnabled } from "@/lib/env";
import UrlOnboardingReviewClient from "./UrlOnboardingReviewClient";

export default function UrlOnboardingReviewPage() {
  if (!isUrlOnboardingScrapeEnabled()) {
    notFound();
  }

  return <UrlOnboardingReviewClient />;
}
