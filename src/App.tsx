import AircraftList from "./components/AircraftList/AircraftList";
import FlightList from "./components/FlightList/FlightList";
import Rotation from "./components/Rotation/Rotation";
import { useState } from "react";

function App() {
  const [selectedAircraft, setSelectedAircraft] = useState<string | null>(null);

  return (
    <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-black shadow-xl mb-6 p-10 border border-gray-700 text-left">
      <h1 className="text-2xl text-center font-bold text-white mb-6">
        AirRoute
      </h1>

      <main className="flex flex-1 p-6 gap-6">
        <AircraftList
          onSelect={setSelectedAircraft}
          selected={selectedAircraft}
        />
        <Rotation selectedAircraft={selectedAircraft} />
        <FlightList selectedAircraft={selectedAircraft} />
      </main>

      <h1 className="text-2xl text-center font-bold text-white mb-6">
        AirRoute
        <br />
        AirRoute
        <br />
      </h1>
    </div>
  );
}

export default App;
