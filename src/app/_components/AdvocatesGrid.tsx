import AdvocateCard from "./AdvocateCard";
import EmptyState from "./EmptyState";
import styles from "./AdvocatesGrid.module.css";

type Advocate = {
  id?: string | number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: string | number;
  phoneNumber: string;
};

type AdvocatesGridProps = {
  advocates: Advocate[];
  searchTerm?: string;
  selectedSpecialty?: string | null;
};

export default function AdvocatesGrid({
  advocates,
  searchTerm,
  selectedSpecialty,
}: AdvocatesGridProps) {
  const query = selectedSpecialty || searchTerm;

  return (
    <section className={styles.advocatesSection}>
      {/* Results Count */}
      <div className={styles.resultsCount}>
        <p className={styles.resultsText}>
          {advocates.length} {advocates.length === 1 ? "advocate" : "advocates"}{" "}
          available
          {query && (
            <span className={styles.resultsHighlight}>
              {" "}
              for &ldquo;{query}&rdquo;
            </span>
          )}
        </p>
      </div>

      {/* Grid */}
      <div className={styles.advocatesGrid}>
        {advocates.map((advocate: Advocate) => {
          const advocateKey =
            advocate.id ||
            `${advocate.firstName}-${advocate.lastName}-${advocate.phoneNumber}`;

          return <AdvocateCard key={advocateKey} advocate={advocate} />;
        })}
      </div>

      {advocates.length === 0 && (
        <EmptyState
          title="No advocates found"
          message="Try adjusting your search or filters"
        />
      )}
    </section>
  );
}
