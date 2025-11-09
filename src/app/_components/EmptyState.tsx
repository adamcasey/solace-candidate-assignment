import styles from "./EmptyState.module.css";

type EmptyStateProps = {
  title?: string;
  message?: string;
};

export default function EmptyState({
  title = "No results found",
  message = "Try adjusting your search or filters",
}: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <p className={styles.title}>{title}</p>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
