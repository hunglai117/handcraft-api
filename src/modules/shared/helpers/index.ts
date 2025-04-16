/* eslint-disable @typescript-eslint/no-explicit-any */
export * from "./pagination.helper";

interface AutoImportModule {
  [key: string]: any;
}

export const autoImport = (module: AutoImportModule): any[] => {
  return Object.keys(module).map((moduleName) => module[moduleName]);
};

export const getEnumValues = (enumType: unknown) => {
  return Object.keys(enumType).map((key) => enumType[key]);
};

export const validateConfig = (config: { [key: string]: any }) => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined || value === null) {
      throw new Error(`Missing configuration for ${key}`);
    }
  }
};

export const getNowUnixTimeStamp = (): number => {
  return Math.floor(Date.now() / 1000);
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
