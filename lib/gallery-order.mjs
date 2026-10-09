export const LIGHT_LABELS = {
  soft: 'Soft light', sunlit: 'In the sun', golden: 'Golden hour',
  night: 'After dark', low: 'Quiet shadows',
};
export const DAYPART_LABELS = {
  morning: 'Morning light', day: 'Daylight', night: 'After hours',
};
const lightOrder = {
  morning: ['soft', 'sunlit', 'golden', 'low', 'night'],
  day: ['sunlit', 'soft', 'golden', 'low', 'night'],
  night: ['night', 'low', 'soft', 'golden', 'sunlit'],
};

export function getDaypart(hour) {
  if (hour >= 6 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 18) return 'day';
  return 'night';
}

export function orderPhotographs(photos, sort, daypart = null) {
  const curated = [...photos].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id, 'en', { numeric: true }));
  if (sort === 'date-asc' || sort === 'date-desc') {
    return curated.sort((a, b) => {
      // Unknown capture dates always follow dated photographs, in either direction.
      if (!a.capturedAt || !b.capturedAt) return Number(!a.capturedAt) - Number(!b.capturedAt);
      const comparison = a.capturedAt.localeCompare(b.capturedAt);
      return sort === 'date-asc' ? comparison : -comparison;
    });
  }
  if (daypart && lightOrder[daypart]) {
    const rank = (photo) => {
      const index = lightOrder[daypart].indexOf(photo.light);
      return index < 0 ? lightOrder[daypart].length : index;
    };
    return curated.sort((a, b) => rank(a) - rank(b));
  }
  const styles = new Map();
  for (const photo of curated) {
    if (!styles.has(photo.style)) styles.set(photo.style, []);
    styles.get(photo.style).push(photo);
  }
  return [...styles.values()].flat();
}

export function photographGroup(photo, sort, daypart = null) {
  if (sort !== 'style') return photo.date.slice(0, 4) || 'Undated';
  return daypart ? LIGHT_LABELS[photo.light] || 'More photographs' : photo.style;
}
