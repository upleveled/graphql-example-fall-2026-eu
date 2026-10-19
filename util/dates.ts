export function formatDate(date: Date, locales?: Intl.LocalesArgument) {
  return date.toLocaleDateString(locales || 'nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function getDaysUntilNextBirthday(currentDate: Date, birthDate: Date) {
  // Create new date object to avoid mutating the original birth date
  const nextBirthDate = new Date(birthDate);

  // Set birth date year to current year
  nextBirthDate.setUTCFullYear(currentDate.getFullYear());

  // Set UTC time to 0 to compare only days (avoid time zones)
  currentDate.setUTCHours(0, 0, 0, 0);
  nextBirthDate.setUTCHours(0, 0, 0, 0);

  if (nextBirthDate.getTime() < currentDate.getTime()) {
    nextBirthDate.setUTCFullYear(currentDate.getFullYear() + 1);
  }
  const daysUntilNextBirthDay =
    (nextBirthDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);

  return daysUntilNextBirthDay;
}
