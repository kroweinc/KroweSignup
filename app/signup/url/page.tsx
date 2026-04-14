import { notFound } from "next/navigation";
import { isUrlOnboardingScrapeEnabled } from "@/lib/env";
import UrlOnboardingStartClient from "./UrlOnboardingStartClient";

export default function UrlOnboardingPage() {
  if (!isUrlOnboardingScrapeEnabled()) {
    notFound();
  }

  return <UrlOnboardingStartClient />;
}
