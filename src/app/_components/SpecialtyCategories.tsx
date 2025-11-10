import { SpecialtyCategory } from "@/types/specialty";
import styles from "./SpecialtyCategories.module.css";

type SpecialtyCategoriesProps = {
  categories: readonly SpecialtyCategory[];
  selectedSpecialty: string | null;
  onSpecialtyClick: (specialty: string) => void;
};

export default function SpecialtyCategories({
  categories,
  selectedSpecialty,
  onSpecialtyClick,
}: SpecialtyCategoriesProps) {
  return (
    <div className={styles.specialtyGrid}>
      {categories.map((category) => (
        <button
          key={category.name}
          onClick={() => onSpecialtyClick(category.name)}
          className={`${styles.specialtyButton} ${
            selectedSpecialty === category.name ? styles.selected : ""
          }`}
        >
          <span className={styles.specialtyIcon}>{category.icon}</span>
          <span className={styles.specialtyName}>{category.name}</span>
        </button>
      ))}
    </div>
  );
}
