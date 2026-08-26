import { AskSection } from "@/components/ask-section";
import { CaseStudy } from "@/components/case-study";
import { Contact } from "@/components/contact";
import { ExperienceTimeline } from "@/components/experience-timeline";
import { FailureStory } from "@/components/failure-story";
import { FlexiDirectCaseStudy } from "@/components/flexidirect-case-study";
import { Hero, parseHeroVariant } from "@/components/hero";
import { Principles } from "@/components/principles";
import { PullQuote } from "@/components/pull-quote";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PlaceholderBanner } from "@/components/placeholder-banner";
import { SkillsBand } from "@/components/skills-band";
import { getCapabilities, SITE } from "@/lib/config";
import { CHAT_MODEL } from "@/lib/openrouter";

/*
 * Rendered per-request so the agent's availability reflects the deployment's
 * actual configuration rather than a value baked in at build time.
 */
export const dynamic = "force-dynamic";

/**
 * `searchParams` is read only for the placeholder pass's `?hero=1|2|3` variant
 * switch. The page is already force-dynamic, so this costs nothing extra.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { chat } = getCapabilities();
  const heroVariant = parseHeroVariant((await searchParams).hero);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    jobTitle: SITE.role,
    email: `mailto:${SITE.email}`,
    url: SITE.url,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Melbourne",
      addressCountry: "AU",
    },
    sameAs: [SITE.linkedin, SITE.github],
    description: SITE.description,
  };

  return (
    <>
      <PlaceholderBanner />
      <SiteHeader />
      <main id="main">
        <Hero variant={heroVariant} />
        <PullQuote />
        <AskSection agentAvailable={chat} chatModelLabel={CHAT_MODEL} />
        {/* Placed above business-mono deliberately: FlexiDirect is the only
            section that evidences product judgement rather than build
            capability, so it is the first thing a product reader meets after
            the agent (placeholder pass, August 2026). */}
        <FlexiDirectCaseStudy />
        <CaseStudy />
        <Principles />
        {/* The failure story is the evidence for the second principle, so it
            sits directly under it rather than in a section of its own. */}
        <FailureStory />
        <SkillsBand />
        <ExperienceTimeline />
        <Contact />
        <SiteFooter />
      </main>
      <script
        type="application/ld+json"
        // Static, developer-authored object — no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
    </>
  );
}
