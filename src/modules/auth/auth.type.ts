/* eslint-disable @typescript-eslint/no-explicit-any */
export class AuthPayload {
  sub: string;
  email: string;
  fullName: string;
  role?: string;
}

export class AuthProviderData {
  id: string;
  email: string;
  name: string;
  data: Record<string, any>;
}
