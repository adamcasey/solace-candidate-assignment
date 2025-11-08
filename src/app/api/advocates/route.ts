import { sql, desc } from "drizzle-orm";
import db from "../../../db";
import { advocates } from "../../../db/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  // TODO: Add pagination support with page/limit query parameters
  if (!query || query.trim() === "") {
    const data = await db.select().from(advocates);
    return Response.json({ data });
  }

  const searchTerm = query.trim();

  const searchWords = searchTerm
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => `${word}:*`)
    .join(" & ");

  let data = await db
    .select()
    .from(advocates)
    .where(sql`${advocates.searchVector} @@ to_tsquery('english', ${searchWords})`)
    .orderBy(desc(sql`ts_rank(${advocates.searchVector}, to_tsquery('english', ${searchWords}))`));

  if (data.length === 0) {
    const combinedTextField = sql`(
      ${advocates.firstName} || ' ' ||
      ${advocates.lastName} || ' ' ||
      ${advocates.city} || ' ' ||
      ${advocates.degree} || ' ' ||
      ${advocates.specialties}::text
    )`;

    data = await db
      .select()
      .from(advocates)
      .where(sql`word_similarity(${searchTerm}, ${combinedTextField}) > 0.3`)
      .orderBy(desc(sql`word_similarity(${searchTerm}, ${combinedTextField})`));
  }

  return Response.json({ data, query: searchTerm, count: data.length });
}
