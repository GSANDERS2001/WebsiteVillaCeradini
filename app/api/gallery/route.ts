import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const imagesDir = path.join(process.cwd(), "public", "images");
    const files = fs.readdirSync(imagesDir);

    // allow common extensions, ignore hidden files and the hero image if present
    const allowed = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
    const list = files
      .filter((f) => {
        const ext = path.extname(f).toLowerCase();
        const isImage = allowed.has(ext);
        const isHidden = f.startsWith(".");
        const isHero = f.toLowerCase() === "villa-hero.jpg";
        return isImage && !isHidden && !isHero;
      })
      .sort();

    return NextResponse.json({ images: list });
  } catch (e) {
    return NextResponse.json({ images: [] }, { status: 200 });
  }
}
