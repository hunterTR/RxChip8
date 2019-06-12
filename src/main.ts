import { RAM } from './ram';
import { CPU } from './cpu';

const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 320;
const pixelScale = 10;
class Main {
  cpu: CPU;
  ram: RAM;
  screen: HTMLCanvasElement;
  canvasContext: any;
  loadFlag: boolean;

  constructor() {
    this.intialize();
  }

  intialize() {
    this.loadFlag = false;
    // initialize ram
    this.ram = new RAM();

    // initialize screen
    this.screen = <HTMLCanvasElement>document.getElementById('screen');
    this.canvasContext = this.screen.getContext('2d');
    this.canvasContext.fillStyle = 'black';
    this.canvasContext.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    // initialize fontset
    for (let i = 0; i < fontset.length; i++) {
      this.ram.write(i, fontset[i]);
    }

    // initialize rom

    //this.loadFlag = this.loadGame();

    //initialize cpu
    this.cpu = new CPU(this.ram);
  }

  run() {
    //this.sleep(500);
    this.cpu.runCycle();
    if (this.cpu.drawFlag) {
      this.drawScreen();
      this.cpu.drawFlag = false;
    }

    setTimeout(() => {
      this.run();
    }, 1);
  }

  loadGame(file: any): boolean {
    let reader = new FileReader();
    reader.onload = e => {
      let buffer = new Uint8Array(reader.result as ArrayBuffer);
      for (let i = 0; i < buffer.length; i++) {
        this.ram.write(0x200 + i, buffer[i]);
      }
      console.log('loaded');
      this.loadFlag = true;
      this.run();
    };
    reader.readAsArrayBuffer(file);
    return true;
  }

  drawScreen() {
    // reset canvas
    this.canvasContext.fillStyle = 'black';
    this.canvasContext.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    // draw
    for (let h = 0; h < 32; h++) {
      for (let w = 0; w < 64; w++) {
        if (this.cpu.graphicArray[h][w] === 1) {
          this.drawPixel(w, h);
        }
      }
    }
  }

  sleep(delay: number) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
  }

  drawPixel(x: number, y: number) {
    this.canvasContext.fillStyle = 'white';
    this.canvasContext.fillRect(x * pixelScale, y * pixelScale, 10, 10);
  }
}

const fontset: number[] = [
  0xf0,
  0x90,
  0x90,
  0x90,
  0xf0, // 0
  0x20,
  0x60,
  0x20,
  0x20,
  0x70, // 1
  0xf0,
  0x10,
  0xf0,
  0x80,
  0xf0, // 2
  0xf0,
  0x10,
  0xf0,
  0x10,
  0xf0, // 3
  0x90,
  0x90,
  0xf0,
  0x10,
  0x10, // 4
  0xf0,
  0x80,
  0xf0,
  0x10,
  0xf0, // 5
  0xf0,
  0x80,
  0xf0,
  0x90,
  0xf0, // 6
  0xf0,
  0x10,
  0x20,
  0x40,
  0x40, // 7
  0xf0,
  0x90,
  0xf0,
  0x90,
  0xf0, // 8
  0xf0,
  0x90,
  0xf0,
  0x10,
  0xf0, // 9
  0xf0,
  0x90,
  0xf0,
  0x90,
  0x90, // A
  0xe0,
  0x90,
  0xe0,
  0x90,
  0xe0, // B
  0xf0,
  0x80,
  0x80,
  0x80,
  0xf0, // C
  0xe0,
  0x90,
  0x90,
  0x90,
  0xe0, // D
  0xf0,
  0x80,
  0xf0,
  0x80,
  0xf0, // E
  0xf0,
  0x80,
  0xf0,
  0x80,
  0x80 // F
];
window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

var chip8 = new Main();

var fileInput = document.getElementById('files');

fileInput.addEventListener('change', function(e) {
  // Put the rest of the demo code here.
  var file = (<any>e.target).files[0];
  chip8.loadGame(file);
});

document.addEventListener('keydown', event => {
  const keyName = event.key;
  if (keyName === '1') {
    chip8.cpu.keyPad[0] = 1;
  }
  if (keyName === '2') {
    chip8.cpu.keyPad[1] = 1;
  }
  if (keyName === '3') {
    chip8.cpu.keyPad[2] = 1;
  }
  if (keyName === '4') {
    chip8.cpu.keyPad[3] = 1;
  }
  if (keyName === 'q') {
    chip8.cpu.keyPad[4] = 1;
  }
  if (keyName === 'w') {
    chip8.cpu.keyPad[5] = 1;
  }
  if (keyName === 'e') {
    chip8.cpu.keyPad[6] = 1;
  }
  if (keyName === 'r') {
    chip8.cpu.keyPad[7] = 1;
  }
  if (keyName === 'a') {
    chip8.cpu.keyPad[8] = 1;
  }
  if (keyName === 's') {
    chip8.cpu.keyPad[9] = 1;
  }
  if (keyName === 'd') {
    chip8.cpu.keyPad[10] = 1;
  }
  if (keyName === 'f') {
    chip8.cpu.keyPad[11] = 1;
  }
  if (keyName === 'z') {
    chip8.cpu.keyPad[12] = 1;
  }
  if (keyName === 'x') {
    chip8.cpu.keyPad[13] = 1;
  }
  if (keyName === 'c') {
    chip8.cpu.keyPad[14] = 1;
  }
  if (keyName === 'v') {
    chip8.cpu.keyPad[15] = 1;
  }
  console.log(keyName);
});

document.addEventListener('keyup', event => {
  const keyName = event.key;
  if (keyName === '1') {
    chip8.cpu.keyPad[0] = 0;
  }
  if (keyName === '2') {
    chip8.cpu.keyPad[1] = 0;
  }
  if (keyName === '3') {
    chip8.cpu.keyPad[2] = 0;
  }
  if (keyName === '4') {
    chip8.cpu.keyPad[3] = 0;
  }
  if (keyName === 'q') {
    chip8.cpu.keyPad[4] = 0;
  }
  if (keyName === 'w') {
    chip8.cpu.keyPad[5] = 0;
  }
  if (keyName === 'e') {
    chip8.cpu.keyPad[6] = 0;
  }
  if (keyName === 'r') {
    chip8.cpu.keyPad[7] = 0;
  }
  if (keyName === 'a') {
    chip8.cpu.keyPad[8] = 0;
  }
  if (keyName === 's') {
    chip8.cpu.keyPad[9] = 0;
  }
  if (keyName === 'd') {
    chip8.cpu.keyPad[10] = 0;
  }
  if (keyName === 'f') {
    chip8.cpu.keyPad[11] = 0;
  }
  if (keyName === 'z') {
    chip8.cpu.keyPad[12] = 0;
  }
  if (keyName === 'x') {
    chip8.cpu.keyPad[13] = 0;
  }
  if (keyName === 'c') {
    chip8.cpu.keyPad[14] = 0;
  }
  if (keyName === 'v') {
    chip8.cpu.keyPad[15] = 0;
  }
  console.log(keyName);
});
