import { sql, SQL } from "drizzle-orm";
import {
  pgTable,
  integer,
  text,
  jsonb,
  serial,
  timestamp,
  bigint,
  index,
  customType,
} from "drizzle-orm/pg-core";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

const advocates = pgTable(
  "advocates",
  {
    id: serial("id").primaryKey(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    city: text("city").notNull(),
    degree: text("degree").notNull(),
    specialties: jsonb("payload").default([]).notNull(),
    yearsOfExperience: integer("years_of_experience").notNull(),
    phoneNumber: bigint("phone_number", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
    // Weight: A=highest (names), B=medium (city, degree), C=lower (specialties)
    searchVector: tsvector("search_vector")
      .generatedAlwaysAs(
        (): SQL =>
          sql`setweight(to_tsvector('english', coalesce(first_name, '')), 'A') || setweight(to_tsvector('english', coalesce(last_name, '')), 'A') || setweight(to_tsvector('english', coalesce(city, '')), 'B') || setweight(to_tsvector('english', coalesce(degree, '')), 'B') || setweight(to_tsvector('english', coalesce(payload::text, '')), 'C')`
      )
      .notNull(),
  },
  (table) => ({
    // fastupdate=off for better query performance on read-heavy workloads
    searchVectorIdx: index("advocates_search_vector_idx")
      .using("gin", table.searchVector)
      .with({ fastupdate: "off" }),
    nameTrigramIdx: index("advocates_name_trigram_idx")
      .using("gin", sql`(first_name || ' ' || last_name || ' ' || city) gin_trgm_ops`),
    specialtiesIdx: index("advocates_specialties_idx")
      .using("gin", table.specialties)
      .with({ fastupdate: "off" }),
  })
);

export { advocates };
