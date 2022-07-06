# Croakarr Plugins

This repository contains the source code to all of the official [Croakarr](https://github.com/CroakarrApp/Croakarr) plugins.

You can also find the compiled plugin bundles (and historical releases) within the `compiled` folder.

Here's a breif breakdown of the plugins currently available in this repository.

## Breakdown

It ships with four core plugins at the moment:

- Lidarr - A plugin which provides media notifications for [Lidarr](https://lidarr.audio)
- Radarr - A plugin which provides media notifications for [Radarr](https://radarr.video)
- Sonarr - A plugin which provides media notifications for [Sonarr](https://sonarr.tv/)
- CroakarrForPlex - A plugin which provides notifications for [Plex](https://plex.tv)
- CroakarrForiCue - A plugin which tracks notifications and flashes your [iCue](https://www.corsair.com/uk/en/Categories/Products/CORSAIR-iCUE/c/Cor_Products_iCue_Compatibility) enabled devices a specific brand color to help identify notification sources at a glance

## Documentation

Welcome to the plugin API documentation. Plugins allow Croakarr to support anything that can trigger events via webhooks. Meaning you can support everything from Plex media imports to url shorteners, to blog posts.

Whatever you can create, Croakarr can process.

### Installation

To install a plugin, simply download and extract the `zip` file to the `plugins` directory.

The `plugins` directory is located in the same folder as the croakarr application, so if it does not exist, please make one.

After that is done, Croakarr will need to restart in order to load the new plugin.

### Development

So you want to make your own plugin, thats great! Here is a breif guide on how you can do that.

A plugin requires two main components, a `croaker-manifest.json` (herein referred to as `manifest`), and a JavaScript file which is referenced in your `manifest`'s `entrypoint` value.

Once both of those are present, a plugin can be loaded by Croakarr.

One way to ensure that your plugin is up to spec, is to use the official [croakarr plugin templates](https://www.npmjs.com/package/@croakarr/create-croakarr-plugin) utility.

#### Using NPX

```npx
npx @croakarr/create-croakarr-plugin
```

#### Using NPM

```npm
npm init @croakarr/croakarr-plugin
```

#### Using Yarn

```npm
yarn create @croakarr/croakarr-plugin
```

This utility will ask you the name of your package, and what language you plan to use for it (TypeScript, or JavaScript), from there it will create your plugin using the values provided, and generate the content based on the template you requested.

Once you have finished the guided generator, you can now navigate to your plugin's directory and open it in your editor of choice. From here you will be greeted with a source file, one of `src/entrypoint.js` or `src/entrypoint.ts`. You can make sure your plugin is correct, and then to test it, run `npm run build` in your terminal, this will start the bundle creation off, leaving you with a `dist/entrypoint.js` file, which can be used for testing purposes.

> Keep in mind, if you are using any external dependencies, you will also need to include your `node_modules` folder within your final `plugin.zip` file.

### Testing a plugin

To test your plugin, take your `node_modules` folder, your `dist/entrypoint.js`, and your `croakarr-manifest.json` files, and place them in your ["Croakarr plugin directory"](#installation).

> **IMPORTANT**: Make sure that your files are within a folder containing the name of your plugin (and preferably, it's release version)
>
> An ideal example would be the following
>
> ```txt
> myplugin-1_0_0
> | croakarr-manifest.json
> | entrypoint.js
> | node_modules
>   | some-npm-package
>     | some_required_file.js
> ```
