# vue-remote-devtools

> This package provides a standalone vue-devtools application, that can be used to debug any Vue app regardless of the environment. Now you can debug your app opened in mobile browser, safari, native script etc. not just desktop chrome or firefox.

### :cd: Installation

Install the package globally:
```bash
npm install -g @vue/devtools
```

Or locally as project dependency:
```bash
npm install --save-dev @vue/devtools
```

### :rocket: Usage

#### Using global package

Once you installed the package globally, run:
```bash
vue-devtools
```

Then add:
```html
<script src="http://localhost:8098"></script>
```

Or if you want to debug your device remotely:
```html
<script>
  window.__VUE_DEVTOOLS_HOST__ = '<your-local-ip>' // default: localhost
  window.__VUE_DEVTOOLS_PORT__ = '<devtools-port>' // default: 8098
</script>
<script src="http://<your-local-ip>:8098"></script>
```

To the `<head>` section of your app. 
**(Don't forget to remove it before deploying to production!)**

`<your-local-ip>` usually looks like this: `192.168.x.x`.

#### Using dependency package

Once you installed the package as project dependency, run:
```bash
./node_modules/.bin/vue-devtools
```

You can also use the global `vue-devtools` to start the app, but you might want to check if the local version matches the global one in this scenario to avoid any incompatibilities.

Then import it directly in your app:
```js
import devtools from '@vue/devtools'
// import Vue from 'vue'
```
> Make sure you import devtools before Vue, otherwise it might not work as expected.

And connect to host:
```js
if (process.env.NODE_ENV === 'development') {
  devtools.connect(/* host, port */)
}
```

**host** - is an optional argument that tells your application where devtools middleware server is running, if you debug you app on your computer you don't have to set this (the default is `http://localhost`), but if you want to debug your app on mobile devices, you might want to pass your local IP (e.g. `http://192.168.1.12`).

**port** - is an optional argument that tells your application on what port devtools middleware server is running. If you use proxy server, you might want to set it to `null` so the port won't be added to connection URL.

#### FAQ:

**1. How to change port devtools server is running on?**

You can change it by setting environment variable before running it:
```
PORT=8000 vue-devtools
```

Then in your app you'll have to set either:
```
window.__VUE_DEVTOOLS_PORT__ = 8000
```

Or update connect method with new port:
```
devtools.connect(/* host */, 8000)
```

**2. How to remotely inspect page on the server?**

For that you can use `ngrok` proxy. You can download it [here](https://ngrok.com/).

Once you start vue-devtools run:
```
ngrok http 8098
```

Then update your host and port accordingly:
```
devtools.connect('https://example.ngrok.io', null)
```

Make sure to set port to `null` or `false`, because ngrok host already proxies to proper port that we defined in the first command.

**3. How to inspect page served through `HTTPS`?**

For that you can also use ngrok, as it automatically proxies https requests to http. Take a look at question number 2 for instructions.

**4. How to inspect cordova applications?**

Make sure that the page under `http://your-ip:8098` is returning a javascript coode on your device/simulator. If it doesn't - make sure to check your anti-virus or router/firewall settings. If it works - please follow the instructions, and connect to devtools using your IP. For example:

```js
import devtools from '@vue/devtools'
import Vue from 'vue'
// ...

function onDeviceReady () {
  devtools.connect('http://192.168.xx.yy') // use your IP
}

if (window.location.protocol === 'file:') {
  document.addEventListener('deviceready', onDeviceReady, false)
} else {
  onDeviceReady()
}
```

This will only work on `development` build of your app.

**5. How to change window title?**
You can change it by setting environment variable before running it:
```
TITLE="My Vue Developer Tools" vue-devtools
```

### :beers: Development

1. Install all dependencies
```
npm install
```

2. Run:
```
npm run dev
```
This will watch `src` folder and compile files on change

3. Run:
```
npm start
```
This will open electron app with devtools

4. Follow **Usage** section to connect any app to your development version of `vue-remote-devtools`

### :lock: License

[MIT](http://opensource.org/licenses/MIT)
