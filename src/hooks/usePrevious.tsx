import { useEffect, useRef } from 'react';

export const usePrevious = <T extends unknown>(value: T): T | undefined => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
};

export const useHasChanged = (val: any) => {
  const prevVal = usePrevious(val);

  return prevVal !== val;
};
