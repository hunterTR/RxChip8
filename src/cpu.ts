import { Opcode } from './models/opcode';
import { OpcodeBranch, RegisterOperation } from './enums/opcode-branch';
import { RAM } from './ram';
import { KeyPad } from './keypad';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { tap, takeWhile } from 'rxjs/operators';

export class CPU {
  private drawSubject$: BehaviorSubject<number[][]> = new BehaviorSubject<number[][]>(new Array<Array<number>>());
  PC: number;
  I: number;
  stack: Uint16Array;
  stackPointer: number;
  delayTimer: number;
  soundTimer: number;
  key: number;
  keyPad: Uint8Array;
  graphicArray: number[][];
  drawFlag: boolean;
  clockSpeed: number = 1;
  draw$: Observable<number[][]>;
  speed$ = interval(1);
  isRunning: boolean;
  //registers
  V0: number;
  V1: number;
  V2: number;
  V3: number;
  V4: number;
  V5: number;
  V6: number;
  V7: number;
  V8: number;
  V9: number;
  VA: number;
  VB: number;
  VC: number;
  VD: number;
  VE: number;
  VF: number;
  constructor(public ram: RAM, keyPad: KeyPad) {
    this.keyPad = keyPad.keyPad;
    this.initialize(); //initialize cpu
  }

  decode(): Opcode {
    const mainBranch: number = (this.ram.read(this.PC) & 0xf0) >> 4;
    let secondaryBranch: number;
    if (mainBranch === 0x0008 || mainBranch === 0x000e) {
      secondaryBranch = this.ram.read(this.PC + 1) & 0x0f;
    } else if (mainBranch === 0x000f) {
      secondaryBranch = this.ram.read(this.PC + 1);
    }

    const opcode: number = (this.ram.read(this.PC) << 8) | this.ram.read(this.PC + 1);
    return {
      mainBranch: mainBranch,
      secondaryBranch: secondaryBranch,
      opcode: opcode
    };
  }

  runCycle() {
    //console.log('running cycle');
    const instruction = this.decode();
    // console.log(instruction.opcode.toString(16));
    const registerX = (instruction.opcode & 0x0f00) >> 8;
    const registerY = (instruction.opcode & 0x00f0) >> 4;

    if (this.delayTimer > 0) {
      --this.delayTimer;
    }

    if (this.soundTimer > 0) {
      if (this.soundTimer == 1) console.log('make sound');

      --this.soundTimer;
    }

    switch (instruction.mainBranch) {
      case OpcodeBranch.ZERO: {
        switch (instruction.opcode) {
          case 0x00e0: {
            // Clears the screen.
            this.resetScreenArray();
            this.drawFlag = true;
            break;
          }
          case 0x00ee: {
            // Returns from a subroutine.
            if (this.stackPointer != 0) {
              this.stackPointer--;
            }
            this.PC = this.stack[this.stackPointer];
            return;
          }
          default: {
            // Calls RCA 1802 program at address NNN. Not necessary for most ROMs.
            break;
          }
        }
        break;
      }
      case OpcodeBranch.ADD_TO_REGISTER: {
        const val = instruction.opcode & 0x00ff;
        const addition = this.getRegister(registerX) + val;
        this.setRegister(registerX, addition);
        break;
      }
      case OpcodeBranch.CALL_SUBROUTINE: {
        this.PC += 2;
        const subRoutineAddress = instruction.opcode & 0x0fff;
        this.stack[this.stackPointer] = this.PC;
        this.stackPointer = (this.stackPointer + 1) % this.stack.length;
        this.PC = subRoutineAddress;
        return;
      }
      case OpcodeBranch.GOTO: {
        const address = instruction.opcode & 0x0fff;
        this.PC = address;
        return;
      }
      case OpcodeBranch.SET_REGISTER_TO_VAL: {
        const val = instruction.opcode & 0x00ff;
        this.setRegister(registerX, val);
        break;
      }
      case OpcodeBranch.SKIP_NEXT_IF_EQUALS: {
        // Skips the next instruction if VX equals NN. (Usually the next instruction is a jump to skip a code block)
        const val = instruction.opcode & 0x00ff;
        if (this.getRegister(registerX) === val) {
          this.PC += 2;
        }
        break;
      }
      case OpcodeBranch.SKIP_NEXT_IF_NOT_EQUALS: {
        // 	Skips the next instruction if VX doesn't equal NN. (Usually the next instruction is a jump to skip a code block)
        const val = instruction.opcode & 0x00ff;
        if (this.getRegister(registerX) !== val) {
          this.PC += 2;
        }
        break;
      }
      case OpcodeBranch.SKIP_NEXT_IF_REGISTER_EQUAL: {
        // Skips the next instruction if VX equals VY. (Usually the next instruction is a jump to skip a code block)
        if (this.getRegister(registerX) === this.getRegister(registerY)) {
          this.PC += 2;
        }

        break;
      }
      case 0x0009: {
        // Skips the next instruction if VX doesn't equal VY. (Usually the next instruction is a jump to skip a code block)
        if (this.getRegister(registerX) !== this.getRegister(registerY)) {
          this.PC += 2;
        }
        break;
      }
      case 0x000a: {
        // Sets I to the address NNN.
        const address = instruction.opcode & 0x0fff;
        this.I = address;
        break;
      }
      case 0x000b: {
        // Jumps to the address NNN plus V0.
        const address = instruction.opcode & 0x0fff;
        this.PC = address + this.V0;
        return;
      }
      case 0x000c: {
        // Sets VX to the result of a bitwise and operation on a random number (Typically: 0 to 255) and NN.
        const val = instruction.opcode & 0x00ff;
        this.setRegister(registerX, val & (Math.random() * 0xff));
        break;
      }
      case 0x000d: {
        // Draws a sprite at coordinate (VX, VY) that has a width of 8 pixels and a height of N pixels.
        // Each row of 8 pixels is read as bit-coded starting from memory location I;
        // I value doesn’t change after the execution of this instruction.
        // As described above, VF is set to 1 if any screen pixels are
        // flipped from set to unset when the sprite is drawn, and to 0 if that doesn’t happen
        const x = this.getRegister(registerX);
        const y = this.getRegister(registerY);
        const height = instruction.opcode & 0x000f;
        this.VF = 0x0;
        for (let h = 0; h < height; h++) {
          const row = this.ram.read(this.I + h);
          for (let w = 0; w < 8; w++) {
            if ((row & (0x80 >> w)) != 0) {
              if (this.graphicArray[y + h][x + w] == 1) {
                this.VF = 0x01;
              }
              this.graphicArray[y + h][x + w] ^= 1;
            }
          }
        }
        // this.drawFlag = true;
        this.drawSubject$.next(this.graphicArray);
        break;
      }
      case 0x000e: {
        switch (instruction.secondaryBranch) {
          case 0x000e: {
            // Skips the next instruction if the key stored in VX is pressed. (Usually the next instruction is a jump to skip a code block)
            if (this.keyPad[this.getRegister(registerX)] !== 0) {
              this.PC += 2;
            }
            break;
          }

          case 0x0001: {
            //Skips the next instruction if the key stored in VX isn't pressed. (Usually the next instruction is a jump to skip a code block)
            if (this.keyPad[this.getRegister(registerX)] === 0) {
              this.PC += 2;
            }
            break;
          }
        }
        break;
      }
      case 0x000f: {
        switch (instruction.secondaryBranch) {
          case 0x0007: {
            // Sets VX to the value of the delay timer.
            this.setRegister(registerX, this.delayTimer);
            break;
          }
          case 0x000a: {
            console.log('waiting for key press.');
            //A key press is awaited, and then stored in VX.
            // (Blocking Operation. All instruction halted until next key event)
            while (this.key === 0) {}
            this.setRegister(registerX, this.key);
            this.key = 0;
            break;
          }
          case 0x0015: {
            //Sets the delay timer to VX.
            this.delayTimer = this.getRegister(registerX);
            break;
          }
          case 0x0018: {
            //Sets the sound timer to VX.
            this.soundTimer = this.getRegister(registerX);
            break;
          }
          case 0x001e: {
            // Adds VX to I.
            this.I += this.getRegister(registerX);
            break;
          }
          case 0x0029: {
            // Sets I to the location of the sprite for the character in VX.
            // Characters 0-F (in hexadecimal) are represented by a 4x5 font.
            this.I = this.getRegister(registerX) * 5;
            break;
          }
          case 0x0033: {
            // Stores the binary-coded decimal representation of VX, with the most significant of three digits at the address in I,
            // the middle digit at I plus 1, and the least significant digit at I plus 2.
            // (In other words, take the decimal representation of VX, place the hundreds digit in memory at location in I,
            // the tens digit at location I+1, and the ones digit at location I+2.)
            const vxVal = this.getRegister(registerX);
            const onesDigit = vxVal % 10;
            const tensDigit = Math.floor(vxVal / 10) % 10;
            const hundredsDigit = Math.floor(vxVal / 100) % 10;
            this.ram.write(this.I, hundredsDigit);
            this.ram.write(this.I + 1, tensDigit);
            this.ram.write(this.I + 2, onesDigit);
            break;
          }
          case 0x0055: {
            // Stores V0 to VX (including VX) in memory starting at address I.
            // I is increased by 1 for each value written.
            for (let i = 0; i <= registerX; i++) {
              this.ram.write(this.I, this.getRegister(i));
              this.I++;
            }
            break;
          }
          case 0x0065: {
            // Fills V0 to VX (including VX) with values from memory starting at address I.
            // I is increased by 1 for each value written.
            for (let i = 0; i <= registerX; i++) {
              this.setRegister(i, this.ram.read(this.I));
              this.I++;
            }
            break;
          }
        }
        break;
      }
      case OpcodeBranch.REGISTER_OP: {
        switch (instruction.secondaryBranch) {
          case RegisterOperation.ADD_REGISTER: {
            const addition = this.getRegister(registerX) + this.getRegister(registerY);
            if (addition > 0xff) this.VF = 0x01;
            else this.VF = 0x00;

            this.setRegister(registerX, addition & 0xff);
            break;
          }
          case RegisterOperation.SET_REGISTER_AND: {
            const and = this.getRegister(registerX) & this.getRegister(registerY);
            this.setRegister(registerX, and);
            break;
          }
          case RegisterOperation.SET_REGISTER_OR: {
            const or = this.getRegister(registerX) | this.getRegister(registerY);
            this.setRegister(registerX, or);
            break;
          }
          case RegisterOperation.SET_REGISTER_SHIFT_LEFT: {
            //Shifts VY left by one and copies the result to VX.
            // VF is set to the value of the most significant bit of VY before the shift.
            this.VF = this.getRegister(registerY) >> 7;
            const shifted = this.getRegister(registerY) << 1;
            this.setRegister(registerY, shifted);
            this.setRegister(registerX, shifted);
            break;
          }
          case RegisterOperation.SET_REGISTER_SHIFT_RIGHT: {
            this.VF = this.getRegister(registerY) & 0x01;
            const shifted = this.getRegister(registerY) >> 1;
            this.setRegister(registerX, shifted);
            break;
          }
          case RegisterOperation.SET_REGISTER_TO_REGISTER: {
            this.setRegister(registerX, this.getRegister(registerY));
            break;
          }
          case RegisterOperation.SET_REGISTER_XOR: {
            const xor = this.getRegister(registerX) ^ this.getRegister(registerY);
            this.setRegister(registerX, xor);
            break;
          }
          case RegisterOperation.SUBSTRACT_REGISTER_OPPOSITE: {
            //Sets VX to VY minus VX. VF is set to 0 when there's a borrow, and 1 when there isn't.
            const substraction = this.getRegister(registerY) - this.getRegister(registerX);
            if (substraction < 0x00) this.VF = 0x00;
            else this.VF = 0x01;

            this.setRegister(registerX, substraction & 0xff);
            break;
          }
          case RegisterOperation.SUBSTRACT_REGISTER: {
            const substraction = this.getRegister(registerX) - this.getRegister(registerY);
            if (substraction < 0x00) this.VF = 0x00;
            else this.VF = 0x01;

            this.setRegister(registerX, substraction & 0xff);
            break;
          }

          default: {
            console.log('invalid register operation opcode');
            break;
          }
        }
        break;
      }

      default: {
        console.log('unknown opcode');
        break;
      }
    }

    this.PC += 2;
    console.log(this.PC);
  }

  initialize() {
    this.isRunning = true;
    this.PC = 0x200 & 0xffff;
    this.I = 0 & 0xffff;
    this.delayTimer = 0 & 0xff;
    this.soundTimer = 0 & 0xff;
    this.stack = new Uint16Array(16);
    this.stackPointer = 0;
    this.resetScreenArray();
    this.drawSubject$ = new BehaviorSubject<number[][]>(this.graphicArray);
    this.draw$ = this.drawSubject$.asObservable();
    this.resetRegisters();
    // start running the cpu.
    // this.speed$
    //   .pipe(
    //     tap((speed) => {
    //       this.runCycle();
    //     }),
    //     takeWhile(() => this.isRunning)
    //   )
    //   .subscribe();
  }

  destroy(){
    this.isRunning=false;
  }

  resetRegisters() {
    this.V0 = 0 & 0xff;
    this.V1 = 0 & 0xff;
    this.V2 = 0 & 0xff;
    this.V3 = 0 & 0xff;
    this.V4 = 0 & 0xff;
    this.V5 = 0 & 0xff;
    this.V6 = 0 & 0xff;
    this.V7 = 0 & 0xff;
    this.V8 = 0 & 0xff;
    this.V9 = 0 & 0xff;
    this.VA = 0 & 0xff;
    this.VB = 0 & 0xff;
    this.VC = 0 & 0xff;
    this.VD = 0 & 0xff;
    this.VE = 0 & 0xff;
    this.VF = 0 & 0xff;
  }
  getRegister(num: number): number {
    // instead of this extra code we could have one register and emulate registers like a memory.
    switch (num) {
      case 0x0: {
        return this.V0;
      }
      case 0x1: {
        return this.V1;
      }
      case 0x2: {
        return this.V2;
      }
      case 0x3: {
        return this.V3;
      }
      case 0x4: {
        return this.V4;
      }
      case 0x5: {
        return this.V5;
      }
      case 0x6: {
        return this.V6;
      }
      case 0x7: {
        return this.V7;
      }
      case 0x8: {
        return this.V8;
      }
      case 0x9: {
        return this.V9;
      }
      case 0xa: {
        return this.VA;
      }
      case 0xb: {
        return this.VB;
      }
      case 0xc: {
        return this.VC;
      }
      case 0xd: {
        return this.VD;
      }
      case 0xe: {
        return this.VE;
      }
      case 0xf: {
        return this.VF;
      }
    }
  }

  setRegister(num: number, val: number) {
    switch (num) {
      case 0x0: {
        this.V0 = val & 0xff;
        break;
      }
      case 0x1: {
        this.V1 = val & 0xff;
        break;
      }
      case 0x2: {
        this.V2 = val & 0xff;
        break;
      }
      case 0x3: {
        this.V3 = val & 0xff;
        break;
      }
      case 0x4: {
        this.V4 = val & 0xff;
        break;
      }
      case 0x5: {
        this.V5 = val & 0xff;
        break;
      }
      case 0x6: {
        this.V6 = val & 0xff;
        break;
      }
      case 0x7: {
        this.V7 = val & 0xff;
        break;
      }
      case 0x8: {
        this.V8 = val & 0xff;
        break;
      }
      case 0x9: {
        this.V9 = val & 0xff;
        break;
      }
      case 0xa: {
        this.VA = val & 0xff;
        break;
      }
      case 0xb: {
        this.VB = val & 0xff;
        break;
      }
      case 0xc: {
        this.VC = val & 0xff;
        break;
      }
      case 0xd: {
        this.VD = val & 0xff;
        break;
      }
      case 0xe: {
        this.VE = val & 0xff;
        break;
      }
      case 0xf: {
        this.VF = val & 0xff;
        break;
      }
    }
  }

  setKey(k: number) {
    this.key = k;
  }

  resetScreenArray() {
    this.graphicArray = new Array<Array<number>>();
    for (let h = 0; h < 100; h++) {
      this.graphicArray[h] = [];
      for (let w = 0; w < 100; w++) {
        this.graphicArray[h][w] = 0;
      }
    }
  }
}
