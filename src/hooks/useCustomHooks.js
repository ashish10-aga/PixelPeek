import { useState, useEffect, useCallback, useRef, useMemo } from "react";

/**
 * useLocalStorage: Sync state with localStorage
 * @param {string} key - localStorage key
 * @param {*} initialValue - default value
 * @returns {[*, (value: *) => void]}
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`useLocalStorage error for key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`useLocalStorage error setting key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

/**
 * useAsync: Handle async operations with loading, error, and data states
 * @param {Function} asyncFunction - async function to execute
 * @param {Array} dependencies - effect dependencies
 * @returns {Object} { data, loading, error }
 */
export function useAsync(asyncFunction, dependencies = []) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    asyncFunction()
      .then((data) => {
        if (mounted.current) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((error) => {
        if (mounted.current) {
          setState({ data: null, loading: false, error });
        }
      });

    return () => {
      mounted.current = false;
    };
  }, dependencies);

  return state;
}

/**
 * useDebounce: Debounce a value
 * @param {*} value - value to debounce
 * @param {number} delay - debounce delay in ms
 * @returns {*} debounced value
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useThrottle: Throttle a callback function
 * @param {Function} callback - function to throttle
 * @param {number} delay - throttle delay in ms
 * @returns {Function} throttled callback
 */
export function useThrottle(callback, delay = 200) {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = now;
    }
  }, [callback, delay]);
}

/**
 * useIntersectionObserver: Detect when element is visible
 * @param {React.RefObject} ref - element ref
 * @param {Object} options - intersection observer options
 * @returns {boolean} isVisible
 */
export function useIntersectionObserver(ref, options = {}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.1, ...options });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return isVisible;
}

/**
 * usePrevious: Get previous value
 * @param {*} value - current value
 * @returns {*} previous value
 */
export function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * useWindowSize: Track window dimensions
 * @returns {Object} { width, height }
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

/**
 * usePerformanceMetrics: Track component render performance
 * @param {string} componentName - name of component for logging
 */
export function usePerformanceMetrics(componentName) {
  const renderTime = useRef(Date.now());

  useEffect(() => {
    const endTime = Date.now();
    const duration = endTime - renderTime.current;
    
    if (duration > 16) { // More than one frame (60fps)
      console.warn(`[Performance] ${componentName} took ${duration}ms to render`);
    }

    renderTime.current = endTime;
  });

  return {
    getRenderTime: () => Date.now() - renderTime.current,
  };
}

/**
 * useOnMount: Run effect only on mount
 * @param {Function} callback - function to run on mount
 */
export function useOnMount(callback) {
  useEffect(() => {
    callback();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * useIsMounted: Check if component is mounted
 * @returns {boolean} is component mounted
 */
export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}
