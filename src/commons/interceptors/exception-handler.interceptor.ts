import config from '@configs/configuration';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SlackService } from 'nestjs-slack';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { WebClient } from '@slack/web-api';
import { OK } from '@commons/constants';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

const esService = new ElasticsearchService({
  node: config.ELASTICSEARCH.NODE,
});

const slackService = config.SLACK.BOT_TOKEN
  ? new SlackService(
      {
        type: 'api',
        token: config.SLACK.BOT_TOKEN,
        defaultChannel: config.SLACK.CHANNELS.DEFAULT,
        clientOptions: {
          retryConfig: {
            maxRetryTime: 20,
            onFailedAttempt: (error) => {
              console.error(error);
              return;
            },
            retries: 3,
          },
        },
      },
      new WebClient(config.SLACK.BOT_TOKEN),
      null,
    )
  : {
      postMessage: (payload) => console.log('Slack Noti: ', payload),
    };

@Injectable()
export class ExceptionHandlerInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next
      .handle()
      .pipe(
        catchError((errors) => {
          try {
            if (errors?.name?.includes('Exception')) {
              console.error(errors);
              return throwError(() => errors);
            }
            const current = new Date();
            const req = context.switchToHttp().getRequest();
            const request = {
              user: req?.user,
              body: req?.body,
              params: req?.params,
              query: req?.query,
            };
            const _errors = {
              name: errors?.name,
              message: errors?.message,
              stack: errors?.stack,
            };
            const payload = {
              '@timestamp': current,
              request,
              method: req.method,
              url: req.originalUrl,
              errors: Object.values(_errors)?.length ? _errors : errors,
            };
            const operations = [
              {
                index: {
                  _index: `${config.SERVICE}-${config.NODE_ENV}`, // example: demo-development
                },
              },
              payload,
            ];
            esService.bulk({ refresh: true, operations });
            slackService.postMessage({
              text: 'INTERNAL SERVER ERROR',
              blocks: [
                {
                  type: 'header',
                  text: {
                    emoji: true,
                    type: 'plain_text',
                    text: `:pogcat: \t INTERNAL SERVER ERROR ${current.toISOString()}`,
                  },
                },
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `\`\`\`${JSON.stringify(payload, null, 2)}\`\`\``,
                  },
                },
              ],
            });
            return throwError(() => errors);
          } catch (err) {
            console.error(err);
            return throwError(() => errors);
          }
        }),
      )
      .pipe(
        map((data) => ({
          statusCode: context.switchToHttp().getResponse().statusCode,
          message: OK,
          data,
        })),
      );
  }
}
