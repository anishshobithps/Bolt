export function timeString(seconds: number, forceHours = false, ms = true) {
  if (ms) seconds /= 1000;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${forceHours || hours >= 1 ? `${hours}:` : ''}${
    hours >= 1 ? `0${minutes}`.slice(-2) : minutes
  }:${`0${Math.floor(seconds % 60)}`.slice(-2)}`;
}

export function formatDuration(ms: number) {
  if (ms < 0) ms = -ms;
  const time = {
    day: ~~(ms / 86400000),
    hour: ~~(ms / 3600000) % 24,
    minute: ~~(ms / 60000) % 60,
    second: ~~(ms / 1000) % 60,
    millisecond: ~~ms % 1000,
  };

  const duration = Object.entries(time)
    .filter((val) => Boolean(val[1]))
    // eslint-disable-next-line no-negated-condition
    .map(([key, val]) => `${val} ${key}${val !== 1 ? 's' : ''}`);

  const last = duration.pop();

  return duration.length ? `${duration.join(', ')} and ${last}` : last;
}
