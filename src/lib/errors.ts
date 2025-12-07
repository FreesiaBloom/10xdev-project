export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404);
    this.name = "NotFoundError";
  }
}

export class DatabaseError extends AppError {
  constructor(message = "A database error occurred") {
    super(message, 500);
    this.name = "DatabaseError";
  }
}
