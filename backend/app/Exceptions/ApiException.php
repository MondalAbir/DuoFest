<?php

namespace App\Exceptions;

use Exception;
use Throwable;

/**
 * Domain exception rendered as a structured JSON error response by the
 * application exception handler.
 */
class ApiException extends Exception
{
    /**
     * @param  int  $status  HTTP status code
     * @param  mixed  $errors  Optional validation-style details payload
     * @param  array<string, string>  $headers  Response headers
     */
    public function __construct(
        string $message,
        protected readonly int $status = 400,
        protected readonly mixed $errors = null,
        protected readonly array $headers = [],
        ?Throwable $previous = null,
        private readonly string $errorCode = 'api_error',
    ) {
        parent::__construct($message, $status, $previous);
    }

    public function getStatusCode(): int
    {
        return $this->status;
    }

    public function getErrors(): mixed
    {
        return $this->errors;
    }

    public function getHeaders(): array
    {
        return $this->headers;
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }
}
