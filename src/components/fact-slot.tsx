import { PLACEHOLDER_MODE } from "@/lib/placeholder";
import styles from "./fact-slot.module.css";

interface FactSlotProps {
  /** What fact this slot is asking Chris for. Shown only in placeholder mode. */
  label: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Wraps one fact-shaped hole in the page. In placeholder mode it shows its
 * label so the brief is legible on the rendered page; otherwise it is a bare
 * wrapper, so the real copy renders exactly as it would without this component.
 */
export function FactSlot({ label, className, children }: FactSlotProps) {
  return (
    <div className={className ? `${styles.slot} ${className}` : styles.slot}>
      {PLACEHOLDER_MODE ? <p className={styles.label}>{label}</p> : null}
      {children}
    </div>
  );
}
