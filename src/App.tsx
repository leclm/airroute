import { useState, useEffect } from "react";
import dayjs from "dayjs";
import AircraftList from "./components/AircraftList/AircraftList";
import FlightList from "./components/FlightList/FlightList";
import Rotation from "./components/Rotation/Rotation";
import AircraftTimeline from "./components/AircraftTimeline/AircraftTimeline";

interface Flight {
  ident: string;
  origin: string;
  destination: string;
  readable_departure: string;
  readable_arrival: string;
}

function App() {
  const [selectedAircraft, setSelectedAircraft] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format("YYYY-MM-DD")
  );
  const [flightsForSelectedAircraft, setFlightsForSelectedAircraft] = useState<
    Flight[]
  >([]);

  useEffect(() => {
    if (!selectedAircraft) {
      setFlightsForSelectedAircraft([]);
      return;
    }

    const raw = localStorage.getItem("rotation-by-aircraft");
    const all = raw ? JSON.parse(raw) : {};
    const flights: Flight[] = all[selectedAircraft]?.[selectedDate] || [];
    setFlightsForSelectedAircraft(flights);
  }, [selectedAircraft, selectedDate]);

  useEffect(() => {
    function reloadFlights() {
      if (!selectedAircraft) {
        setFlightsForSelectedAircraft([]);
        return;
      }
      const raw = localStorage.getItem("rotation-by-aircraft");
      const all = raw ? JSON.parse(raw) : {};
      const flights: Flight[] = all[selectedAircraft]?.[selectedDate] || [];
      setFlightsForSelectedAircraft(flights);
    }

    window.addEventListener("flight-added", reloadFlights);
    window.addEventListener("flight-removed", reloadFlights);

    return () => {
      window.removeEventListener("flight-added", reloadFlights);
      window.removeEventListener("flight-removed", reloadFlights);
    };
  }, [selectedAircraft, selectedDate]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-800 via-gray-900 to-black shadow-xl p-10 border border-gray-700 text-left flex flex-col">
      <h1 className="text-2xl text-center font-bold text-white mb-6">
        AirRoute
      </h1>

      <div className="text-center mb-4">
        <input
          type="date"
          className="bg-gray-700 text-white px-4 py-2 rounded-md"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <main className="flex flex-1 p-6 gap-6">
        <AircraftList
          onSelect={setSelectedAircraft}
          selected={selectedAircraft}
          selectedDate={selectedDate}
        />
        <Rotation
          selectedAircraft={selectedAircraft}
          selectedDate={selectedDate}
        />
        <FlightList
          selectedAircraft={selectedAircraft}
          selectedDate={selectedDate}
        />
      </main>
      <AircraftTimeline flights={flightsForSelectedAircraft} />
    </div>
  );
}

export default App;
