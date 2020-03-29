import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { MongoError } from 'mongodb';
import { Error } from 'mongoose';
import { Logger } from 'winston';
import { BaseResponseModel } from '@covid19-helpline/models';

@Catch()
@Injectable()
export class GenericExceptionFilter implements ExceptionFilter {
  constructor(@Inject('winston') protected readonly logger: Logger) {

  }

  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const resp = new BaseResponseModel();
    this.logger.error(exception, [{ stack: exception }]);

    if (exception instanceof MongoError) {
      // normal mongo errors
      resp.errors = [{
        message: exception.errmsg || exception.message,
        type: 'error'
      }];
      resp.status = 500;
    } else if (exception.response instanceof MongoError) {
      // mongo duplicate error and etc...
      resp.errors = [{
        message: exception.response.errmsg || exception.response.message,
        type: 'error'
      }];
      resp.status = 500;
    } else if (exception instanceof Error.ValidationError) {
      // mongoose validation errors
      if (Array.isArray(exception.message)) {
        resp.errors = [
          ...(exception as any).message.map(m => {
            return { type: 'error', message: m };
          })
        ];
      } else {
        resp.errors = [{
          message: exception.message,
          type: 'error'
        }];
      }
      resp.status = 400;
    } else if (exception instanceof Error.CastError) {
      // mongoose cast errors
      resp.errors = [{
        message: exception.message,
        type: 'error'
      }];
      resp.status = 500;
    } else if (exception instanceof Error.DocumentNotFoundError) {
      // mongoose cast errors
      resp.errors = [{
        message: exception.message,
        type: 'error'
      }];
      resp.status = 404;
    } else if (exception instanceof Error.MissingSchemaError) {
      resp.errors = [{
        message: 'Something Went Wrong',
        type: 'error'
      }];
      resp.status = 500;
    } else if (exception instanceof HttpException) {
      // mongoose validation errors
      if (exception.getResponse() instanceof Error.ValidationError) {
        resp.errors = [
          ...(exception.getResponse() as any).message.map(m => {
            return { type: 'error', message: m };
          })
        ];
      } else {
        // http errors
        resp.errors = [{
          message: (exception.getResponse() as any).message || (exception.getResponse() as any).error,
          type: 'error'
        }];
      }
      resp.status = exception.getStatus();
    } else if (exception instanceof UnauthorizedException) {
      resp.errors = [{
        message: exception.message,
        type: 'error'
      }];
      resp.status = exception.getStatus();
    } else if (exception instanceof Error) {
      resp.errors = [{
        message: exception.message,
        type: 'error'
      }];
      resp.status = 401;
    } else {
      resp.errors = [{
        message: 'Something Went Wrong',
        type: 'error'
      }];
      resp.status = 500;
    }

    resp.data = null;
    resp.hasError = true;
    resp.message = resp.errors[0].message;

    response.status(resp.status).json(resp);
  }

}
