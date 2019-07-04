
export class RAM {
    private memory: Uint8Array;
    memoryOverflow: boolean;
    constructor() {
        this.memory = new Uint8Array(0x1000);
        this.memoryOverflow = false;
    }
    read(addr: number): number{
        if(addr > 0xFFF)
        {
            console.log('memory overflow. (read)')
         //   this.memoryOverflow =true;
            return 0;
        }
        return this.memory[addr];
    }
    write(addr: number,x: number){
        if(addr > 0xFFF)
        {
            console.log('memory overflow. (write)')
        }
        else
        {
     //       this.memoryOverflow =true;
            this.memory[addr] = x & 0xff;
        }
    }
}