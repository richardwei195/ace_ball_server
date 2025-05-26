export enum ResponseCode {
  SUCCESS = 0,
  ERROR = 1,
}

export interface BaseResponseDto<T> {
  code: ResponseCode;
  message: string;
  data: T;
}
