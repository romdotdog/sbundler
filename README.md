<h1 align="center">Welcome to sbundler 👋</h1>
<p>
  <a href="https://www.npmjs.com/package/sbundler"><img src="https://badge.fury.io/js/sbundler.svg" alt="npm version" height="18"></a>
  <a href="https://github.com/romdotdog/sbundler#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/romdotdog/sbundler/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/romdotdog/sbundler/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/romdotdog/sbundler" />
  </a>
</p>

> A bundler for SB projects.

### 🏠 [Homepage](https://github.com/romdotdog/sbundler#readme)

## Install

```sh
npm install -g sbundler
```

## Usage

```sh
sbundler [output] -s <serverMainName> -c <clientMainName> --no-watermark
```

## Author

👤 **romdotdog**

- Website: https://rom.dog
- Github: [@romdotdog](https://github.com/romdotdog)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/romdotdog/sbundler/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📜 Documentation

### Logistics

Each project should take place in a separate directory. There should be two files, `main.server.lua` and `main.client.lua`. Every filename of the project must be infixed by either `server`, `client`, or `shared`.

### API

```lua
import(relativePath: string)
--[[
	All paths taken must be part of the directory at which the `sbundler` command has been run.
	They are always relative to the project directory.
]]

on(event: string, callback: anyFunction)
--[[
	This is a wrapper for the RemoteEvent connection.
	`event` can be any string and is transferred through the connection.
]]

onInvoke(event: string, callback: anyFunction, overwrite: boolean | nil)
--[[
	This is a wrapper for the RemoteFunction connection.
	`event` can be any string and is transferred through the connection.

	** There can only be one function per event,
	you can overwrite the current event by using the third argument. **
]]

emit(event: string, ...: any)
--[[
	Emit to the opposing side the information in the variadic argument
	through a RemoteEvent.
]]

invoke(event: string, ...: any)
--[[
	Emit to the opposing side the information in the variadic argument
	through a RemoteFunction.

	** This yields for the return. **
]]


-- // Server API //

-- Whether other players firing the remote are able to trigger
-- a response from the server.
local disallowOtherPlayers: boolean = true

-- The client script instance.
local clientScript: LocalScript


-- // Client API //

-- The server script instance.
local serverScript: Script

```

## 📝 License

Copyright © 2021 [romdotdog](https://github.com/romdotdog).<br />
This project is [MIT](https://github.com/romdotdog/sbundler/blob/master/LICENSE) licensed.

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
