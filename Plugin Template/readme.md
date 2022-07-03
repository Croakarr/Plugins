# Sample Plugin

This plugin is intended to be used as a basic template for all any plugin developed for Croakerr, it includes all the required configurations for Croakerr to be able to successfully load the plugin, and also includes the required scripts to compile both development and test builds of your plugin.

## Getting Started

To get started simply copy this folder to your developer environment, then run `npm install` in your terminal.
From there, `npm` will take care of the heavy lifting, and you will be well on your way to getting a functional plugin developed.

Once you have installed the dependencies, simply run `npm run build` in your terminal, TypeScript will compile your plugin, and Webpack will take care of tying up the loose ends that cause dependency problems.

Congrats, you now have your `dist/entrypoint.js` file, this file contains your entire plugin, as well as all of its dependencies. It is also able to be recognised and loaded by Croakerr as a plugin, so, now you can simply configure Croakerr to pull plugins from your developer directory, reload it, and your plugin will be initialized.

## Plugin API

By default, plugins have access to one variable in the `enable` method, it is called `linker` and it is an object containing both the `croakerr` and `logger` submodules.

### `croakerr`

- Allows the plugin to interface directly with the `croakerr` api, registering events to receiving updates for.

### `logger`

- Allows the plugin to log directly to the same logfiles used by `croakerr`.
