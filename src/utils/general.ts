// eslint-disable-next-line import/prefer-default-export
export function stringify(obj: unknown, indent?: number): string {
  return JSON.stringify(
    obj,
    (key, value) => {
      if (key.startsWith('_')) return undefined;
      return value;
    },
    indent,
  );
}
