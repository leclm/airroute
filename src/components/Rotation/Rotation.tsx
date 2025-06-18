import { useEffect, useState } from "react";

interface Rotation {
  ident: string;
  origin: string;
  destination: string;
  readable_departure: string;
  readable_arrival: string;
}

export default function Rotation({ selectedAircraft }: { selectedAircraft: string | null }) {
  const [rotation, setRotation] = useState<Rotation[]>([]);

  const loadRotation = () => {
    if (!selectedAircraft) return;
    const stored = localStorage.getItem("rotation-by-aircraft");
    const all = stored ? JSON.parse(stored) : {};
    setRotation(all[selectedAircraft] || []);
  };

  useEffect(() => {
    loadRotation();
    window.addEventListener("flight-added", loadRotation);
    window.addEventListener("flight-removed", loadRotation);
    return () => {
      window.removeEventListener("flight-added", loadRotation);
      window.removeEventListener("flight-removed", loadRotation);
    };
  }, [selectedAircraft]);

  const saveRotation = (newRotation: Rotation[]) => {
    if (!selectedAircraft) return;
    const stored = localStorage.getItem("rotation-by-aircraft");
    const all = stored ? JSON.parse(stored) : {};
    all[selectedAircraft] = newRotation;
    localStorage.setItem("rotation-by-aircraft", JSON.stringify(all));
  };

  const handleRemoveFlight = (ident: string) => {
    const index = rotation.findIndex((f) => f.ident === ident);
    if (index === -1) return;
    const updatedRotation = rotation.slice(0, index);
    setRotation(updatedRotation);
    saveRotation(updatedRotation);
    window.dispatchEvent(new CustomEvent("flight-removed", { detail: ident }));
  };

  return (
    <div className="bg-white/10 border border-gray-700 p-6 rounded-2xl shadow-xl w-full max-w-4xl mx-auto max-h-[70vh]">
      <h2 className="text-2xl font-bold text-white mb-6">Rotation {selectedAircraft || ""}</h2>
      {rotation.length === 0 ? (
        <p className="text-white text-center text-lg">No flights registered.</p>
      ) : (
        <div className="overflow-y-auto max-h-[calc(70vh-8rem)] pr-2 space-y-4">
          {rotation.map((flight) => (
            <div
              key={flight.ident}
              onClick={() => handleRemoveFlight(flight.ident)}
              className="bg-white/10 rounded-xl p-4 border border-gray-600 shadow hover:bg-white/20 cursor-pointer"
              title="Click to remove the flight from the rotation"
            >
              <h3 className="text-xl font-semibold text-blue-200">Flight {flight.ident}</h3>
              <p className="text-sm text-gray-300">
                <strong>Origin:</strong> {flight.origin} – <strong>Destination:</strong> {flight.destination}
              </p>
              <p className="text-sm text-gray-300">
                <strong>Departure:</strong> {flight.readable_departure} – <strong>Arrival:</strong> {flight.readable_arrival}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
