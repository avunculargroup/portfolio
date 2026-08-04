import styles from "./pull-quote.module.css";

export function PullQuote() {
  return (
    <section className={styles.band}>
      <div className={`wrap ${styles.inner}`}>
        <p className={styles.quote}>
          Ten years leading projects and people. Five years writing the code
          myself. I speak both languages fluently — technical enough to build
          it, senior enough to run it, and to stand in front of a client and
          explain why it&rsquo;s the right call.
        </p>
        <p className={styles.coda}>
          Consider me a product manager with a lot of hands-on experience.
        </p>
      </div>
    </section>
  );
}
