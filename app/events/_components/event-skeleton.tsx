export const EventSkeleton = () => {
  return (
    <div className="bg-gray-700 rounded-lg p-4 animate-pulse">
      <div className="space-y-3">
        <div className="h-4 bg-gray-600 rounded w-3/4"></div>
        <div className="h-3 bg-gray-600 rounded w-1/2"></div>
        <div className="h-3 bg-gray-600 rounded w-2/3"></div>
      </div>
    </div>
  );
};
