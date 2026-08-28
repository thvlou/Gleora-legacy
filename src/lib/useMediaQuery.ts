import { useEffect, useState } from "react";

// App.module.css 의 desktopLayer/touchLayer 전환 쿼리와 반드시 같은 값을
// 써야 한다 — 저기서 터치 레이어가 보이는 시점과 여기서 "작은 화면" 취급을
// 시작하는 시점이 어긋나면, 데스크탑 레이어 뒤에서 모바일 크기로 줄어든
// Hit me 버튼/Submit 버튼이 보이는 식의 불일치가 생긴다.
export const MOBILE_QUERY = "(hover: none), (max-width: 480px)";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => (typeof window !== "undefined" ? window.matchMedia(query).matches : false));

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
