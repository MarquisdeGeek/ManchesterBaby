const codeFactor = require('./factor.js');

// The CPU state had just one register, alongside the program counter (PC)
let baby = {
    pc: 0,
    acc: 0,
    opCount: 0,
    mem: new Array(32)  // memory was 32 words, each word had 32 bits
};

// The code is an array of binary strings
function populate(state, code) {
    let idx = 0;
    code.forEach((v) => {
        // The Baby stored it's LSB first, so we reverse the order because convertig
        let rev = v.split('').reverse().join('');
        state.mem[idx] = parseInt(rev, 2);

        if (state.mem[idx] > 0x7fffffff) {
            state.mem[idx] = -0x80000000 + (state.mem[idx] & 0x7fffffff)
        }

        // If you want to see the memory, uncomment this
        // console.log(`/* ${idx} ${v} */ ${state.mem[idx]}, `);
        ++idx;
    });
}

function run(state, code) {
    let ended = false;
    do {
        ended = step(state, code);
    } while(!ended);
}

function step(state) {
    let ended = false;

    // Increment first!?!? This is usual, nowadays
    ++state.pc;
    ++state.opCount;

    // Fetch the instruction
    let fetch = state.mem[state.pc];

    // Decode it
    let instr = (fetch & 0x0000e000) >> 13;
    let oper  = (fetch & 0x0000001f); // usually the address - which in our case is 0-31
    let mem = (state.mem[oper] & 0xffffffff)<<0; // the data from the memory. The <<0 trick ensures it's 32-bit signed
    // This is an alternative
    /*
    let mem = state.mem[oper];
    if (mem >= 0x80000000) {
        mem = -0x80000000 + (mem & 0x7fffffff);
    }
    //*/
    
    // Execute
    switch(instr) {
        case 0: // JMP S
        state.pc = mem;
        break;

        case 1: // JRP S
        state.pc += mem;
        break;

        case 2: // LDN S
        state.acc = -mem;
        break;

        case 3: // STO S
        state.mem[oper] = state.acc;
        break;

        case 4: // SUB s
        case 5: // SUB s
        state.acc -= mem;
        break;

        case 6: // CMP
        if (state.acc < 0) {
            ++state.pc;
            ++state.opCount;  //??? I don't know if the designers considered this jump an extra operation
        }
        break;

        case 7: // STP
        ended = true;
        break;

    }

    // Q. is PC goes out of range - do what?

    return ended;
}

populate(baby, codeFactor);

run(baby, codeFactor);

// Find the highest proper factor of 2^18 (262,144) 
// The Baby took 3.5 million operations and 52 minutes to produce the answer (131,072)
console.log(`Answer = ${baby.mem[27]}`);
console.log(`opCount = ${baby.opCount}`);
