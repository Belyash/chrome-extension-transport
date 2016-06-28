# Chrome Extension Transport

### Example
At `background.html` init listeners for
```javascript
require(['messenger'], function (Messenger) {
    // ...
    // init Messenger as SLAVE
    var messenger = new Messenger();

    // subscribe to events from popup.html
    messenger.subscribe('popup.opened', function (data) {
        // When event will be published from popup.html:
        // data = { text: 'Popup opened!'}
    });

    // and then something happens - publish it
    messenger.publish('background.event', {text: 'Some text'});

    // ...
})
```

On `popup.html` open we need to subscribe on background-events:
```javascript
require(['messenger'], function (Messenger) {
    // ...
    // init Messenger as MASTER
    var messenger = new Messenger(true);

    // subscribe to events from background.html
    messenger.subscribe('background.event', function (data) {
        // When event will be published from background.html:
        // data = { text: 'Some text' }
    });

    // and publish event to `background.html`
    messenger.publish('popup.opened', {text: 'Popup opened!'});

    // ...
});
```