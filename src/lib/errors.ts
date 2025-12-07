// export class AppError extends Error {
//   constructor(
//     public readonly message: string,
//     public readonly statusCode: number
//   ) {
//     super(message);
//     this.name = "AppError";
//   }
// }

// export class NotFoundError extends Error {
//   constructor(resource = "Resource") {
//     super(`${resource} not found`, 404);
//     this.name = "NotFoundError";
//   }
// }

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
