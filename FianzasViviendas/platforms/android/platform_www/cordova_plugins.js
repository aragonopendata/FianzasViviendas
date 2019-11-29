cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "id": "cordova-plugin-dialogs.notification",
        "file": "plugins/cordova-plugin-dialogs/www/notification.js",
        "pluginId": "cordova-plugin-dialogs",
        "merges": [
            "navigator.notification"
        ]
    },
    {
        "id": "cordova-plugin-dialogs.notification_android",
        "file": "plugins/cordova-plugin-dialogs/www/android/notification.js",
        "pluginId": "cordova-plugin-dialogs",
        "merges": [
            "navigator.notification"
        ]
    },
    {
        "id": "cordova-plugin-geolocation.geolocation",
        "file": "plugins/cordova-plugin-geolocation/www/android/geolocation.js",
        "pluginId": "cordova-plugin-geolocation",
        "clobbers": [
            "navigator.geolocation"
        ]
    },
    {
        "id": "cordova-plugin-geolocation.PositionError",
        "file": "plugins/cordova-plugin-geolocation/www/PositionError.js",
        "pluginId": "cordova-plugin-geolocation",
        "runs": true
    },
    {
        "id": "cordova-plugin-spinnerdialog.SpinnerDialog",
        "file": "plugins/cordova-plugin-spinnerdialog/www/spinner.js",
        "pluginId": "cordova-plugin-spinnerdialog",
        "merges": [
            "window.plugins.spinnerDialog"
        ]
    },
    {
        "id": "cordova-plugin-statusbar.statusbar",
        "file": "plugins/cordova-plugin-statusbar/www/statusbar.js",
        "pluginId": "cordova-plugin-statusbar",
        "clobbers": [
            "window.StatusBar"
        ]
    },
    {
        "id": "uk.co.workingedge.cordova.plugin.sqliteporter.sqlitePorter",
        "file": "plugins/uk.co.workingedge.cordova.plugin.sqliteporter/www/sqlitePorter.js",
        "pluginId": "uk.co.workingedge.cordova.plugin.sqliteporter",
        "clobbers": [
            "cordova.plugins.sqlitePorter"
        ]
    },
    {
        "id": "cordova-plugin-request-location-accuracy.RequestLocationAccuracy",
        "file": "plugins/cordova-plugin-request-location-accuracy/www/android/RequestLocationAccuracy.js",
        "pluginId": "cordova-plugin-request-location-accuracy",
        "clobbers": [
            "cordova.plugins.locationAccuracy"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-compat": "1.0.0",
    "cordova-plugin-console": "1.0.4",
    "cordova-plugin-dialogs": "1.3.1",
    "cordova-plugin-geolocation": "2.4.0",
    "cordova-plugin-spinnerdialog": "1.3.2",
    "cordova-plugin-statusbar": "2.2.1",
    "cordova-plugin-whitelist": "1.3.0",
    "uk.co.workingedge.cordova.plugin.sqliteporter": "0.1.1",
    "cordova-plugin-request-location-accuracy": "2.2.0"
};
// BOTTOM OF METADATA
});