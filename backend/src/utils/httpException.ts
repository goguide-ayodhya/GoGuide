export class HttpException extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: Record<string, any>
  ) {
    super(message);
    this.name = 'HttpException';
  }
}

export class BadRequest extends HttpException {
  constructor(message: string, errors?: Record<string, any>) {
    super(400, message, errors);
    this.name = 'BadRequest';
  }
}

export class Unauthorized extends HttpException {
  constructor(message: string = 'Unauthorized') {
    super(401, message);
    this.name = 'Unauthorized';
  }
}

export class Forbidden extends HttpException {
  constructor(message: string = 'Forbidden') {
    super(403, message);
    this.name = 'Forbidden';
  }
}

export class NotFound extends HttpException {
  constructor(message: string = 'Not Found') {
    super(404, message);
    this.name = 'NotFound';
  }
}

export class Conflict extends HttpException {
  constructor(message: string = 'Conflict') {
    super(409, message);
    this.name = 'Conflict';
  }
}

export class InternalServerError extends HttpException {
  constructor(message: string = 'Internal Server Error') {
    super(500, message);
    this.name = 'InternalServerError';
  }
}
