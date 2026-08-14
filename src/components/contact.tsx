import { AVAILABILITY, SITE } from "@/lib/config";
import styles from "./contact.module.css";

export function Contact() {
  return (
    <section className={styles.section} id="contact" aria-labelledby="contact-title">
      <div className="wrap">
        <div className={styles.contact}>
          <div>
            <p className={styles.eyebrow}>Get in touch</p>
            <h2 id="contact-title" className={styles.headline}>
              Building something that needs someone who can take LLM agents
              from demo to production — and land the delivery around them?
              Let&rsquo;s talk.
            </h2>
            <p className={styles.availability}>{AVAILABILITY.full}</p>
            <p className={styles.place}>{SITE.location}</p>
          </div>

          <div className={styles.right}>
            <a className={styles.mail} href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
            <ul className={styles.links}>
              <li>
                <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href={SITE.github} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
