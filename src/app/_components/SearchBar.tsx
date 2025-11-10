import styles from "./SearchBar.module.css";

type SearchBarProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  showClear: boolean;
};

export default function SearchBar({
  searchTerm,
  onSearchChange,
  onClear,
  showClear,
}: SearchBarProps) {
  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        placeholder="Search by name, specialty, or location..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className={styles.searchInput}
      />
      {showClear && (
        <button onClick={onClear} className={styles.clearButton}>
          Clear
        </button>
      )}
    </div>
  );
}
