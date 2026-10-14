import type { Metadata } from "next";
import CompetitorAudiencePlaybook from "./playbook";

export const metadata: Metadata = {
  title: "Your next customers might be in your competitors' comments",
  description:
    "A quick, practical play for finding the few people in a competitor's audience worth talking to.",
  alternates: {
    canonical: "/playbooks/steal-your-competitors-audience",
  },
  openGraph: {
    title: "Your next customers might be in your competitors' comments",
    description:
      "A quick, practical play for finding the few people in a competitor's audience worth talking to.",
    type: "article",
  },
};

export default function Page() {
  return <CompetitorAudiencePlaybook />;
}
