import type { Metadata } from "next";
import Link from "next/link";
import { CvDocument } from "@/components/cv-document";
import { PlaceholderBanner } from "@/components/placeholder-banner";
import { SiteHeader } from "@/components/site-header";
import { CV, CV_PDF_FILENAME, CV_PDF_PATH, CV_UPDATED } from "@/lib/cv";
import { SITE } from "@/lib/config";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} — CV` },
  description: `${CV.thesis} CV for ${SITE.name}, ${SITE.role}, Melbourne. Read it here or download the two-page PDF.`,
  alternates: { canonical: "/cv" },
};

export default function CvPage() {
  return (
    <>
      <PlaceholderBanner />
      <SiteHeader />
      <main id="main" className={styles.main}>
        <div className="wrap">
          <div className={styles.bar}>
            <p className={styles.meta}>
              <span className={styles.metaLabel}>CV</span>
              Updated {CV_UPDATED}
            </p>
            <a
              className={styles.download}
              href={CV_PDF_PATH}
              download={CV_PDF_FILENAME}
            >
              Download PDF <span className={styles.size}>· 2 pages</span>
            </a>
          </div>

          <CvDocument mode="web" />

          <p className={styles.close}>
            Every line here can be checked: ask the{" "}
            <Link href="/#ask">live agent</Link>, read the{" "}
            <a href="https://github.com/avunculargroup/business-mono">code</a>,
            or email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </p>
        </div>
      </main>
    </>
  );
}
