import { useEffect, useState } from "react";
import { getFlights, type Flight } from "../../services/flightService";

export default function FlightList({
  selectedAircraft,
  selectedDate,
}: {
  selectedAircraft: string | null;
  selectedDate: string;
}) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [rotation, setRotation] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function canAddFlight(rotation: Flight[], newFlight: Flight): boolean {
    const turnaround = 20;

    const timeStringToMinutes = (t: string): number => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    if (rotation.length === 0) {
      if (timeStringToMinutes(newFlight.readable_departure) < 0) {
        alert("The flight must depart after midnight.");
        return false;
      }
      return true;
    }

    const lastFlight = rotation[rotation.length - 1];

    if (newFlight.origin !== lastFlight.destination) {
      alert(
        `The origin of flight ${newFlight.ident} must match the destination of the last flight ${lastFlight.ident}.`
      );
      return false;
    }

    const arrivalMinutes = timeStringToMinutes(lastFlight.readable_arrival);
    const departureMinutes = timeStringToMinutes(newFlight.readable_departure);

    if (departureMinutes < arrivalMinutes + turnaround) {
      alert(
        `Insufficient turnaround time between arrival of flight ${lastFlight.ident} (${lastFlight.readable_arrival}) and departure of flight ${newFlight.ident} (${newFlight.readable_departure}). Minimum required is 20 minutes.`
      );
      return false;
    }

    if (timeStringToMinutes(newFlight.readable_arrival) > 23 * 60 + 59) {
      alert(
        `Flight ${newFlight.ident} arrives after midnight, which is not allowed.`
      );
      return false;
    }

    return true;
  }

  const loadRotation = () => {
    if (!selectedAircraft) return;
    const raw = localStorage.getItem("rotation-by-aircraft");
    const data = raw ? JSON.parse(raw) : {};
    const saved = data[selectedAircraft]?.[selectedDate] || [];
    setRotation(saved);

    getFlights()
      .then((all) => {
        const filtered = all.filter(
          (f) => !saved.some((s: Flight) => s.ident === f.ident)
        );
        setFlights(filtered);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRotation();
    window.addEventListener("flight-removed", loadRotation);
    window.addEventListener("flight-added", loadRotation);
    return () => {
      window.removeEventListener("flight-removed", loadRotation);
      window.removeEventListener("flight-added", loadRotation);
    };
  }, [selectedAircraft, selectedDate]);

  function handleFlightClick(flight: Flight) {
    if (!selectedAircraft) return;
    if (!canAddFlight(rotation, flight)) return;

    const raw = localStorage.getItem("rotation-by-aircraft");
    const data = raw ? JSON.parse(raw) : {};

    if (!data[selectedAircraft]) {
      data[selectedAircraft] = {};
    }

    const currentRotation: Flight[] =
      data[selectedAircraft][selectedDate] || [];

    const newRotation = [...currentRotation, flight];
    data[selectedAircraft][selectedDate] = newRotation;

    localStorage.setItem("rotation-by-aircraft", JSON.stringify(data));

    setRotation(newRotation);
    setFlights((prev) => prev.filter((f) => f.ident !== flight.ident));
    window.dispatchEvent(
      new CustomEvent("flight-added", { detail: flight.ident })
    );
  }

  if (error)
    return <p className="text-red-400 text-center text-lg">Error: {error}</p>;

  return (
    <div className="bg-white/10 border border-gray-700 p-6 rounded-2xl shadow-xl w-full max-w-4xl mx-auto max-h-[60vh]">
      <h2 className="text-2xl font-bold text-white mb-6">Flights</h2>
      {loading ? (
        <p className="text-white text-center text-lg">Select an aircraft</p>
      ) : (
        <div className="overflow-y-auto max-h-[calc(60vh-8rem)] pr-2 space-y-4">
          {flights.map((flight) => (
            <div
              key={flight.ident}
              onClick={() => handleFlightClick(flight)}
              className="cursor-pointer bg-white/10 rounded-xl p-4 border border-gray-600 shadow hover:bg-white/20"
            >
              <h3 className="text-xl font-semibold text-blue-200">
                {flight.ident}
              </h3>
              <p className="text-sm text-gray-300">
                <strong>Origin:</strong> {flight.origin} –{" "}
                <strong>Destination:</strong> {flight.destination}
              </p>
              <p className="text-sm text-gray-300">
                <strong>Departure:</strong> {flight.readable_departure} –{" "}
                <strong>Arrival:</strong> {flight.readable_arrival}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
