export interface RequestLoginDTO {
  correo: string;
  pass: string;
}

export interface ResponseLoginDTO {
  isSuccess: boolean,
  token: string
}


