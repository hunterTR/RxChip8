import { RAM } from './src/ram';
import { CPU } from './src/cpu';
import { Observable, BehaviorSubject, combineLatest, interval, fromEvent, merge } from 'rxjs';
import { map, shareReplay, tap, mergeMap, switchMap } from 'rxjs/operators';
import { Renderer } from './src/renderer';
import { KeyPad } from './src/keypad';

class Main {
  cpu: CPU;
  ram: RAM;
  ramSubject$: BehaviorSubject<RAM> = new BehaviorSubject(new RAM());
  keyPadSubject$: BehaviorSubject<KeyPad> = new BehaviorSubject(new KeyPad());
  private loadGameSubject$: BehaviorSubject<ArrayBuffer> = new BehaviorSubject<ArrayBuffer>(null);
  private loadGame$: Observable<ArrayBuffer>;
  ram$: Observable<RAM>;
  cpu$: Observable<CPU>;
  screen: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
  loadFlag: boolean;
  renderer: Renderer;
  keyPad$: Observable<KeyPad>;
  speed$ = interval(1);

  constructor() {
    // start initialize
    this.intialize();
  }

  intialize() {
    this.loadFlag = false;
    this.loadGame$ = this.loadGameSubject$.asObservable();
    // initialize screen
    this.renderer = new Renderer();
    // initialize keypad
    this.keyPad$ = this.keyPadSubject$.asObservable();
    // initialize RAM
    this.ram$ = this.ramSubject$.asObservable();
    // initialize CPU
    this.cpu$ = combineLatest(this.ram$, this.keyPad$, this.loadGame$).pipe(
      tap(([ram, keyPad, arrayBuffer]) => {
        // initialize fontset
        for (let i = 0; i < fontset.length; i++) {
          ram.write(i, fontset[i]);
        }
        // initialize game
        this.loadGameToRam(ram, arrayBuffer);
      }),
      map(([ram, keyPad, arrayBuffer]) => {
        return arrayBuffer ? new CPU(ram, keyPad) : null;
      }),

      shareReplay(1)
    );

    // start initializing.
    this.cpu$.subscribe(res => {
      if (res != null) {
        this.run(); // can be switched to operators.
      }
    });
  }

  run() {

    // running the cpu.
    combineLatest(this.cpu$, this.speed$)
      .pipe(
        tap(([cpu, speed]) => {
          // console.log(cpu, speed);
          cpu.runCycle();
          if (cpu.drawFlag) {
            cpu.drawFlag = false;
          }
        })
      )
      .subscribe();

      //subscribing to draw..
      this.cpu$.pipe(
        switchMap((cpu) => {
          return cpu.draw$.pipe(tap(graphicArray => this.renderer.drawScreen(graphicArray)));
        })).subscribe();
  }

  loadGame(file: any): boolean {
    let reader = new FileReader();
    reader.onload = e => {
      this.loadGameSubject$.next(reader.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(file);
    return true;
  }

  loadGameToRam(ram: RAM, arrayBuffer: ArrayBuffer) {
    let buffer = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; i++) {
      ram.write(0x200 + i, buffer[i]);
    }
    console.log('loaded');
    this.loadFlag = true;
    //this.run();
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
