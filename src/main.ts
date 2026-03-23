import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

import * as Sentry from '@sentry/angular';

declare const __SENTRY_DSN__: string | undefined;

if (__SENTRY_DSN__) {
  Sentry.init({
    dsn: __SENTRY_DSN__,
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
  });
}

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
