// Display formatting only: IDs and original filenames remain unchanged.
export function photoDisplayName(filename) {
  const extension = filename.match(/\.[^.]+$/)?.[0].toLowerCase() || '';
  let stem = extension ? filename.slice(0, -extension.length) : filename;
  const dji = stem.match(/^dji_mimo_(\d{8})_(\d{6})(?:_|$)/i);
  if (dji) return `DJI_${dji[1]}_${dji[2]}${extension}`;
  stem = stem.replace(/_jpe?g$/i, '');
  if (/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(stem)) {
    stem = `${stem.slice(0, 8)}…${stem.slice(-4)}`;
  } else if (stem.length > 28) {
    stem = `${stem.slice(0, 18)}…${stem.slice(-6)}`;
  }
  return `${stem}${extension}`;
}

export function cameraDisplayName(value) {
  if (typeof value !== 'string') return '';
  const model = value.trim();
  const sony = model.match(/^(?:SONY\s+)?ILCE-(.+)$/i);
  if (sony) return `Sony A${sony[1]}`;
  // DJI's Osmo Action 4 safety guidelines identify model AC003.
  // https://dl.djicdn.com/downloads/DJI_Osmo_Action_4/SG/DJI_Osmo_Action_4_Safety_Guidelines_5_lan_v1.0.pdf
  if (/^(?:DJI\s+)?AC003$/i.test(model)) return 'DJI Osmo Action 4';
  return model.replace(/^NIKON\s+/i, 'Nikon ');
}

export function locationDisplayName(metadata) {
  return [...new Set([metadata.City, metadata.State, metadata.Country]
    .filter((value) => typeof value === 'string' && value.trim())
    .map((value) => value.trim()))].join(', ');
}
