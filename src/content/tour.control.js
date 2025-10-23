const overrides = {
  byIndex: {
    0: {
      // nhiều đoạn:
      narrationParts: [
        "Năm 1975. Thống nhất đất nước – chiến dịch Hồ Chí Minh toàn thắng mở ra thời kỳ mới cho dân tộc.",
        "Từ đây, nhiệm vụ hàn gắn vết thương chiến tranh và khôi phục kinh tế trở thành ưu tiên hàng đầu.",
        "Hà Nội lúc này giữ vai trò trung tâm trong tổ chức, điều phối và tái thiết.",
      ],
      title: "Thống nhất đất nước (1975)",
      description: "Giai đoạn hậu chiến mở đầu cho chặng đường xây dựng CNXH.",
    },
    1: {
      narrationParts: [
        "Năm 1986. Đại hội VI khởi xướng Đổi mới – bước ngoặt tư duy và thể chế.",
        "Cơ chế bao cấp dần nhường chỗ cho kinh tế thị trường có quản lý.",
        "Mục tiêu: phát triển bền vững, nâng cao đời sống nhân dân.",
      ],
      title: "Đổi mới (1986)",
      description: "Tái cấu trúc nền kinh tế, tạo đà hội nhập.",
    },
  },
  defaults: { altitude: 0.28, duration: 4200, images: [], extra: {} },
};

const stepId = (idx) => `step-${idx}`;

function resolveOverride(base, idx) {
  return (
    overrides.byId?.[base?.id ?? stepId(idx)] ??
    overrides.byIndex?.[idx] ??
    (base?.year ? overrides.byYear?.[base.year] : undefined) ??
    (base?.slug ? overrides.bySlug?.[base.slug] : undefined) ??
    null
  );
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

    const merged = {
      id,
      index: idx,
      lat: ev?.lat ?? defaultLat,
      lng: ev?.lng ?? defaultLng,
      altitude: ev?.alt ?? overrides.defaults.altitude,
      duration: ev?.duration ?? overrides.defaults.duration,
      year: ev?.year,
      slug: ev?.slug,
      title: ev?.title,
      description: ev?.description,
      images: Array.isArray(ev?.images) ? ev.images : overrides.defaults.images,
      extra: { ...(overrides.defaults.extra || {}), ...(ev?.extra || {}) },
      narration: undefined,
      narrationParts: undefined, // <— hỗ trợ nhiều đoạn
    };

    const applied = shallowMerge(merged, patch);

    // ưu tiên narrationParts; nếu không có thì dùng narration string
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
    // ghép lại thành một chuỗi khi cần (ví dụ TTS)
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

export function setOverride(where = "byIndex", key, value) {
  if (!overrides[where]) overrides[where] = {};
  overrides[where][key] = value;
}

export function getOverrides() {
  return overrides;
}
