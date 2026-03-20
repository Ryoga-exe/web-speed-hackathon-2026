import React, { CSSProperties, ReactNode } from "react";
void React;

interface Props {
  aspectHeight: number;
  aspectWidth: number;
  children: ReactNode;
}

/**
 * 親要素の横幅を基準にして、指定したアスペクト比のブロック要素を作ります
 */
export const AspectRatioBox = ({ aspectHeight, aspectWidth, children }: Props) => {
  const style = {
    aspectRatio: `${aspectWidth} / ${aspectHeight}`,
  } satisfies CSSProperties;

  return (
    <div className="relative w-full" style={style}>
      <div className="absolute inset-0">{children}</div>
    </div>
  );
};
