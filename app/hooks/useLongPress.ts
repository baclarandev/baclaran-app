import { useRef, useEffect } from "react";

export function useLongPress(
  onLongPress: () => void,
  ms = 500, // duration in ms to trigger long press
) {
  const timerRef = useRef<number>(0);

  const start = () => {
    timerRef.current = window.setTimeout(() => {
      onLongPress();
    }, ms);
  };

  const clear = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  useEffect(() => () => clear(), []);

  return {
    onTouchStart: start,
    onMouseDown: start,
    onTouchEnd: clear,
    onTouchMove: clear,
    onMouseUp: clear,
    onMouseLeave: clear,
  };
}
