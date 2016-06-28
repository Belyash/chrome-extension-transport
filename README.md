# Chrome Extension Transport

### Example
At `background.html` init Messenger as SLAVE:
```javascript
require(['messenger'], function (Messenger) {
    // ...
    // init Messenger as SLAVE
    var messenger = new Messenger();

    // subscribe to event from popup.html
    messenger.subscribe('popup.opened', function (data) {
        // When event will be published from popup.html:
        // data = { text: 'Popup opened!'}
    });

    // and then something happens - publish it
    messenger.publish('background.event', {text: 'Some text'});

    // ...
});
```

At `popup.html` init Messenger as MASTER:
```javascript
require(['messenger'], function (Messenger) {
    // ...
    // init Messenger as MASTER
    var messenger = new Messenger(true);

    // subscribe to event from background.html
    messenger.subscribe('background.event', function (data) {
        // When event will be published from background.html:
        // data = { text: 'Some text' }
    });

    // and publish event to `background.html`
    messenger.publish('popup.opened', {text: 'Popup opened!'});

    // ...
});
```