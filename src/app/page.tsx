"use client";

import { useEffect, useState } from "react";
import SearchBar from "./_components/SearchBar";
import SpecialtyCategories from "./_components/SpecialtyCategories";
import AdvocatesGrid from "./_components/AdvocatesGrid";
import { SPECIALTY_CATEGORIES } from "@/types/specialty";
import { Advocate } from "@/types/advocate";
import styles from "./page.module.css";

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchAdvocates = async () => {
      const query = selectedSpecialty || searchTerm;
      const url =
        query.trim() === ""
          ? "/api/advocates"
          : `/api/advocates?q=${encodeURIComponent(query)}`;

      const response = await fetch(url);
      const jsonResponse = await response.json();

      if (jsonResponse.count !== undefined) {
        console.log(
          `Found ${jsonResponse.count} advocates matching "${jsonResponse.query}"`
        );
      }

      setAdvocates(jsonResponse.data);
    };

    const timeoutId = setTimeout(() => {
      fetchAdvocates();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedSpecialty]);

  const handleSpecialtyClick = (specialty: string) => {
    setSelectedSpecialty(specialty);
    setSearchTerm("");
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setSelectedSpecialty(null);
  };

  const clearFilters = () => {
    setSelectedSpecialty(null);
    setSearchTerm("");
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Solace Advocates</h1>
      </header>

      {/* Search Section */}
      <section className={styles.searchSection}>
        <h2 className={styles.pageTitle}>Find your advocate</h2>

        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onClear={clearFilters}
          showClear={!!(searchTerm || selectedSpecialty)}
        />

        <SpecialtyCategories
          categories={SPECIALTY_CATEGORIES}
          selectedSpecialty={selectedSpecialty}
          onSpecialtyClick={handleSpecialtyClick}
        />
      </section>

      <AdvocatesGrid
        advocates={advocates}
        searchTerm={searchTerm}
        selectedSpecialty={selectedSpecialty}
      />
    </div>
  );
}
