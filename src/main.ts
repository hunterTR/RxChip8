import { fromEvent, merge, Observable, interval, BehaviorSubject, timer, NEVER } from 'rxjs';
import { map, tap, scan, switchMap, distinctUntilChanged, withLatestFrom, shareReplay, takeWhile } from 'rxjs/operators';
import { CPU } from './cpu';
import { RAM } from './ram';
import { KeyPad } from './keypad';
import { readFile } from './utils/observableReader';
import { Renderer } from './renderer';

export class Main {
  private stateSubject$: BehaviorSubject<Partial<CPU>> = new BehaviorSubject<Partial<CPU>>(null);
  private renderer = new Renderer();
  // initialState is a brand new CPU
  initialState: CPU = new CPU(new RAM(), new KeyPad());
  keyPad: Uint8Array;

  //STATE - CPU
  state$ = this.stateSubject$.asObservable().pipe(
    scan((state, value) => value ? Object.assign(state, value) : state, this.initialState)
  );

  ticker$ = this.state$.pipe(
    switchMap(state => !state.isPaused ? timer(state.clockSpeed) : NEVER)
  );

  // RUNNING - TICKING
  run$ = this.ticker$.pipe(
    withLatestFrom(this.state$),
    tap(([, state]) => {
        state.runCycle();
      this.stateSubject$.next(state);
    }),
    takeWhile(([, state]) => !state.ram.memoryOverflow && state.isRunning),
    map(([, state]) => state.graphicArray),
    distinctUntilChanged((x, y) => {
      //written a compare.
      for (let i = 0; i < x.length; i++) {
        for (let j = 0; j < x[i].length; j++) {
          if (x[i][j] !== y[i][j]) {
            return true;
          }
        }
      }
      return false;
    }),
    tap(graphicArray => this.renderer.drawScreen(graphicArray))
  );

  //EVENTS  //throws bunch of side effects to update our state.
  private keyUp$: Observable<any> = fromEvent(document, 'keyup');
  private keyDown$: Observable<any> = fromEvent(document, 'keydown');
  keyPress$: Observable<Uint8Array> = merge(this.keyUp$, this.keyDown$).pipe(
    scan((acc, x) => this.keyPressEventHandler(acc, x), new Uint8Array(16)),
    distinctUntilChanged(),
    tap(keyPad => {
      //side effect
      console.log(keyPad);
      this.stateSubject$.next({ keyPad });
    })
  );

  loadGameEvent$ = fromEvent(document.getElementById('files'), 'change').pipe(
    switchMap(e =>
      readFile((<any>e.target).files[0]).pipe(
        tap(res => {
          let buffer = new Uint8Array(res as ArrayBuffer);
          const newState = new CPU(new RAM(), new KeyPad());
          //writing fontset to ram.
          for (let i = 0; i < fontset.length; i++) {
            newState.ram.write(i, fontset[i]);
          }
          //writing game data to ram.
          for (let i = 0; i < buffer.length; i++) {
            newState.ram.write(0x200 + i, buffer[i]);
          }

          console.log(newState);
          this.stateSubject$.next(newState);
        })
      )
    )
  );

  startClickEvent$ = fromEvent(document.getElementById('startButton'), 'click').pipe(switchMap(() => test.run$));
  stopClickEvent$ = fromEvent(document.getElementById('stopButton'), 'click').pipe(
    tap(() => {
      this.stateSubject$.next({ isRunning: false });
    })
  );
  pauseClickEvent$ = fromEvent(document.getElementById('pauseButton'), 'click').pipe(
    withLatestFrom(this.state$),
    tap(([,state]) => {
      this.stateSubject$.next({ isPaused: !state.isPaused });
    })
  );

  events$ = merge(this.loadGameEvent$, this.keyPress$, this.startClickEvent$, this.stopClickEvent$,this.pauseClickEvent$);

  keyPressEventHandler(keyPadParam: Uint8Array, event: KeyboardEvent) {
    const keyPad = [...keyPadParam];
    if (event) {
      const keyName = event.key;
      const key = event.type === 'keyup' ? 0 : 1;
      if (keyName === '1') {
        keyPad[0] = key;
      }
      if (keyName === '2') {
        keyPad[1] = key;
      }
      if (keyName === '3') {
        keyPad[2] = key;
      }
      if (keyName === '4') {
        keyPad[3] = key;
      }
      if (keyName === 'q') {
        keyPad[4] = key;
      }
      if (keyName === 'w') {
        keyPad[5] = key;
      }
      if (keyName === 'e') {
        keyPad[6] = key;
      }
      if (keyName === 'r') {
        keyPad[7] = key;
      }
      if (keyName === 'a') {
        keyPad[8] = key;
      }
      if (keyName === 's') {
        keyPad[9] = key;
      }
      if (keyName === 'd') {
        keyPad[10] = key;
      }
      if (keyName === 'f') {
        keyPad[11] = key;
      }
      if (keyName === 'z') {
        keyPad[12] = key;
      }
      if (keyName === 'x') {
        keyPad[13] = key;
      }
      if (keyName === 'c') {
        keyPad[14] = key;
      }
      if (keyName === 'v') {
        keyPad[15] = key;
      }
      //  console.log(keyName);
    }
    return keyPad;
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

const test = new Main();

test.events$.subscribe();

