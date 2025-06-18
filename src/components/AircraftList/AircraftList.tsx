import { useEffect, useState } from "react";
import { getAircrafts, type Aircraft } from "../../services/aircraftService";

interface Props {
  onSelect: (ident: string) => void;
  selected: string | null;
}

export default function AircraftList({ onSelect, selected }: Props) {
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAircrafts()
      .then(setAircrafts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-white text-center text-lg">Loading aircrafts...</p>;
  if (error) return <p className="text-red-400 text-center text-lg">Error: {error}</p>;

  return (
    <div className="bg-white/10 border border-gray-700 p-6 rounded-2xl shadow-xl w-full max-w-4xl mx-auto max-h-[70vh]">
      <h2 className="text-2xl font-bold text-white mb-6">Aircrafts</h2>
      <div className="overflow-y-auto max-h-[calc(70vh-8rem)] pr-2 space-y-4">
        {aircrafts.map((aircraft) => (
          <div
            key={aircraft.ident}
            onClick={() => onSelect(aircraft.ident)}
            className={`cursor-pointer p-4 rounded-xl border shadow transition ${
              selected === aircraft.ident ? "bg-blue-800 border-blue-400" : "bg-white/10 border-gray-600"
            }`}
          >
            <h3 className="text-xl font-semibold text-blue-200">{aircraft.ident}</h3>
            <p className="text-sm text-gray-300">Type: {aircraft.type}</p>
            <p className="text-sm text-gray-300">Economy Seats: {aircraft.economySeats}</p>
            <p className="text-sm text-gray-300">Base: {aircraft.base}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
