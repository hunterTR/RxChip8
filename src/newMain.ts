import { fromEvent, merge, Observable } from 'rxjs';
import { map, tap, scan, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { CPU } from './cpu';
import { RAM } from './ram';
import { KeyPad } from './keypad';
import { readFile } from './utils/observableReader';

export class NewMain {
  // initialState is a brand new CPU
  initialState: CPU = new CPU(new RAM(), new KeyPad());
  keyPad: Uint8Array;

  //EVENTS  //throws bunch of side effects to update our state.
  private keyUp$: Observable<any> = fromEvent(document, 'keyup');
  private keyDown$: Observable<any> = fromEvent(document, 'keydown');
  keyPress$: Observable<Uint8Array> = merge(this.keyUp$, this.keyDown$).pipe(
    scan((acc, [keyUp, keyDown]) => (this.keyDownEventHandler(acc, keyDown), this.keyUpEventHandler(acc, keyUp)), new Uint8Array(16)),
    distinctUntilChanged(),
    tap(() => {
      //side effect
    })
  );

  loadGameEvent$ = fromEvent(document.getElementById('files'), 'change').pipe(
    switchMap(e =>
      readFile((<any>e.target).files[0]).pipe(
        tap(res => {
          let buffer = new Uint8Array(res as ArrayBuffer);
          const newState = new CPU(new RAM(), new KeyPad());
          for (let i = 0; i < buffer.length; i++) {
            newState.ram.write(0x200 + i, buffer[i]);
          }
          // .next the newState // side effect
        })
      )
    )
  );

  keyDownEventHandler(keyPad, event) {
    if (event) {
      const keyName = event.key;
      if (keyName === '1') {
        keyPad[0] = 1;
      }
      if (keyName === '2') {
        keyPad[1] = 1;
      }
      if (keyName === '3') {
        keyPad[2] = 1;
      }
      if (keyName === '4') {
        keyPad[3] = 1;
      }
      if (keyName === 'q') {
        keyPad[4] = 1;
      }
      if (keyName === 'w') {
        keyPad[5] = 1;
      }
      if (keyName === 'e') {
        keyPad[6] = 1;
      }
      if (keyName === 'r') {
        keyPad[7] = 1;
      }
      if (keyName === 'a') {
        keyPad[8] = 1;
      }
      if (keyName === 's') {
        keyPad[9] = 1;
      }
      if (keyName === 'd') {
        keyPad[10] = 1;
      }
      if (keyName === 'f') {
        keyPad[11] = 1;
      }
      if (keyName === 'z') {
        keyPad[12] = 1;
      }
      if (keyName === 'x') {
        keyPad[13] = 1;
      }
      if (keyName === 'c') {
        keyPad[14] = 1;
      }
      if (keyName === 'v') {
        keyPad[15] = 1;
      }
      console.log(keyName);
    }
    return keyPad;
  }

  keyUpEventHandler(keyPad, event) {
    if (event) {
      const keyName = event.key;
      if (keyName === '1') {
        keyPad[0] = 0;
      }
      if (keyName === '2') {
        keyPad[1] = 0;
      }
      if (keyName === '3') {
        keyPad[2] = 0;
      }
      if (keyName === '4') {
        keyPad[3] = 0;
      }
      if (keyName === 'q') {
        keyPad[4] = 0;
      }
      if (keyName === 'w') {
        keyPad[5] = 0;
      }
      if (keyName === 'e') {
        keyPad[6] = 0;
      }
      if (keyName === 'r') {
        keyPad[7] = 0;
      }
      if (keyName === 'a') {
        keyPad[8] = 0;
      }
      if (keyName === 's') {
        keyPad[9] = 0;
      }
      if (keyName === 'd') {
        keyPad[10] = 0;
      }
      if (keyName === 'f') {
        keyPad[11] = 0;
      }
      if (keyName === 'z') {
        keyPad[12] = 0;
      }
      if (keyName === 'x') {
        keyPad[13] = 0;
      }
      if (keyName === 'c') {
        keyPad[14] = 0;
      }
      if (keyName === 'v') {
        keyPad[15] = 0;
      }
      console.log(keyName);
    }
    return keyPad;
  }
}
