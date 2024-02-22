# The Alerting module

The Masterportal can display hints to users by using the *Alerting* module. Both simple texts and HTML may be displayed.

Since multiple alert messages may be shown at once, a pool of all available alerts can be shown with multipleAlert: true. On adding a valid alert to this pool, a modal with all currently active alerts is shown.

An alert may be added in this fashion:

```js
import store from "[...]/src/app-store/index";

// [...]

store.dispatch("Alerting/addSingleAlert", {
    "category": "error",
    "content": "This wasn't supposed to happen! (Error Code 1234)",
    "multipleAlert": true
});
```

Another example: The following alert is shown from October '20 to November '21 and requires a manual reading confirmation.

```js
import store from "[...]/src/app-store/index";

// [...]

store.dispatch("Alerting/addSingleAlert", {
    "category": "info",
    "confirmText": "Starting any minute now ... !",
    "content": "Please prepare the quarterly reports!",
    "displayFrom": "2020-10-01 00:00:00",
    "displayUntil": "2021-11-01 00:00:00",
    "mustBeConfirmed": true
});
```

## Parameters for alert creation

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|title|no|String|""|Title of an alert.|
|category|no|String|"Info"|Header text and, at the same time, reference value for grouping alerts of the same *category*.|
|confirmText|no|String|"mark as read"|Text of a clickable link to indicate the alert has been read. Only required when `mustBeConfirmed` is set to `true`.|
|reConfirmText|no|String|"show this message again"|Text for showing the alert again.|
|content|yes|String|""|Message. May contain HTML.|
|displayFrom|no|Boolean/String|false|Time from which the alert may be displayed. When set to `false`, no limitation is applied. Format: "YYYY-MM-DD HH-II-SS"|
|displayUntil|no|Boolean/String|false|Time to which the alert may be displayed. When set to `false`, no limitation is applied. Format: "YYYY-MM-DD HH-II-SS"|
|mustBeConfirmed|no|Boolean|false|Flag indicating whether the alert requires a manual read confirmation.|
|multipleAlert|no|Boolean|false|Flag indicating whether the alert should be added to the current alert list (true) or is shown as a single alert (false)|
|once|no|Boolean|false|If `false`, this alert may be shown on each visit. If `true`, it's only shown once.|
|onceInSession|no|Boolean|false|If `false`, this alert may be shown on each visit. If `true`, it's only shown once in the current session.|

## Initially loading an *Alerting* configuration

The *Alerting* module allows specifying an URL in the `config.js` parameter `alerting.fetchBroadcastUrl`, e.g. `"https://localhost:9001/portal/master/resources/broadcastedPortalAlerts.json"`. If such a parameter is set, the module will load the linked configuration file and create the alerts. Multiple alerts are allowed by default. This may e.g. be used to inform users of new versions or planned down-times. An arbitrary amount of portals may be supplied with such a central user information file.

Configuration file example:

```json
{
  "globalAlerts": ["AlertId3"],

  "restrictedAlerts": {
    "https://myOfflinePortal.com/": ["AlertId1", "AlertId2"],
    "https://myLegacyPortal.com/": ["AlertId4"]
  },

  "alerts": {
    "AlertId1": {
      "category": "error",
      "content": "The server is in maintenance mode until November 10, 2020.",
      "displayFrom": "2020-11-09 00:00:00",
      "displayUntil": "2020-11-10 00:00:00",
      "mustBeConfirmed": false,
      "once": false
    },
    "AlertId2": {
      "category": "info",
      "content": "Since 11.11. there is a new version of the portal!",
      "displayFrom": "2020-11-11 00:00:00",
      "displayUntil": "2020-11-30 00:00:00",
      "mustBeConfirmed": true,
      "once": true
    },
    "AlertId3": {
      "category": "Welcome!",
      "content": "Welcome to the Portal!"
    },
    "AlertId4": {
      "category": "warning",
      "content": "This portal will be deactivated on 01/01/2021!",
      "displayFrom": "2020-12-01 00:00:00",
      "displayUntil": "2020-12-31 23:59:59"
    }
  }
}
```

Within `"globalAlerts"` an array may be specified that holds alert IDs to be loaded on all portals.

In the `"restrictedAlerts"` object alerts only for specific portals may be specified. For these, the key is the portal URL, and the value an array of alert IDs to be resolved by the portal at that URL.

Within `"alerts"`, alerts may be defined as previously defined. Each alert holds an ID for reference, which is its respective key in the `"alerts"` object.


Besides the central loading of alerts with an own alerting json. Alerts can defined within the `config.json` with the parameter `Portalconfig.alerts`. If such a parameter is set, the module will create the alerts. Multiple alerts are allowed by default. This allows to customize the initial alerts of a single portal.

Configuration of alerts within config.json example:

```json
  "Portalconfig": {
    "alerts": {
      "qs-release": {
        "category": "Portal zur Abnahme!",
        "content": "Dieses Geoportal dient der Qualitätskontrolle durch den Kunden.<br>Es ist aufgrund von möglichen Fehlern <b>nicht</b> zur Nutzung für alltägliche oder berufliche Aufgaben geeignet!<br><br>",
        "creationDate": "01/09/22",
        "mustBeConfirmed": true,
        "once": false
      },
    }
    },
    "mapView": {
```
