'use strict';
const { IncomingWebhook } = require('@slack/webhook');
const { execSync } = require('child_process');
const fs=require('fs');
const failedColor = '#CD0000';

class SlackReporter {
    async sendNotification(options, resultsSummary) {
        if (!options.webhook) {
            console.warn('[slack-reporter] Slack Webhook URL is not configured, notifications will not be sent to slack.');
            return;
        }

        const { username = 'wdio-slack-reporter'
            , webhook
            , jsonResultsDirectory
            , filePattern
            , notifyOnlyOnFailure = true } = options;

        if (!resultsSummary.failed && notifyOnlyOnFailure) {
            console.log('[slack-notifier] All test passed, slack notification will not be sent as notifyOnlyOnFailure is set.');
            return;
        }

        const slackHook = new IncomingWebhook(webhook)
            , command =`node mergeResults.js ${jsonResultsDirectory} ${filePattern}`;
        let results
            , executionTime = 0
            , attachments = []
            , attach = {};

        execSync(command, {stdio: [process.stdin, process.stdout, process.stderr]});
        try{
            results=JSON.parse(fs.readFileSync(`${jsonResultsDirectory}/wdio-merged.json`, 'utf8'));
        } catch(error) {
            console.log('Error while reading/parsing data from the merged json file', error);
            //Attach this error to slack notification
        }
        const suites = results.suites;
        suites.forEach(suite => {
            executionTime += suite.duration;
            suite.tests.forEach((test) => {
                if(test.state == 'failed') {
                    attach = {
                        color: failedColor,
                        title: `${suite.name}:${test.name}`,
                        footer: test.standardError,
                        //text: selenium host details - TODO
                    };
                    attachments.push(attach);
                }
            });
            suite.hooks.forEach(hook => {
                if(hook.state == 'failed') {
                //if(hook.error) {
                    attach = {
                        color: failedColor,
                        title: `${suite.name}:${hook.title}`,
                        footer: hook.standardError,
                    };
                    attachments.push(attach);
                }
            });
        });
        let seconds = parseInt((executionTime/1000)%60)
            , minutes = parseInt((executionTime/(1000*60))%60)
            , hours = parseInt((executionTime/(1000*60*60))%24);

        attach = {
            'color': '#6B33FF',
            'title': 'Summary',
            fields: [
                {
                    'title': 'Testcases',
                    value: `Passed: ${resultsSummary.passed}, Failed: ${resultsSummary.failed}\n`,
                    short: true,
                },
                {
                    'title': 'Duration',
                    value: `${hours}h : ${minutes}m : ${seconds}s`,
                    short: true
                }
            ],
        };
        attachments.push(attach);

        const payload = {
            username: username,
            icon_emoji: (resultsSummary.failed === 0) ? ':sun:' : ':rain:',
            'attachments': attachments
        };

        await slackHook.send(payload);
    }
}
module.exports = SlackReporter;
