import config from '@configs/configuration';
import { Global, Injectable, Module } from '@nestjs/common';
import {
  SlackModule as NestSlackModule,
  SlackService as NestSlackService,
} from 'nestjs-slack';
import debounce from 'lodash/debounce';
import { SECONDS_TO_MILLISECONDS } from '@commons/constants';

@Injectable()
export class NamiSlack {
  public readonly slack: NestSlackService;

  constructor(private readonly slackService: NestSlackService) {
    this.slack = slackService;
  }

  sendSlackMessage = debounce(
    async (message: string, payload?: object) => {
      return this.slackService.postMessage({
        text: `${config.SERVICE}: ${message}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*LOG*:  _${message}_`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `\`\`\`${JSON.stringify(payload, null, 2)}\`\`\``,
            },
          },
          {
            type: 'divider',
          },
        ],
      });
    },
    300,
    { maxWait: SECONDS_TO_MILLISECONDS.THREE },
  );
}

@Global()
@Module({
  imports: [
    NestSlackModule.forRoot({
      type: 'api',
      token: config.SLACK.BOT_TOKEN,
      isGlobal: true,
      defaultChannel: config.SLACK.CHANNELS.ALERT,
      clientOptions: {
        retryConfig: {
          maxRetryTime: config.NICE,
          onFailedAttempt: (error) => {
            console.log(error);
            return;
          },
          retries: 3,
        },
      },
    }),
  ],
  providers: [NamiSlack],
  exports: [NamiSlack],
})
export class SlackModule {}
