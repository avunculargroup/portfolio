import { CV, PRINT_BREAK_BEFORE, type CvRole } from "@/lib/cv";
import type { CvAskId } from "@/lib/config";
import styles from "./cv-document.module.css";

/**
 * The CV, rendered from lib/cv.ts. One component, two modes:
 *
 * - "web"   — /cv. Responsive; each role carries an "Ask the agent" link.
 * - "print" — /cv/print, the page scripts/generate-cv-pdf.ts prints to A4.
 *   No links-as-UI, fixed sizes in pt, a hard page break before
 *   PRINT_BREAK_BEFORE so the PDF is exactly two pages.
 *
 * Server component: no interactivity needed.
 */
export function CvDocument({ mode }: { mode: "web" | "print" }) {
  const web = mode === "web";

  return (
    <article className={`${styles.doc} ${web ? styles.web : styles.print}`}>
      <header className={styles.head}>
        <p className={styles.eyebrow}>
          <span className={styles.dot} aria-hidden="true" />
          {CV.role}
        </p>
        <h1 className={styles.name}>{CV.name}</h1>
        <p className={styles.thesis}>{CV.thesis}</p>
        <ul className={styles.contact}>
          <li>{CV.location}</li>
          <li>
            <a href={`mailto:${CV.email}`}>{CV.email}</a>
          </li>
          {CV.links.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
        <p className={styles.availability}>{CV.availability}</p>
      </header>

      <section className={styles.row} aria-labelledby="cv-profile">
        <h2 id="cv-profile" className={styles.label}>
          Profile
        </h2>
        <p className={styles.profile}>{CV.profile}</p>
      </section>

      <section className={styles.build} aria-labelledby="cv-build">
        <div className={styles.buildHead}>
          <p className={styles.label}>{CV.build.eyebrow}</p>
          <h2 id="cv-build" className={styles.buildName}>
            {CV.build.name}
          </h2>
          <a className={styles.buildLink} href={CV.build.href}>
            {CV.build.hrefLabel} · github.com/avunculargroup
          </a>
        </div>
        <p>{CV.build.summary}</p>
        <dl className={styles.facts}>
          {CV.build.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.text}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.stack}>{CV.build.stack}</p>
        {web && <AskLink id={CV.build.ask} />}
      </section>

      <section className={styles.experience} aria-labelledby="cv-experience">
        <h2 id="cv-experience" className={`${styles.label} ${styles.sectionLabel}`}>
          Experience
        </h2>
        {CV.roles.map((role) => (
          <Role key={role.org} role={role} web={web} />
        ))}
      </section>

      <section className={styles.skills} aria-label="Skills and education">
        {CV.skills.map((group) => (
          <div key={group.label}>
            <h2 className={styles.label}>{group.label}</h2>
            {group.items.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        ))}
      </section>
    </article>
  );
}

function Role({ role, web }: { role: CvRole; web: boolean }) {
  const breakBefore = role.org === PRINT_BREAK_BEFORE;

  return (
    <article
      className={`${styles.role} ${breakBefore ? styles.breakBefore : ""}`}
    >
      <p className={styles.when}>
        <span className={role.current ? styles.current : undefined}>
          {role.current && <span className={styles.dot} aria-hidden="true" />}
          {role.from}
        </span>{" "}
        <span>{role.to}</span>
        {role.place && <span className={styles.place}>{role.place}</span>}
      </p>
      <div className={styles.body}>
        <h3 className={styles.org}>
          {role.org}
          {role.title && <span className={styles.title}> · {role.title}</span>}
        </h3>
        {role.summary && <p>{role.summary}</p>}
        {role.points && (
          <ul className={styles.points}>
            {role.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        )}
        {web && role.ask && <AskLink id={role.ask} />}
      </div>
    </article>
  );
}

/**
 * Opens the home page and sends the allow-listed question (lib/config).
 * A plain <a>, not next/link, on purpose: a full navigation guarantees
 * AskSection mounts with `?ask=` already in window.location.
 */
function AskLink({ id }: { id: CvAskId }) {
  return (
    <a className={styles.ask} href={`/?ask=${id}#ask`}>
      Ask the agent about this <span aria-hidden="true">→</span>
    </a>
  );
}
