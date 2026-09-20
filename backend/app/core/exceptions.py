class AppError(Exception):
    """Base class for application-level errors mapped to HTTP responses."""

    status_code: int = 400

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class ConflictError(AppError):
    status_code = 409


class UnauthorizedError(AppError):
    status_code = 401


class ForbiddenError(AppError):
    status_code = 403


class NotFoundError(AppError):
    status_code = 404


class TooManyRequestsError(AppError):
    status_code = 429
