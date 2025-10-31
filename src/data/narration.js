// src/data/narration.js
// Overrides helper for narration; by default we DO NOT override events by their array index
// If you want to override a specific event, use overrides.byId with the event's id.

const overrides = {
  // keep empty by default — you can add specific event overrides keyed by event id:
  // e.g. "1975-04-30": { narrationParts: [...], title: "...", description: "..." }
  byId: {},
  // optional mapping by year (only use when year is unique across events)
  byYear: {},
  // defaults for Globe / narration fields
  defaults: { altitude: 0.28, duration: 4200, images: [], extra: {} },
};

const stepId = (idx) => `step-${idx}`;

/**
 * Resolve override for a base event.
 * Priority: byId -> byYear -> null
 * NOTE: we intentionally DO NOT use byIndex (fragile when events are per-stage).
 */
function resolveOverride(base, idx) {
  if (!base) return null;
  // first try exact id match
  const idKey = base?.id ?? stepId(idx);
  if (overrides.byId && overrides.byId[idKey]) return overrides.byId[idKey];
  // then try byYear only if base.year exists and mapping provided
  if (base?.year && overrides.byYear && overrides.byYear[base.year])
    return overrides.byYear[base.year];

  return null;
}

function shallowMerge(obj, patch) {
  if (!patch) return { ...obj };
  const out = { ...obj };
  for (const k of Object.keys(patch)) {
    if (patch[k] == null) continue;
    out[k] = patch[k];
  }
  return out;
}

/**
 * buildControlledSteps
 * - preserve original fields from base event (detail, place, pageNote, videos, etc.)
 * - apply override patch only when explicitly provided (byId or byYear)
 * - fallback narration will be built from year + title + description if no narration provided
 */
export function buildControlledSteps(
  baseEvents = [],
  { defaultLat, defaultLng } = {}
) {
  return baseEvents.map((ev, idx) => {
    const id = ev?.id ?? stepId(idx);
    const patch = resolveOverride({ ...ev, id }, idx);

    const fallbackNarration = `${ev?.year ? ev.year + ". " : ""}${
      ev?.title ?? ""
    }${ev?.description ? ". " + ev.description : ""}`;

    // keep all original fields from ev by spreading ...ev first
    const merged = {
      ...ev,
      id,
      index: idx,
      // location defaults
      lat: ev?.lat ?? defaultLat,
      lng: ev?.lng ?? defaultLng,
      altitude: ev?.alt ?? overrides.defaults.altitude,
      duration: ev?.duration ?? overrides.defaults.duration,
      year: ev?.year,
      slug: ev?.slug,
      title: ev?.title,
      description: ev?.description,
      images: Array.isArray(ev?.images) ? ev.images : overrides.defaults.images,
      videos: Array.isArray(ev?.videos)
        ? ev.videos
        : ev?.video
        ? [ev.video]
        : [],
      extra: { ...(overrides.defaults.extra || {}), ...(ev?.extra || {}) },
      // narration fields will be set by patch or fallback
      narration: undefined,
      narrationParts: undefined,
    };

    const applied = shallowMerge(merged, patch);

    if (!applied.narrationParts && !applied.narration) {
      applied.narration = fallbackNarration;
    }

    return applied;
  });
}

export function getNarrationForIndex(steps, index) {
  const s = steps?.[index];
  if (!s) return "";
  if (Array.isArray(s.narrationParts) && s.narrationParts.length) {
    return s.narrationParts.join(" ");
  }
  return s?.narration ?? "";
}

export function getPlaylistForIndex(steps, index) {
  const s = steps?.[index];
  if (!s) return [];
  if (Array.isArray(s.narrationParts) && s.narrationParts.length)
    return s.narrationParts;
  return [s?.narration ?? ""];
}

export function setOverride(where = "byId", key, value) {
  if (!overrides[where]) overrides[where] = {};
  overrides[where][key] = value;
}

export function getOverrides() {
  return overrides;
}
