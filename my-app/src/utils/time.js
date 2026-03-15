const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDate(input) {
  if (input instanceof Date) return input;
  return new Date(input + "T00:00:00");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function daysBetween(start, end) {
  const startMs = parseDate(start).getTime();
  const endMs = parseDate(end).getTime();
  return Math.floor((endMs - startMs) / MS_PER_DAY);
}

export function addDays(date, days) {
  const d = new Date(parseDate(date));
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date, months) {
  const d = new Date(parseDate(date));
  const desiredMonth = d.getMonth() + months;
  d.setMonth(desiredMonth);
  return d;
}

export function addYears(date, years) {
  const d = new Date(parseDate(date));
  d.setFullYear(d.getFullYear() + years);
  return d;
}

export function computeLifeSummary(birthDateString, lifeExpectancyYears, referenceDate = new Date(), unit = "weeks") {
  const birth = parseDate(birthDateString);
  const now = parseDate(referenceDate);
  const totalDays = Math.round(lifeExpectancyYears * 365.2425);
  const daysLived = Math.max(0, daysBetween(birth, now));
  const remainingDays = Math.max(0, totalDays - daysLived);

  const { totalUnits, currentUnit } = computeUnitCounts(birthDateString, lifeExpectancyYears, unit, now);
  const unitsLived = Math.max(0, currentUnit);
  const remainingUnits = Math.max(0, totalUnits - unitsLived - 1);

  return {
    birthDate: birth,
    lifeExpectancyYears,
    totalDays,
    daysLived,
    remainingDays,
    totalUnits,
    unitsLived,
    remainingUnits,
  };
}

export function computeUnitCounts(birthDateString, lifeExpectancyYears, unit, referenceDate = new Date()) {
  const birth = parseDate(birthDateString);
  const now = parseDate(referenceDate);
  const totalYears = lifeExpectancyYears;

  if (unit === "weeks") {
    const totalUnits = Math.round(totalYears * 52);
    const livedWeeks = Math.floor(daysBetween(birth, now) / 7);
    const currentUnit = clamp(livedWeeks, 0, totalUnits - 1);
    return { totalUnits, currentUnit };
  }

  if (unit === "months") {
    const totalUnits = Math.round(totalYears * 12);
    const yearDiff = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    const livedMonths = yearDiff * 12 + monthDiff + (now.getDate() >= birth.getDate() ? 0 : -1);
    const currentUnit = clamp(livedMonths, 0, totalUnits - 1);
    return { totalUnits, currentUnit };
  }

  if (unit === "years") {
    const totalUnits = Math.round(totalYears);
    const livedYears =
      now.getFullYear() -
      birth.getFullYear() -
      (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
    const currentUnit = clamp(livedYears, 0, totalUnits - 1);
    return { totalUnits, currentUnit };
  }

  return { totalUnits: 0, currentUnit: 0 };
}

export function getUnitDateRange(birthDateString, index, unit) {
  const birth = parseDate(birthDateString);
  if (unit === "weeks") {
    const start = addDays(birth, index * 7);
    const end = addDays(start, 7);
    return { start, end };
  }
  if (unit === "months") {
    const start = addMonths(birth, index);
    const end = addMonths(start, 1);
    return { start, end };
  }
  if (unit === "years") {
    const start = addYears(birth, index);
    const end = addYears(start, 1);
    return { start, end };
  }
  return { start: birth, end: birth };
}

export function formatDate(date) {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
