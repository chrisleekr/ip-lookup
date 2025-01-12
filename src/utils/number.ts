// Validate and parse numeric values
const parseNumericEnv = (
  value: string | undefined,
  defaultValue: number,
  min: number,
  max: number,
  name: string,
): number => {
  const parsed = parseInt(value || String(defaultValue), 10);
  if (isNaN(parsed) || parsed < min || parsed > max) {
    throw new Error(
      `${name} must be a number between ${min} and ${max}. Got: ${value}`,
    );
  }
  return parsed;
};

export { parseNumericEnv };
