export const formatDateLong = (dateStr?: string): string => {
  if (!dateStr) return '';

  const simpleDateMatch = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  let d: Date;
  if (simpleDateMatch) {
    const [y, m, day] = dateStr.split('-').map(s => parseInt(s, 10));
    d = new Date(y, m - 1, day);
  } else {
    d = new Date(dateStr);
  }

  if (Number.isNaN(d.getTime())) return dateStr;

  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};
