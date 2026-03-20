const DATE_LENGTH = 10;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATE_FILTER_KEYS = new Set(["from", "since", "until"]);

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

export const sanitizeSearchText = (input: string): string =>
  splitQuery(input)
    .map((token) => {
      const separatorIndex = token.indexOf(":");
      if (separatorIndex <= 0) {
        return token;
      }

      const key = token.slice(0, separatorIndex).toLowerCase();
      if (!DATE_FILTER_KEYS.has(key)) {
        return token;
      }

      const value = token.slice(separatorIndex + 1);
      const candidate = value.slice(0, DATE_LENGTH);
      if (!ISO_DATE_PATTERN.test(candidate)) {
        return token;
      }

      return `${key}:${candidate}`;
    })
    .join(" ");

export const parseSearchQuery = (query: string) => {
  const tokens = splitQuery(query);
  const sinceDate = tokens.map((token) => extractDirectiveDate(token, "since")).find(Boolean) ?? null;
  const untilDate = tokens.map((token) => extractDirectiveDate(token, "until")).find(Boolean) ?? null;

  const keywords = tokens
    .filter((token) => extractDirectiveDate(token, "since") == null)
    .filter((token) => extractDirectiveDate(token, "until") == null)
    .join(" ");

  return {
    keywords,
    sinceDate,
    untilDate,
  };
};

export const isValidDate = (dateStr: string): boolean => {
  if (!ISO_DATE_PATTERN.test(dateStr)) {
    return false;
  }

  const [year = NaN, month = NaN, day = NaN] = dateStr
    .split("-")
    .map((part) => Number(part));
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};
