"use client";

import { MapPin } from "lucide-react";
import Script from "next/script";
import { useEffect, useState } from "react";
// Using native button to avoid React type mismatch during build

interface ZasilkovnaPoint {
  id: string;
  name: string;
  city: string;
  street: string;
  zip: string;
  country: string;
  photo?: string;
  openingHours?: string;
  [key: string]: string | undefined;
}

interface ZasilkovnaWidgetProps {
  onPointSelect: (point: ZasilkovnaPoint | null) => void;
  country?: string;
  language?: string;
  appIdentity?: string;
}

interface PacketaWidget {
  Widget: {
    pick: (
      apiKey: string,
      callback: (point: ZasilkovnaPoint | null) => void,
      options?: object,
    ) => void;
  };
}

declare global {
  interface Window {
    Packeta: PacketaWidget;
    packetaCallback?: (point: ZasilkovnaPoint | null) => void;
  }
}

export default function ZasilkovnaWidget({
  onPointSelect,
  country = "cz",
  language = "cs",
  appIdentity = "yeezuz2020.store",
}: ZasilkovnaWidgetProps) {
  const [selectedPoint, setSelectedPoint] = useState<ZasilkovnaPoint | null>(null);
  const [widgetLoaded, setWidgetLoaded] = useState(false);

  // Zásilkovna API klíč - měl by být v env proměnné
  const apiKey = process.env.NEXT_PUBLIC_ZASILKOVNA_API_KEY || "b8b26fb4e44e8742";

  useEffect(() => {
    // Callback funkce pro widget
    window.packetaCallback = (point: ZasilkovnaPoint | null) => {
      if (point) {
        setSelectedPoint(point);
        onPointSelect(point);
      }
    };

    return () => {
      // Cleanup
      delete window.packetaCallback;
    };
  }, [onPointSelect]);

  const openWidget = () => {
    if (widgetLoaded && window.Packeta && window.packetaCallback) {
      window.Packeta.Widget.pick(apiKey, window.packetaCallback, {
        appIdentity: appIdentity,
        country: country,
        language: language,
      });
    }
  };

  return (
    <>
      <Script
        src="https://widget.packeta.com/v6/www/js/library.js"
        strategy="afterInteractive"
        onLoad={() => setWidgetLoaded(true)}
      />

      <div className="space-y-4">
        {!selectedPoint ? (
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Vyberte výdejní místo</h3>
                  <p className="text-sm text-zinc-600 mt-1">
                    Klikněte na tlačítko a vyberte si nejbližší výdejní místo
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openWidget}
                  disabled={!widgetLoaded}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 ml-4"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Vybrat výdejní místo
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-900 bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-zinc-900" />
                    <h3 className="font-medium">Vybrané výdejní místo</h3>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{selectedPoint.name}</p>
                    <p className="text-zinc-600">{selectedPoint.street}</p>
                    <p className="text-zinc-600">
                      {selectedPoint.zip} {selectedPoint.city}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={openWidget}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 ml-4"
                >
                  Změnit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
