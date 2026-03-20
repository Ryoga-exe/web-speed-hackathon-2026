interface ParsedSearchQuery {
  keywords: string;
  sinceDate: Date | null;
  untilDate: Date | null;
}

const DATE_LENGTH = 10;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(date: Date): boolean {
  return !isNaN(date.getTime());
}

function splitQuery(query: string): string[] {
  return query.trim().split(/\s+/u).filter(Boolean);
}

function extractDirectiveDate(token: string, key: "since" | "until"): string | null {
  const lowerToken = token.toLowerCase();
  const prefix = `${key}:`;
  if (!lowerToken.startsWith(prefix)) {
    return null;
  }

  const value = token.slice(prefix.length);
  if (value.length < DATE_LENGTH) {
    return null;
  }

  const candidate = value.slice(0, DATE_LENGTH);
  return ISO_DATE_PATTERN.test(candidate) ? candidate : null;
}

export function parseSearchQuery(query: string): ParsedSearchQuery {
  const tokens = splitQuery(query);

  let sinceDate: Date | null = null;
  let untilDate: Date | null = null;

  const sinceValue = tokens.map((token) => extractDirectiveDate(token, "since")).find(Boolean) ?? null;
  if (sinceValue != null) {
    const date = new Date(sinceValue);
    if (isValidDate(date)) {
      date.setHours(0, 0, 0, 0);
      sinceDate = date;
    }
  }

  const untilValue = tokens.map((token) => extractDirectiveDate(token, "until")).find(Boolean) ?? null;
  if (untilValue != null) {
    const date = new Date(untilValue);
    if (isValidDate(date)) {
      date.setHours(23, 59, 59, 999);
      untilDate = date;
    }
  }

  const keywords = tokens
    .filter((token) => extractDirectiveDate(token, "since") == null)
    .filter((token) => extractDirectiveDate(token, "until") == null)
    .join(" ");

  return {
    keywords,
    sinceDate,
    untilDate,
  };
}
