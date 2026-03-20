const longDateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("ja-JP", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const relativeTimeFormatter = new Intl.RelativeTimeFormat("ja-JP", {
  numeric: "auto",
});

export function toISODateTime(value: string | Date): string {
  return new Date(value).toISOString();
}

export function formatLongDate(value: string | Date): string {
  return longDateFormatter.format(new Date(value));
}

export function formatShortTime(value: string | Date): string {
  return timeFormatter.format(new Date(value));
}

export function formatRelativeTime(value: string | Date): string {
  const diffSeconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const absSeconds = Math.abs(diffSeconds);

  if (absSeconds < 60) {
    return relativeTimeFormatter.format(diffSeconds, "second");
  }
  if (absSeconds < 60 * 60) {
    return relativeTimeFormatter.format(Math.round(diffSeconds / 60), "minute");
  }
  if (absSeconds < 60 * 60 * 24) {
    return relativeTimeFormatter.format(Math.round(diffSeconds / (60 * 60)), "hour");
  }
  if (absSeconds < 60 * 60 * 24 * 30) {
    return relativeTimeFormatter.format(Math.round(diffSeconds / (60 * 60 * 24)), "day");
  }
  if (absSeconds < 60 * 60 * 24 * 365) {
    return relativeTimeFormatter.format(Math.round(diffSeconds / (60 * 60 * 24 * 30)), "month");
  }
  return relativeTimeFormatter.format(Math.round(diffSeconds / (60 * 60 * 24 * 365)), "year");
}
