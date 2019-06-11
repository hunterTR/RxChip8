
export class RAM {
    private memory: Uint8Array;
    constructor() {
        this.memory = new Uint8Array(0x1000);
    }
    read(addr: number): number{
        if(addr > 0xFFF)
        {
            console.log('memory overflow. (read)')
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
            this.memory[addr] = x & 0xff;
        }
    }
}