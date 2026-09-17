import Link from "next/link";
import styles from "./duo-action.module.css";

type Props = {
  href?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  tone?: "green" | "blue";
  full?: boolean;
};

export function DuoAction({
  href,
  children = "COMEÇAR",
  disabled = false,
  tone = "green",
  full = true,
}: Props) {
  const className = `${styles.button} ${styles[tone]} ${full ? styles.full : ""} ${disabled ? styles.disabled : ""}`;

  if (!href || disabled) {
    return <span className={className}>{disabled ? "EM PREPARAÇÃO" : children}</span>;
  }

  return <Link className={className} href={href}>{children}</Link>;
}
