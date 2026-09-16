export interface ApiErrorRes {
  message?: string | string[];
  statusCode?: number;
  error?: string;
  detail?: string;
  email?: string | string[];
  password?: string | string[];
  username?: string | string[];
}
