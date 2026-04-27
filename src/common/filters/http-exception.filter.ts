import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | object;
    let error: string;

    // Handle Prisma Client Known Request Errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      message = this.getPrismaErrorMessage(exception);
      error = 'Bad Request';

      this.logger.error(
        `Prisma Error: ${exception.code} - ${exception.message}`,
        exception.stack,
      );
    }
    // Handle NestJS HTTP Exceptions
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = (responseObj.message as string | object) || exceptionResponse;
        error = (responseObj.error as string) || exception.name;
      }

      this.logger.error(
        `HTTP Exception: ${status} - ${JSON.stringify(message)}`,
        exception.stack,
      );
    }
    // Handle Unknown Errors
    else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Internal Server Error';

      const exceptionMessage =
        exception instanceof Error ? exception.message : String(exception);
      this.logger.error(
        `Unhandled Exception: ${exceptionMessage}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    // Send JSON response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error,
      message,
    });
  }

  /**
   * Extract a user-friendly error message from Prisma errors
   */
  private getPrismaErrorMessage(
    exception: Prisma.PrismaClientKnownRequestError,
  ): string {
    switch (exception.code) {
      case 'P2000':
        return `The provided value for the column is too long for the column's type`;
      case 'P2001':
        return `The record searched for in the where condition does not exist`;
      case 'P2002':
        return `Unique constraint failed on the fields: ${this.formatTarget(exception.meta?.target)}`;
      case 'P2003':
        return `Foreign key constraint failed on the field: ${this.formatTarget(exception.meta?.field_name)}`;
      case 'P2004':
        return `A constraint failed on the database`;
      case 'P2005':
        return `The value stored in the database is invalid for the field's type`;
      case 'P2006':
        return `The provided value is not valid`;
      case 'P2007':
        return `Data validation error`;
      case 'P2008':
        return `Failed to parse the query`;
      case 'P2009':
        return `Failed to validate the query`;
      case 'P2010':
        return `Raw query failed`;
      case 'P2011':
        return `Null constraint violation on the fields: ${this.formatTarget(exception.meta?.target)}`;
      case 'P2012':
        return `Missing a required value`;
      case 'P2013':
        return `Missing the required argument`;
      case 'P2014':
        return `The change you are trying to make would violate the required relation`;
      case 'P2015':
        return `A related record could not be found`;
      case 'P2016':
        return `Query interpretation error`;
      case 'P2017':
        return `The records for relation are not connected`;
      case 'P2018':
        return `The required connected records were not found`;
      case 'P2019':
        return `Input error`;
      case 'P2020':
        return `Value out of range for the type`;
      case 'P2021':
        return `The table does not exist in the current database`;
      case 'P2022':
        return `The column does not exist in the current database`;
      case 'P2023':
        return `Inconsistent column data`;
      case 'P2024':
        return `Timed out fetching a new connection from the connection pool`;
      case 'P2025':
        return `Record to delete does not exist`;
      case 'P2026':
        return `The current database provider doesn't support a feature that the query used`;
      case 'P2027':
        return `Multiple errors occurred on the database during query execution`;
      case 'P2028':
        return `Transaction API error`;
      case 'P2030':
        return `Cannot find a fulltext index to use for the search`;
      case 'P2031':
        return `MongoDB replica set required`;
      case 'P2033':
        return `A number used in the query does not fit into a 64 bit signed integer`;
      case 'P2034':
        return `Transaction failed due to a write conflict or a deadlock`;
      default:
        return exception.message || 'Database operation failed';
    }
  }

  /**
   * Format target/field_name for better readability
   */
  private formatTarget(target: any): string {
    if (!target) return 'unknown';
    if (Array.isArray(target)) return target.join(', ');
    return String(target);
  }
}
