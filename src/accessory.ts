import {
  AccessoryConfig,
  AccessoryPlugin,
  API,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  HAP,
  Logging,
  Service
} from 'homebridge';
import SwitchBot from './SwitchBot';

type Config = AccessoryConfig & {
  macAddress: string;
  stateful?: boolean;
}

let hap: HAP;

/*
 * Initializer function called when the plugin is loaded.
 */
export = (api: API) => {
  hap = api.hap;
  api.registerAccessory('SwitchBotButtonPresser', SwitchBotButtonPresser as any);
};

class SwitchBotButtonPresser implements AccessoryPlugin {
  private readonly log: Logging;
  private readonly name: string;
  private readonly switchbot: SwitchBot;
  private readonly config: Config;
  private isResetting = false;
  private switchOn = false;

  private readonly switchService: Service;
  private readonly informationService: Service;

  constructor(log: Logging, config: Config, api: API) {
    this.log = log;
    this.name = config.name;
    this.config = config;
    this.switchbot = new SwitchBot(config.macAddress);

    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, 'Offir Golan')
      .setCharacteristic(hap.Characteristic.Model, 'Switchbot');

    this.switchService = new hap.Service.Switch(this.name);
    this.switchService.getCharacteristic(hap.Characteristic.On)
      .on(CharacteristicEventTypes.GET, this.getStatus.bind(this))
      .on(CharacteristicEventTypes.SET, this.setStatus.bind(this));
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [
      this.informationService,
      this.switchService,
    ];
  }

  getStatus(callback: CharacteristicGetCallback) {
    callback(undefined, this.switchOn);
  }

  async setStatus(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    const statusText = value ? 'on' : 'off';

    this.log(`Turning ${statusText}...`);

    // If `setStatus` was called to reset the status, no-op
    if (this.isResetting) {
      this.isResetting = false;
      callback();

      return;
    }

    try {
      if (this.config.stateful) {
        const action = value ? this.switchbot.turnOn : this.switchbot.turnOff;
        await action();
        this.switchOn = value as boolean;
      } else {
        await this.switchbot.press();

        // If the value is true, reset it back to false
        if (value) {
          this.isResetting = true;
          setTimeout(() => {
            this.switchService.setCharacteristic(hap.Characteristic.On, false);
          }, 1);
        }
      }

      callback();
    } catch (error) {
      this.log(`Failed turning ${statusText}`, error);
      callback(new Error(`Failed turning ${statusText}`));
    }
  }
}
