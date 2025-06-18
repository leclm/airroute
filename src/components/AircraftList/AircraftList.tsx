import { useEffect, useState } from "react";
import { getAircrafts, type Aircraft } from "../../services/aircraftService";

interface Flight {
  ident: string;
  origin: string;
  destination: string;
  readable_departure: string;
  readable_arrival: string;
}

interface Props {
  onSelect: (ident: string) => void;
  selected: string | null;
  selectedDate: string;
}

export default function AircraftList({
  onSelect,
  selected,
  selectedDate,
}: Props) {
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);
  const [usageByAircraft, setUsageByAircraft] = useState<
    Record<string, number>
  >({});
  const [error, setError] = useState<string | null>(null);

  function timeStringToMinutes(t: string): number {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  function calcUsage(flights: Flight[]): number {
    if (flights.length === 0) return 0;
    const turnaround = 20;
    let totalMinutes = 0;

    const sorted = flights
      .slice()
      .sort(
        (a, b) =>
          timeStringToMinutes(a.readable_departure) -
          timeStringToMinutes(b.readable_departure)
      );

    for (let i = 0; i < sorted.length; i++) {
      const flight = sorted[i];
      const dep = timeStringToMinutes(flight.readable_departure);
      const arr = timeStringToMinutes(flight.readable_arrival);
      totalMinutes += arr - dep;

      if (i < sorted.length - 1) {
        totalMinutes += turnaround;
      }
    }
    return totalMinutes;
  }

  async function loadAircraftsAndCalcUsage() {
    try {
      const acfts = await getAircrafts();
      setAircrafts(acfts);

      const raw = localStorage.getItem("rotation-by-aircraft");
      const data = raw ? JSON.parse(raw) : {};
      const usageData: Record<string, number> = {};

      for (const acft of acfts) {
        const flights: Flight[] = data[acft.ident]?.[selectedDate] || [];
        const usedMinutes = calcUsage(flights);
        usageData[acft.ident] = Math.min(
          100,
          Math.round((usedMinutes / 1440) * 100)
        );
      }

      setUsageByAircraft(usageData);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
  }

  useEffect(() => {
    loadAircraftsAndCalcUsage();
  }, [selectedDate]);

  useEffect(() => {
    function handleUpdateUsage() {
      loadAircraftsAndCalcUsage();
    }

    window.addEventListener("flight-added", handleUpdateUsage);
    window.addEventListener("flight-removed", handleUpdateUsage);

    return () => {
      window.removeEventListener("flight-added", handleUpdateUsage);
      window.removeEventListener("flight-removed", handleUpdateUsage);
    };
  }, [selectedDate]);

  if (error)
    return <p className="text-red-400 text-center text-lg">Error: {error}</p>;

  return (
    <div className="bg-white/10 border border-gray-700 p-6 rounded-2xl shadow-xl w-full max-w-4xl mx-auto max-h-[60vh]">
      <h2 className="text-2xl font-bold text-white mb-6">Aircrafts</h2>
      <div className="overflow-y-auto max-h-[calc(60vh-8rem)] pr-2 space-y-4">
        {aircrafts.length === 0 ? (
          <p className="text-white text-center">No aircrafts found.</p>
        ) : (
          aircrafts.map((aircraft) => (
            <div
              key={aircraft.ident}
              onClick={() => onSelect(aircraft.ident)}
              className={`cursor-pointer p-4 rounded-xl border shadow transition ${
                selected === aircraft.ident
                  ? "bg-blue-800 border-blue-400"
                  : "bg-white/10 border-gray-600"
              }`}
            >
              <h3 className="text-xl font-semibold text-blue-200">
                {aircraft.ident}
              </h3>
              <p className="text-md text-green-300">
                Usage: {usageByAircraft[aircraft.ident] ?? 0}%
              </p>
              <p className="text-sm text-gray-300">Type: {aircraft.type}</p>
              <p className="text-sm text-gray-300">
                Economy Seats: {aircraft.economySeats}
              </p>
              <p className="text-sm text-gray-300">Base: {aircraft.base}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
