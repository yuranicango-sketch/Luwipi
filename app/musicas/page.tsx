import { MusicLibraryBrowser } from "@/components/music-library-browser";
import { ProductShell } from "@/components/product-shell";
import { kidsSongs } from "@/lib/music-library";

export default function MusicLibraryPage() {
  return <ProductShell backHref="/dashboard?age=5-8" backLabel="Aulas"><div className="container"><MusicLibraryBrowser songs={kidsSongs}/></div></ProductShell>;
}
