const { Keypair } = require("@solana/web3.js");
const { Connection, LAMPORTS_PER_SOL } =  require("@solana/web3.js");
const path = require('path');
const fs = require('fs');

//import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js"

async function main(){
    const SLASH = path.sep;

    let programAuthorityKeypair = new Keypair();
    this.connection = new Connection("https://api.devnet.solana.com", "confirmed");

    const signature = await this.connection.requestAirdrop(programAuthorityKeypair.publicKey, LAMPORTS_PER_SOL * 5);

    await this.connection.confirmTransaction(signature);

    const programAuthorityKeyfileName = `target/deploy/programauthority-keypair.json`
    const programAuthorityKeypairFile = path.resolve(
        `${__dirname}${SLASH}${programAuthorityKeyfileName}`
    );

    fs.writeFileSync(
        programAuthorityKeypairFile,
        `[${Buffer.from(programAuthorityKeypair.secretKey.toString())}]`
    );

    const programKeyfileName = `target/deploy/solblog-keypair.json`
    const programKeypairFile = path.resolve(
        `${__dirname}${SLASH}${programKeyfileName}`
    );

    let programKeypair = readKeyfile(programKeypairFile);

    let programId = programKeypair.publicKey.toString();

    //////////////////////////////////configurations//////////////////////////////////

    let method = ["deploy"] // we are deploying for the first time, using 'deploy'

    spawn.sync(
        "anchor",
        [
            ...method, // we use a variable so we when we want to upgrade, we can use 'upgrade' instead
            "--provider.cluster", // we want to specify the node cluster
            "Devnet", // the node cluster as the Devnet
            "--provider.wallet", // we need to pass in a keyfile to pay for the deployment
            `${programAuthorityKeypairFile}`, // this is the keypair file we created just a moment ago
        ],
        { stdio: "inherit" }
    )

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});

function readKeyfile(keypairfile) {
    let kf = fs.readFileSync(keypairfile)
    let parsed = JSON.parse(kf.toString()) // [1,1,2,2,3,4]
    kf = new Uint8Array(parsed)
    const keypair = Keypair.fromSecretKey(kf)
    return keypair
}

//incase of upgrading program

// method = [
//     "upgrade", // we use upgrade to modify the program
//     "target/deploy/solblog.so", // specify where the built code is from 'anchor build'
//     "--program-id", // specify the programId
//     programId,
// ]

// spawn.sync(
//         "anchor",
//         [
//             ...method, // use spread operator to expand our array into individual elements
//             "--provider.cluster", // we want to specify the node cluster
//         "Devnet", // the node cluster as the Devnet
//         "--provider.wallet", // we need to pass in a keyfile to pay for the deployment
//         `${programAuthorityKeypairFile}`, // this is the keypair file we created just a moment ago
//     ],
//     { stdio: "inherit" }
// );
