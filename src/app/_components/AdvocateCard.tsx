import { Advocate } from "@/types/advocate";
import styles from "./AdvocateCard.module.css";

type AdvocateCardProps = {
  advocate: Advocate;
};

export default function AdvocateCard({ advocate }: AdvocateCardProps) {
  return (
    <div className={styles.advocateCard}>
      {/* Name and Degree */}
      <h3 className={styles.advocateName}>
        {advocate.firstName} {advocate.lastName}, {advocate.degree}
      </h3>

      {/* Location */}
      <p className={styles.advocateLocation}>📍 {advocate.city}</p>

      {/* Specialties */}
      <div className={styles.specialtiesContainer}>
        <p className={styles.specialtiesLabel}>Specialties</p>
        <div className={styles.specialtyTags}>
          {advocate.specialties.slice(0, 3).map((s: string) => (
            <span key={s.toLowerCase()} className={styles.specialtyTag}>
              {s}
            </span>
          ))}
          {advocate.specialties.length > 3 && (
            <span className={styles.moreTag}>
              +{advocate.specialties.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Experience */}
      <p className={styles.advocateExperience}>
        ⭐ {advocate.yearsOfExperience} years experience
      </p>

      {/* Contact */}
      <p className={styles.advocateContact}>📞 {advocate.phoneNumber}</p>
    </div>
  );
}
