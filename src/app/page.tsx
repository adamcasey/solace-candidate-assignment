"use client";

import { useEffect, useState } from "react";
import SearchBar from "./_components/SearchBar";
import SpecialtyCategories from "./_components/SpecialtyCategories";
import AdvocatesGrid from "./_components/AdvocatesGrid";
import styles from "./page.module.css";

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

const SPECIALTY_CATEGORIES = [
  { name: "Anxiety", icon: "🧘" },
  { name: "Depression", icon: "🌧️" },
  { name: "ADHD", icon: "⚡" },
  { name: "Eating disorders", icon: "🍽️" },
  { name: "Chronic pain", icon: "💊" },
  { name: "Women's issues", icon: "👶" },
  { name: "Pediatrics", icon: "👶" },
  { name: "Substance", icon: "🚭" },
  { name: "Sleep", icon: "😴" },
  { name: "Coaching", icon: "🎯" },
];

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
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div>
        <p>Search</p>
        <p>
          Searching for: <span id="search-term"></span>
        </p>
        <input style={{ border: "1px solid black" }} onChange={onChange} />
        <button onClick={onClick}>Reset Search</button>
      </div>
      <br />
      <br />
      <table>
        <thead>
          <th>First Name</th>
          <th>Last Name</th>
          <th>City</th>
          <th>Degree</th>
          <th>Specialties</th>
          <th>Years of Experience</th>
          <th>Phone Number</th>
        </thead>
        <tbody>
          {filteredAdvocates.map((advocate) => {
            return (
              <tr>
                <td>{advocate.firstName}</td>
                <td>{advocate.lastName}</td>
                <td>{advocate.city}</td>
                <td>{advocate.degree}</td>
                <td>
                  {advocate.specialties.map((s) => (
                    <div>{s}</div>
                  ))}
                </td>
                <td>{advocate.yearsOfExperience}</td>
                <td>{advocate.phoneNumber}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
