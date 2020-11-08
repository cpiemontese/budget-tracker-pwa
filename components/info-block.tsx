export default function InfoBlock({ name, value }) {
  return (
    <div className="sm:flex items-center mb-2">
      <div className="w-full sm:w-1/6 sm:pr-4 text-xs sm:text-right font-medium text-gray-700">
        {name}
      </div>
      <div className="w-full sm:w-5/6">{value}</div>
    </div>
  );
}
