import { NextResponse } from "next/server";
import { getStoredAuthors } from "../../utils/blogAuthorsStore";

export async function GET() {
  try {
    const authors = await getStoredAuthors();
    return NextResponse.json({ authors });
  } catch {
    return NextResponse.json({ authors: [] });
  }
}

