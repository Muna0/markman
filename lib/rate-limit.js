// In-memory daily counters. Reset at UTC midnight. Fine for a single Fly machine.
export function createDailyLimiter({ perKey, total, now = () => Date.now() }) {
  let day = "";
  let counts = new Map();
  let used = 0;
  return {
    take(key) {
      const today = new Date(now()).toISOString().slice(0, 10);
      if (today !== day) { day = today; counts = new Map(); used = 0; }
      if (used >= total) return { ok: false, reason: "site" };
      const n = counts.get(key) || 0;
      if (n >= perKey) return { ok: false, reason: "visitor" };
      counts.set(key, n + 1);
      used++;
      return { ok: true };
    },
  };
}
