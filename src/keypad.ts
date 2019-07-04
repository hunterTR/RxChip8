import { fromEvent, merge, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

export class KeyPad {
  private keyUp$ = fromEvent(document, 'keyup').pipe(tap( (event) => this.keyUpEventHandler(event)));
  private keyDown$ = fromEvent(document, 'keydown').pipe(tap((event) => this.keyDownEventHandler(event)));
  keyEvents$: Observable<Uint8Array>;
  keyPad: Uint8Array;

  constructor() {
    // initialize KeyPad
    this.keyPad = new Uint8Array(16);
    this.keyEvents$ = merge(this.keyUp$, this.keyDown$).pipe(
      map(event => {
        return this.keyPad;
      })
    );

    this.keyEvents$.subscribe();
  }
  keyDownEventHandler(event) {
    const keyName = event.key;
    if (keyName === '1') {
      this.keyPad[0] = 1;
    }
    if (keyName === '2') {
      this.keyPad[1] = 1;
    }
    if (keyName === '3') {
      this.keyPad[2] = 1;
    }
    if (keyName === '4') {
      this.keyPad[3] = 1;
    }
    if (keyName === 'q') {
      this.keyPad[4] = 1;
    }
    if (keyName === 'w') {
      this.keyPad[5] = 1;
    }
    if (keyName === 'e') {
      this.keyPad[6] = 1;
    }
    if (keyName === 'r') {
      this.keyPad[7] = 1;
    }
    if (keyName === 'a') {
      this.keyPad[8] = 1;
    }
    if (keyName === 's') {
      this.keyPad[9] = 1;
    }
    if (keyName === 'd') {
      this.keyPad[10] = 1;
    }
    if (keyName === 'f') {
      this.keyPad[11] = 1;
    }
    if (keyName === 'z') {
      this.keyPad[12] = 1;
    }
    if (keyName === 'x') {
      this.keyPad[13] = 1;
    }
    if (keyName === 'c') {
      this.keyPad[14] = 1;
    }
    if (keyName === 'v') {
      this.keyPad[15] = 1;
    }
    console.log(keyName);
  }

  keyUpEventHandler(event) {
    const keyName = event.key;
    if (keyName === '1') {
      this.keyPad[0] = 0;
    }
    if (keyName === '2') {
      this.keyPad[1] = 0;
    }
    if (keyName === '3') {
      this.keyPad[2] = 0;
    }
    if (keyName === '4') {
      this.keyPad[3] = 0;
    }
    if (keyName === 'q') {
      this.keyPad[4] = 0;
    }
    if (keyName === 'w') {
      this.keyPad[5] = 0;
    }
    if (keyName === 'e') {
      this.keyPad[6] = 0;
    }
    if (keyName === 'r') {
      this.keyPad[7] = 0;
    }
    if (keyName === 'a') {
      this.keyPad[8] = 0;
    }
    if (keyName === 's') {
      this.keyPad[9] = 0;
    }
    if (keyName === 'd') {
      this.keyPad[10] = 0;
    }
    if (keyName === 'f') {
      this.keyPad[11] = 0;
    }
    if (keyName === 'z') {
      this.keyPad[12] = 0;
    }
    if (keyName === 'x') {
      this.keyPad[13] = 0;
    }
    if (keyName === 'c') {
      this.keyPad[14] = 0;
    }
    if (keyName === 'v') {
      this.keyPad[15] = 0;
    }
    console.log(keyName);
  }
}
