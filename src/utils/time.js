const parseDurationToMilliseconds = (
  duration
) => {
  const match = /^(\d+)([smhd])$/.exec(
    duration
  );

  if (!match) {
    throw new Error(
      `Invalid duration format: ${duration}`
    );
  }

  const value = Number(match[1]);
  const unit = match[2];

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return (
    value * multipliers[unit]
  );
};

export default parseDurationToMilliseconds;