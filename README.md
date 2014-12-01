# Cordova Plugin: Plugin Auto Upgrade

This plugin with automatically upgrade (re-install) a set of plugins (specified by you) before every cordova prepare.  This is useful if you are doing plugin development and would like to automatically synchronize your app with any changes made to your plugin.

## Steps:

1. Install the plugin: `cordova plugin add org.apache.cordova.labs.pluginAutoUpgrade`

2. At root of your app, create a `pluginAutoUpgrade.json` file, which looks like:

```
{
  "PLUGIN_ID": "PLUGIN_INSTALL_PATH",
  "PLUGIN_ID2": "PLUGIN_INSTALL_PATH"
}
```

## Wishlist:

1. Should synchronize plugin changes made within `platforms/` or `plugins/` back out to the plugin source.
