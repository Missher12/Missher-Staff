export class ApiError extends Error {
  public status: number;
  public requestId: string;
  public code?: string;

  constructor(message: string, status: number, requestId: string = "REQ_ERR", code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.requestId = requestId;
    this.code = code;
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = "未登录或登录过期", requestId: string = "REQ_401") {
    super(message, 401, requestId, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = "无权访问该资源", requestId: string = "REQ_403") {
    super(message, 403, requestId, "FORBIDDEN");
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "请求的资源未找到", requestId: string = "REQ_404") {
    super(message, 404, requestId, "NOT_FOUND");
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = "请求发生冲突", requestId: string = "REQ_409") {
    super(message, 409, requestId, "CONFLICT");
  }
}
