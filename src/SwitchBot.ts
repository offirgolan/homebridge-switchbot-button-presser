import { exec as _exec } from 'child_process';
import { promisify } from 'util';

const exec = promisify(_exec);

enum Command {
  turnOn = '570101',
  turnOff = '570102',
  press = '570100'
}

export default class SwitchBot {
  private readonly address: string;

  constructor(address: string) {
    this.address = address;
  }

  press() {
    return this.trigger('press');
  }

  turnOn() {
    return this.trigger('turnOn');
  }

  turnOff() {
    return this.trigger('turnOff');
  }

  async trigger(triggerCommand: keyof typeof Command) {
    if (!Command[triggerCommand]) {
      throw new Error(`The command ${triggerCommand} is invalid.`);
    }

    await exec(
      `gatttool -t random -b ${this.address} --char-write-req -a 0x0016 -n ${Command[triggerCommand]}`
    );
  }
}
