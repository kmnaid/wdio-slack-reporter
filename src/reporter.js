const util = require('util'),
    events = require('events'),
    syncRequest = require('sync-request')

const slackReporter = function(baseReporter, config, options) {

    if(!options.notify) {
        console.log('[slack-reporter] Slack notification is not on.');
        return;
    }
    if (!options.webhook) {
        console.warn('[slack-reporter] Slack Webhook URL is not configured, notifications will not be sent to slack.');
        return;
    }

    let attachments = [];

    this.on('end', function() {
        let stats = baseReporter.stats;

        if (!stats.counts.failures && options.notifyOnlyOnFailure) {
            //This provides an option to not send slack notifications when all tests pass
            console.log('[slack-reporter] All test passed, slack notification will not be sent as notifyOnlyOnFailure is set to true.');
            return;
        }

        let seconds = parseInt((stats._duration/1000)%60)
            , minutes = parseInt((stats._duration/(1000*60))%60)
            , hours = parseInt((stats._duration/(1000*60*60))%24);

        let attach = {};
        if(stats.failures.length) {
            stats.failures.forEach((failure) => {
                let sauceJobId,
                    sauceJobAuthToken;
                let browerDetails = failure.err.message;
                if (config.host.indexOf('saucelabs.com') > -1) {
                    browerDetails += `\nSauce Job: ${failure.runningBrowser.split('Check out job at ').pop()}`;
                }
                attach = {
                    color: '#CD0000',
                    title: failure.fullTitle,
                    footer: failure.err.stack,
                    text: browerDetails,
                };
                attachments.push(attach);
            });
        }
        attach = {
            color: '#0000e5',
            title: 'Test Results',
            title_link: options.results,
            text: options.message,
            fields: [
                {
                    title: 'Test Cases',
                    value: `Passed: ${stats.counts.passes}, Failed: ${stats.counts.failures}\n`,
                    short: true,
                },
                {
                    title: 'Duration',
                    value: `${hours}h : ${minutes}m : ${seconds}s`,
                    short: true
                }
            ],
        };
        attachments.push(attach);

        let res = syncRequest('POST', options.webhook, {
            json: {
                username: options.username,
                icon_emoji: (stats.counts.failures === 0) ? ':sun:' : ':rain:',
                attachments: attachments,
            },
        });
    });
};

slackReporter.reporterName = 'slackReporter';

/**
 * Inherit from EventEmitter
 */
util.inherits(slackReporter, events.EventEmitter);

/**
 * Expose Custom Reporter
 */
exports = module.exports = slackReporter;
