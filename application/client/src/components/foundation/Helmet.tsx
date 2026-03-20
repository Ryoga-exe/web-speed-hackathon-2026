import React, { Children, isValidElement, ReactNode, useEffect } from "react";
void React;

interface HelmetProps {
  children?: ReactNode;
}

function extractTitle(children: ReactNode): string | null {
  for (const child of Children.toArray(children)) {
    if (!isValidElement<{ children?: ReactNode }>(child)) {
      continue;
    }

    if (child.type === "title") {
      const titleChildren = Children.toArray(child.props.children);
      return titleChildren.join("");
    }
  }

  return null;
}

export const Helmet = ({ children }: HelmetProps) => {
  const title = extractTitle(children);

  useEffect(() => {
    if (title != null) {
      document.title = title;
    }
  }, [title]);

  return null;
};

export const HelmetProvider = ({ children }: HelmetProps) => <>{children}</>;
