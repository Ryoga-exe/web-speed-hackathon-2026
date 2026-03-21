import { RefObject, useEffect, useState } from "react";

/**
 * contentEndRef の要素が boundaryRef の要素より下にあるかを監視する。
 * 例: コンテンツ末尾がスティッキーバーより下にあるとき true を返す。
 *
 * @param contentEndRef - コンテンツの末尾を示す要素の ref
 * @param boundaryRef - 比較対象となる境界要素の ref（例: sticky な入力欄）
 */
export function useHasContentBelow(
  contentEndRef: RefObject<HTMLElement | null>,
  boundaryRef: RefObject<HTMLElement | null>,
): boolean {
  const [hasContentBelow, setHasContentBelow] = useState(false);

  useEffect(() => {
    const endEl = contentEndRef.current;
    const barEl = boundaryRef.current;

    if (endEl == null || barEl == null) {
      setHasContentBelow(false);
      return;
    }

    let intersectionObserver: IntersectionObserver | null = null;

    const bindObservers = () => {
      intersectionObserver?.disconnect();
      const boundaryHeight = Math.ceil(barEl.getBoundingClientRect().height);
      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          setHasContentBelow(!(entry?.isIntersecting ?? false));
        },
        {
          root: null,
          rootMargin: `0px 0px -${boundaryHeight}px 0px`,
          threshold: 0,
        },
      );
      intersectionObserver.observe(endEl);
    };

    bindObservers();

    const resizeObserver = new ResizeObserver(() => {
      bindObservers();
    });
    resizeObserver.observe(barEl);

    const handleResize = () => {
      bindObservers();
    };
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      intersectionObserver?.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [contentEndRef, boundaryRef]);

  return hasContentBelow;
}
