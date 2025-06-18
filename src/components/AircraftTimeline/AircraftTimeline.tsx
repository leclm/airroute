interface Flight {
  ident: string;
  readable_departure: string;
  readable_arrival: string;
}

interface Props {
  flights: Flight[];
}

export default function AircraftTimeline({ flights }: Props) {
  function toPercent(minutes: number) {
    return (minutes / 1440) * 100;
  }

  function timeStringToMinutes(t: string): number {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  const turnaround = 20;

  const sorted = flights
    .slice()
    .sort(
      (a, b) =>
        timeStringToMinutes(a.readable_departure) -
        timeStringToMinutes(b.readable_departure)
    );

  const blocks: { start: number; width: number; color: string }[] = [];

  let currentMinute = 0;

  sorted.forEach((flight, idx) => {
    const dep = timeStringToMinutes(flight.readable_departure);
    const arr = timeStringToMinutes(flight.readable_arrival);

    if (dep > currentMinute) {
      blocks.push({
        start: toPercent(currentMinute),
        width: toPercent(dep - currentMinute),
        color: "#555",
      });
    }

    blocks.push({
      start: toPercent(dep),
      width: toPercent(arr - dep),
      color: "#0f0",
    });

    currentMinute = arr;

    if (idx < sorted.length - 1) {
      blocks.push({
        start: toPercent(currentMinute),
        width: toPercent(turnaround),
        color: "#800080",
      });
      currentMinute += turnaround;
    }
  });

  if (currentMinute < 1440) {
    blocks.push({
      start: toPercent(currentMinute),
      width: toPercent(1440 - currentMinute),
      color: "#555",
    });
  }

  return (
    <div className="bg-white/10 border border-gray-700 p-4 rounded-2xl shadow-xl w-full max-w-2xl mx-auto">
      <h3 className="text-white mb-4">Aircraft Timeline (24h)</h3>
      <div className="relative w-full h-8 rounded bg-gray-700 overflow-hidden">
        {blocks.map((block, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${block.start}%`,
              width: `${block.width}%`,
              height: "100%",
              backgroundColor: block.color,
              transition: "width 0.3s ease",
            }}
            title={
              block.color === "#0f0"
                ? "Scheduled Flight"
                : block.color === "#800080"
                ? "Turnaround"
                : "Idle"
            }
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
    </div>
  );
}
