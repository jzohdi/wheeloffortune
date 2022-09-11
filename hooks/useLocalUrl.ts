import { Router, useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

interface UseLocalUrlParams<T> {
  key: string;
  defaultValue: T;
}

export default function useLocalUrlState<T>({
  key,
  defaultValue,
}: UseLocalUrlParams<T>): [T, (value: T) => void] {
  const [state, setState] = useState<T>(defaultValue);
  const router = useRouter();
  const didLoadRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const localStorageValue = localStorage.getItem(key);
    let localStorageParsedValue: T | null = null;
    if (localStorageValue !== null) {
      localStorageParsedValue = JSON.parse(localStorageValue);
    }
    const params = parseUrlSearch(location.search);
    let paramParsedValue: T | null = null;
    if (params[key] !== undefined && params[key] !== null) {
      paramParsedValue = params[key] as T;
    }
    if (key === "elements") {
      console.log({ key, paramParsedValue, localStorageParsedValue });
    }
    if (paramParsedValue !== null) {
      setState(paramParsedValue);
    } else if (localStorageParsedValue !== null) {
      return setState(localStorageParsedValue);
    }
  }, [key]);

  useEffect(() => {
    const didLoad = didLoadRef.current;
    if (didLoad) {
      const stringifiedData = JSON.stringify(state);
      localStorage.setItem(key, stringifiedData);
      const url = new URL(window.location.href);
      url.searchParams.set(key, encodeURI(stringifiedData));
      router.replace(
        {
          pathname: "/",
          query: Object.fromEntries(url.searchParams.entries()),
        },
        undefined,
        { shallow: true }
      );
    }
    didLoadRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, state]);

  const handleSetState = (value: T) => {
    setState(value);
  };

  return [state, handleSetState];
}

type ParsedUrl = { [key: string]: string };

function parseUrlSearch(searchUrlString: string): ParsedUrl {
  const object: ParsedUrl = {};
  // console.log("serach string", searchUrlString);
  new URLSearchParams(searchUrlString).forEach((value, key) => {
    // console.log({ key, value });
    try {
      object[key] = JSON.parse(decodeURI(value));
    } catch (err) {
      console.log("invalid param:", key, value);
    }
  });
  return object;
}
