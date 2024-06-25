export interface RequestLoginDTO {
  email: string;
  password: string;
}

export interface ResponseLoginDTO {
  isSuccess: boolean;
  token: string;
}
