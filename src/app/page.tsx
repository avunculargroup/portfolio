import { AskSection } from "@/components/ask-section";
import { CaseStudy } from "@/components/case-study";
import { Contact } from "@/components/contact";
import { ExperienceTimeline } from "@/components/experience-timeline";
import { Hero } from "@/components/hero";
import { PullQuote } from "@/components/pull-quote";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkillsBand } from "@/components/skills-band";
import { getCapabilities, SITE } from "@/lib/config";
import { CHAT_MODEL } from "@/lib/openrouter";

/*
 * Rendered per-request so the agent's availability reflects the deployment's
 * actual configuration rather than a value baked in at build time.
 */
export const dynamic = "force-dynamic";

export default function Page() {
  const { chat } = getCapabilities();

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
      <SiteHeader />
      <main id="main">
        <Hero />
        <PullQuote />
        <AskSection agentAvailable={chat} chatModelLabel={CHAT_MODEL} />
        <CaseStudy />
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
