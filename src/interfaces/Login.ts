export interface RequestLoginDTO {
  email: string;
  password: string;
}

export interface ResponseLoginDTO {
  isSuccess: boolean;
  token: string;
}
export interface AuthState {
  user: string | null;
  idUsuario: string;
  token: string;
  error: string | null;
}
