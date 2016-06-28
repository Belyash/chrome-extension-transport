define(function (require) {
    "use strict";

    var instance = null,
        uid = 0,
        postBox = {};

    function Messenger (master) {
        if (instance !== null) {
            throw new Error("Cannot instantiate more than one Messenger, use Messenger.getInstance()");
        }

        this.initialize(master);
    }

    function initListeners (port) {
        port.onMessage.addListener(function(message, sender, callback) {
            var response = [],
                key;

            if (postBox.hasOwnProperty(message.event)) {

                for (key in postBox[message.event]) {
                    if (postBox[message.event].hasOwnProperty(key)) {
                        response.push(postBox[message.event][key](message.data));
                    }
                }

                if (typeof callback === "function") {
                    callback(response);
                }
            }
        });
    }

    Messenger.prototype = {
        initialize: function (master) {
            var self = this;

            // Если master(popup), то создаем новый канал связи,
            // в противном случае(background) подписываемся на создание
            if (master) {
                self.type = 'master';
                self.port = chrome.runtime.connect({name: "messenger"});
                initListeners(self.port);
            } else {
                self.type = 'slave';
                chrome.runtime.onConnect.addListener(function(port) {
                    console.log('Connected as "slave" to port with name:', port.name);

                    self.port = port;
                    initListeners(self.port);

                    self.port.onDisconnect.addListener(function () {
                        console.log('Disconnected from port with name %s', self.port.name);
                        self.port.onMessage.removeListener();
                        self.port = null;
                    });
                });
            }

        },
        publish: function (event, data) {
            var self = this,
                message = {
                    event: event,
                    from: self.type,
                    data: data
                };

            if (self.port) {
                self.port.postMessage(message);
            } else if (!self.master) {
                // Здесь можно впилить показ нотификаций на случай если popup скрыт
            }

        },
        subscribe: function (event, callback) {
            var token = "uid_" + uid++;

            if (typeof callback !== "function") {
                return false;
            }

            if (!postBox.hasOwnProperty(event)) {
                postBox[event] = {};
            }

            postBox[event][token] = callback;

            return token;
        },
        unsubscribe: function (event, token) {
            var result = false;

            if (postBox.hasOwnProperty(event)) {
                if (token) {
                    delete postBox[event][token];
                } else {
                    delete postBox[event];
                }

                result = true;
            }

            return result;
        }
    };

    Messenger.getInstance = function (master) {
        if (instance === null) {
            instance = new Messenger(master);
        }

        return instance;
    };

    return Messenger.getInstance;
});