<p align="center">
  <img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">
</p>

# Homebridge SwitchBot Button Presser

A [Homebridge](https://github.com/nfarina/homebridge) plugin for [SwitchBot Button Presser](https://www.switch-bot.com/bot).

## Requirements

- Currently only Linux is supported
- `gatttool` needs to be installed

## Installation

Install the npm package:

```bash
sudo npm install -g homebridge-switchbot-button-presser
```

Find your SwitchBot's MAC address (BLE MAC) with the official iOS/Android app, and add an accessory definition via the plugin options or manually in `~/.homebridge/config.json`:

```json
{
  "accessories": [
    {
      "accessory": "SwitchBotButtonPresser",
      "name": "Coffee Machine",
      "macAddress": "01:23:45:67:89:AB",
      "stateful": false
    }
  ]
}
```
