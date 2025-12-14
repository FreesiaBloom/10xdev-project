// src/lib/errors.ts

export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details: string
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class RecordNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RecordNotFoundError";
  }
}


export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string) {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string) {
    super(message, 429);
    this.name = "RateLimitError";
  }
}

export class ServerError extends ApiError {
  constructor(message: string, status: number) {
    super(message, status);
    this.name = "ServerError";
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class SchemaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SchemaValidationError";
  }
}
