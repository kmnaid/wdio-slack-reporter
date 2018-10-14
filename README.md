WDIO Slack Reporter
==================

A webdriverIO reporter which sends notifications of test results to [slack](https://slack.com/).

## Installation

Install [`wdio-slack-reporter`](https://www.npmjs.com/package/wdio-slack-reporter) as a dependency.

```bash
npm install --save wdio-slack-reporter
```

## Configuration
In order to use the reporter you need to add slack to your reporter array in wdio.conf.js

```js
// wdio.conf.js
module.exports = {
  reporters: ['slack'],
};
```

## Configuration Options

The following configuration options are supported and are all optional. By default none of the config options are set.
For notifications to be sent ```webhook``` and ```notify``` options should atleast be set.

|Option|Description|
|---|---|
|notify|Turn on the slack notification by setting this option to true.|
|webhook|URL - [Incoming webhook](https://api.slack.com/incoming-webhooks) of the slack channel to which notifications should be sent. If the URL is not configured, notifications will not be sent.|
|notifyOnlyOnFailure|Set this option to true to send notifications only when there are test failures, else the test summary will be sent even if all tests pass.|
|username|The value of username will appear in the slack notification as the user who sent it.|
|message|This is a string value. It is an optional text message which appears in the notification.|
|results|Provide a link to the test results. It is a clickable link in the notification.|


To use a configuration option add a ```slack``` section to ```reporterOptions``` in your wdio config and configure the values.

```js
// wdio.conf.js
module.exports = {
  reporters: ['slack'],
  reporterOptions: {
        slack: { 
            notify: process.env.SLACK || true,
            webhook: "https://hooks.slack.com/services/..." || process.env.SLACK_WEBHOOK,
            notifyOnlyOnFailure: process.env.SLACK_FAILURE_ONLY || false,
            username: 'TestBot',
            // An optional message to include at the top of the notification
            message: 'This is an optional message',
            // results-Optional: Provide a link to the results, below is an example of linking to 
            // the build results on Jenkins
            results: process.env.JENKINS_URL,
        }
    },
  // ...
};
```

