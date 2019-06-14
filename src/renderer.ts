const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 320;
const pixelScale = 10;
export class Renderer {
  public screen: HTMLCanvasElement;
  public canvasContext: CanvasRenderingContext2D;
  constructor() {
    this.screen = <HTMLCanvasElement>document.getElementById('screen');
    this.canvasContext = this.screen.getContext('2d');
    this.canvasContext.fillStyle = 'black';
    this.canvasContext.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  }

  drawScreen(graphicArray: any[][]) {
  console.log(graphicArray);
    // reset canvas
    this.canvasContext.fillStyle = 'black';
    this.canvasContext.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    // draw
    for (let h = 0; h < 32; h++) {
      for (let w = 0; w < 64; w++) {
        if (graphicArray[h][w] === 1) {
          this.drawPixel(w, h);
        }
      }
    }
  }
  drawPixel(x: number, y: number) {
    this.canvasContext.fillStyle = 'white';
    this.canvasContext.fillRect(x * pixelScale, y * pixelScale, 10, 10);
  }
}
