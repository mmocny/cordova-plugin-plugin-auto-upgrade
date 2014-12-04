/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

module.exports = function(context) {
  var Q = context.requireCordovaModule('q');
  var path = context.requireCordovaModule('path');

  function resolvePath(string) {
    if (string.substr(0,1) === '~')
      return path.resolve(process.env.HOME + string.substr(1));
    return path.resolve(string);
  }

  function runCordovaCommand(cmd) {
    return context.cordova.raw[cmd[0]].apply(context.cordova, cmd.slice(1));
  }

  function chainCordovaCommands(cmds) {
    return cmds.map(function(cmd) {
      // Be lazy: return a function that will return a promise, don't create the promise now
      return function() {
        return runCordovaCommand(cmd);
      };
    }).reduce(Q.when, Q.when());
  }

  var PLUGINS = {};
  try {
    PLUGINS = require(path.join(context.opts.projectRoot, 'pluginAutoUpgrade.json'));
  } catch(e) {
    console.error("Exception:", e);
    console.error("Note: cordova-plugin-plugin-auto-upgrade requires valid `pluginAutoUpgrade.json` at the root of your project.");
  }

  return runCordovaCommand(["plugin", "ls"])
    .then(function(installedPlugins) {
      // TODO: plugin ls prints to console, try getting one of the below quite ways to work
      //var installedPlugins = context.cordova.plugins.map(function(s) { return s.toLowerCase(); })
      //var installedPlugins = context.cordova.cordova_lib.PluginInfo.loadPluginsDir(path.join(context.opts.projectRoot, 'plugins'));
      var rmCmd= ["plugin", "rm"];
      var addCmd= ["plugin", "add"];

      Object.keys(PLUGINS).forEach(function(pluginId) {
        if (installedPlugins.indexOf(pluginId) != -1) {
          rmCmd.push(pluginId);
        }
        addCmd.push(resolvePath(PLUGINS[pluginId]));
      })

      // We may not have anything to remove (i.e. if this is the first prepare), and we may not have anything to add (i.e. pluginAutoUpgrade.json is empty)
      var cmds = [];
      if (rmCmd.length > 2) cmds.push(rmCmd);
      if (addCmd.length > 2) cmds.push(addCmd);

      return chainCordovaCommands(cmds);
    });
}
