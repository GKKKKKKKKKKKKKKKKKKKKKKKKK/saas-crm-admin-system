const pad = (value: number) => String(value).padStart(2, "0");

const formatDateTime = (value: Date) => {
  const year = value.getFullYear();
  const month = pad(value.getMonth() + 1);
  const day = pad(value.getDate());
  const hour = pad(value.getHours());
  const minute = pad(value.getMinutes());
  const second = pad(value.getSeconds());
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

export const serializeData = <T>(value: T): T => {
  return JSON.parse(
    JSON.stringify(value, (_, currentValue) => {
      if (typeof currentValue === "bigint") {
        return currentValue.toString();
      }
      if (currentValue instanceof Date) {
        return formatDateTime(currentValue);
      }
      if (
        typeof currentValue === "object" &&
        currentValue !== null &&
        "toNumber" in currentValue &&
        typeof (currentValue as { toNumber: unknown }).toNumber === "function"
      ) {
        return (currentValue as { toNumber: () => number }).toNumber();
      }
      return currentValue;
    }),
  );
};
