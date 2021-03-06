var request = require('request');
var chai = require('chai');
var expect = chai.expect;
var defSetting = require('./defaultSetting');

describe('apiRouterTest', function () {

    before(function () {
        global.proxyServer = defSetting.getDefaultProxyServer();
        global.apiServer = defSetting.getDefaultApiServer();
        global.apiServer.apiRouter.maxPushIds = 3;
        global.apiUrl = defSetting.getDefaultApiUrl();
        global.pushClients = [];
        for (let i = 0; i < 2 * global.apiServer.apiRouter.maxPushIds + 1; i++) {
            global.pushClients.push(defSetting.getDefaultPushClient("abcdefghijsdjfk" + i));
        }
    });

    after(function () {
        global.proxyServer.close();
        global.apiServer.close();
        global.pushClients.forEach((client) => {
            client.disconnect();
        });
    });

    it('send notification', (done) => {

        let pushIds = [];
        pushClients.forEach((client) => {
            client.on('connect', () => {
                var title = 'hello',
                    message = 'hello world';
                var data = {
                    "android": {"title": title, "message": message},
                    "payload": {"wwww": "qqqq"}
                };
                var str = JSON.stringify(data);

                var notificationCallback = function (data) {
                    expect(data.title).to.be.equal(title);
                    expect(data.message).to.be.equal(message);
                    expect(data.payload.wwww).to.be.equal("qqqq");
                    let index = pushIds.indexOf(client.pushId);
                    expect(index).to.not.be.equal(-1);
                    pushIds.splice(index, 1);
                    if (pushIds.length == 0) {
                        done();
                    }
                };
                client.on('notification', notificationCallback);
                pushIds.push(client.pushId);
                if (pushIds.length == pushClients.length) {
                    request({
                        url: apiUrl + '/api/notification',
                        method: "post",
                        headers: {
                            'Accept': 'application/json'
                        },
                        form: {
                            pushId: JSON.stringify(pushIds),
                            notification: str
                        }
                    }, (error, response, body) => {
                        expect(JSON.parse(body).code).to.be.equal("success");
                    });
                }
            });
        });
    });
});
