export default function FormatTime({
  timeRemaining,
}: {
  timeRemaining: number;
}) {
  const seconds = Math.floor((timeRemaining / 1000) % 60);
  const minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);
  const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
  // const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));

  return (
    <div className="flex gap-2 justify-center bg-chart-2 px-3 py-1 rounded text-xs md:text-sm font-semibold text-background">
      {/* <div className="countdown-value">
        {days.toString().padStart(2, "0")} <span>days</span>
      </div> */}
      <div className="countdown-value">
        {hours.toString().padStart(2, "0")} <span> hours</span>
      </div>
      <div className="countdown-value">
        {minutes.toString().padStart(2, "0")} <span>min</span>
      </div>
      <div className="countdown-value">
        {seconds.toString().padStart(2, "0")} <span>sec</span>
      </div>
    </div>
  );
}
