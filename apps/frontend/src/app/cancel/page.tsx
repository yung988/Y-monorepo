import { XCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Objednávka zrušena | YEEZUZ2020",
  description: "Vaše objednávka byla zrušena.",
};

export default function CancelPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto text-center py-16">
        <div className="flex justify-center mb-6">
          <XCircle className="w-24 h-24 text-zinc-400" />
        </div>

        <h1 className="text-3xl font-bold mb-4">Objednávka byla zrušena</h1>

        <p className="text-lg text-zinc-600 mb-8">
          Vaše platba nebyla dokončena a objednávka byla zrušena.
        </p>

        <p className="mb-10 text-zinc-600">
          Peníze vám nebyly z účtu odečteny. Pokud máte jakékoliv dotazy, kontaktujte nás na{" "}
          <strong>support@yeezuz2020.com</strong>.
        </p>

        <div className="flex justify-center space-x-4">
          <Link
            href="/"
            className="px-6 py-3 bg-black text-white hover:bg-zinc-800 transition-colors"
          >
            Zpět do obchodu
          </Link>

          <Link
            href="/"
            className="px-6 py-3 border border-black hover:bg-zinc-100 transition-colors"
          >
            Hlavní stránka
          </Link>
        </div>
      </div>
    </div>
  );
}
