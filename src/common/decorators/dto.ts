import { Transform } from "class-transformer";

export const ToBoolean = () => {
  const toPlain = Transform(
    ({ value }) => {
      return value;
    },
    {
      toPlainOnly: true,
    },
  );
  const toClass = (target: any, key: string) => {
    return Transform(
      ({ obj }) => {
        return valueToBoolean(obj[key]);
      },
      {
        toClassOnly: true,
      },
    )(target, key);
  };
  return function (target: any, key: string) {
    toPlain(target, key);
    toClass(target, key);
  };
};

const valueToBoolean = (value: any) => {
  if (!value) return false;

  if (typeof value === "boolean") {
    return value;
  }
  if (
    typeof value === "string" &&
    ["true", "false"].includes(value.toLowerCase())
  ) {
    return value.toLowerCase() === "true";
  }

  throw new Error("Invalid value for boolean");
};
