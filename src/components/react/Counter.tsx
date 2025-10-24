import { useState } from "react";

export const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center justify-center flex-row gap-1">
      <button
        className="transition-transform hover:scale-90 bg-amber-600 p-1 rounded-xs text-white"
        onClick={() => setCount(count + 1)}
      >
        Increment
      </button>
      <p>
        Count: <span className="font-bold">{count}</span>{" "}
      </p>
    </div>
  );
};
