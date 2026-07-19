export function parseCalendarDate(value) {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {
      const [, year, month, day] = match;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
  }

  return new Date(value);
}

export function formatCalendarDate(value, options, locale = "en-US") {
  return parseCalendarDate(value).toLocaleDateString(locale, options);
}

export function getCalendarYear(value) {
  return parseCalendarDate(value).getFullYear();
}
