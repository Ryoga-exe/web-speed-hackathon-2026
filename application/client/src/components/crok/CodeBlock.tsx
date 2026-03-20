import { ComponentProps, isValidElement, ReactElement, ReactNode } from "react";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/light";
import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import plaintext from "react-syntax-highlighter/dist/esm/languages/hljs/plaintext";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import rust from "react-syntax-highlighter/dist/esm/languages/hljs/rust";
import sql from "react-syntax-highlighter/dist/esm/languages/hljs/sql";
import typescript from "react-syntax-highlighter/dist/esm/languages/hljs/typescript";
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";

SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("plaintext", plaintext);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("rust", rust);
SyntaxHighlighter.registerLanguage("sql", sql);
SyntaxHighlighter.registerLanguage("typescript", typescript);

const LANGUAGE_ALIASES: Record<string, string> = {
  js: "typescript",
  json: "json",
  mermaid: "plaintext",
  py: "python",
  python: "python",
  rs: "rust",
  rust: "rust",
  sh: "bash",
  shell: "bash",
  sql: "sql",
  text: "plaintext",
  ts: "typescript",
  tsx: "typescript",
  txt: "plaintext",
  typescript: "typescript",
  zsh: "bash",
};

const getLanguage = (children: ReactElement<ComponentProps<"code">>) => {
  const className = children.props.className;
  if (typeof className !== "string") {
    return "plaintext";
  }

  const match = className.match(/language-([\w-]+)/);
  const language = match?.[1]?.toLowerCase();
  return (language && LANGUAGE_ALIASES[language]) ?? "plaintext";
};

const isCodeElement = (children: ReactNode): children is ReactElement<ComponentProps<"code">> =>
  isValidElement(children) && children.type === "code";

export const CodeBlock = ({ children }: ComponentProps<"pre">) => {
  if (!isCodeElement(children)) return <>{children}</>;
  const language = getLanguage(children);
  const code = children.props.children?.toString() ?? "";

  return (
    <SyntaxHighlighter
      customStyle={{
        fontSize: "14px",
        padding: "24px 16px",
        borderRadius: "8px",
        border: "1px solid var(--color-cax-border)",
      }}
      language={language}
      style={atomOneLight}
    >
      {code}
    </SyntaxHighlighter>
  );
};
