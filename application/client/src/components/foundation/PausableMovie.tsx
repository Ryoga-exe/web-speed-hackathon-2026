import classNames from "classnames";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import { AspectRatioBox } from "@web-speed-hackathon-2026/client/src/components/foundation/AspectRatioBox";
import { FontAwesomeIcon } from "@web-speed-hackathon-2026/client/src/components/foundation/FontAwesomeIcon";
import { lazyNamed } from "@web-speed-hackathon-2026/client/src/utils/lazy";

interface Props {
  fallbackSrc: string;
  src: string;
}

/**
 * クリックすると再生・一時停止を切り替えます。
 */
const GifMovie = lazyNamed(
  () =>
    import(
      /* webpackChunkName: "feature-gif-player" */ "@web-speed-hackathon-2026/client/src/components/foundation/GifMovie"
    ),
  "GifMovie",
);

const VideoMovie = ({ onError, src }: { onError: () => void; src: string }) => {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [isPlaying, setIsPlaying] = useState(!prefersReducedMotion);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleLoadedData = useCallback(() => {
    if (prefersReducedMotion) {
      videoRef.current?.pause();
      return;
    }

    const promise = videoRef.current?.play();
    if (promise != null) {
      void promise.catch(() => {
        setIsPlaying(false);
      });
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const promise = videoRef.current?.play();
    if (promise != null) {
      void promise.catch(() => {
        setIsPlaying(false);
      });
    }
  }, [prefersReducedMotion, src]);

  const handleClick = useCallback(() => {
    setIsPlaying((current) => {
      if (current) {
        videoRef.current?.pause();
      } else {
        const promise = videoRef.current?.play();
        if (promise != null) {
          void promise.catch(() => {
            setIsPlaying(false);
          });
        }
      }
      return !current;
    });
  }, []);

  return (
    <AspectRatioBox aspectHeight={1} aspectWidth={1}>
      <button
        aria-label="動画プレイヤー"
        className="group relative block h-full w-full"
        onClick={handleClick}
        type="button"
      >
        <video
          ref={videoRef}
          autoPlay={!prefersReducedMotion}
          className="h-full w-full object-cover"
          loop={true}
          muted={true}
          onError={onError}
          onLoadedData={handleLoadedData}
          playsInline={true}
          preload="auto"
          src={src}
        />
        <div
          className={classNames(
            "absolute left-1/2 top-1/2 flex items-center justify-center w-16 h-16 text-cax-surface-raised text-3xl bg-cax-overlay/50 rounded-full -translate-x-1/2 -translate-y-1/2",
            {
              "opacity-0 group-hover:opacity-100": isPlaying,
            },
          )}
        >
          <FontAwesomeIcon iconType={isPlaying ? "pause" : "play"} styleType="solid" />
        </div>
      </button>
    </AspectRatioBox>
  );
};

export const PausableMovie = ({ fallbackSrc, src }: Props) => {
  const [shouldFallbackToGif, setShouldFallbackToGif] = useState(false);

  useEffect(() => {
    setShouldFallbackToGif(false);
  }, [fallbackSrc, src]);

  if (shouldFallbackToGif) {
    return (
      <Suspense fallback={null}>
        <GifMovie src={fallbackSrc} />
      </Suspense>
    );
  }

  return <VideoMovie onError={() => setShouldFallbackToGif(true)} src={src} />;
};
