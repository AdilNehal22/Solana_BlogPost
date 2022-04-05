/**
 * we need to build some handlers to call the remote procedure calls (RPCs).
    Let's take a look at the initialize() function, now from the client side.
 */
import * as anchor from '@project-serum/anchor';
const { SystemProgram } = anchor.web3; // Added to initialize account
import idl from "../../../target/idl/solblog.json";
import solblog_keypair from "../../../target/deploy/solblog-keypair.json";

const opts = {
	preflightCommitment: 'recent',
	commitment: 'recent'
};

const getDevPgmId = () =>{
    // get the program ID from the solblog-keyfile.json
    let pgmKeypair = anchor.web3.Keypair.fromSecretKey(
        new Uint8Array(solblog_keypair)
    );
    return new anchor.web3.PublicKey(pgmKeypair.publicKey) // Address of the deployed program
}

export default class AnchorClient {
    constructor({ programId, config, keypair } = {}) {
        this.programId = programId || getDevPgmId();
        this.config = config || solConfigFile.development.config;
        this.connection = new anchor.web3.Connection(this.config.httpUri, 'confirmed');
        console.log('\n\nConnected to', this.config.httpUri);
        const wallet = window.solana.isConnected && window.solana?.isPhantom ? new WalletAdaptorPhantom() : keypair ? new anchor.Wallet(keypair) : new anchor.Wallet(anchor.web3.Keypair.generate());
        // maps anchor calls to Phantom direction
        this.provider = new anchor.Provider(this.connection, wallet, opts);
        this.program = new anchor.Program(idl, this.programId, this.provider);
    }

    async initialize() {
        // generate an address (PublciKey) for this new account
        let blogAccount = anchor.web3.Keypair.generate();
        const tx = await this.program.rpc.initialize({
            accounts: {
                blogAccount: blogAccount.publicKey, // publickey for our new account
                authority: this.provider.wallet.publicKey, // publickey of our anchor wallet provider
                systemProgram: SystemProgram.programId // just for Anchor reference
            },
            signers: [blogAccount] // blogAccount must sign this Tx, to prove we have the private key too
        });
        console.log(
            `Successfully intialized Blog ID: ${blogAccount.publicKey} for Blogger ${this.provider.wallet.publicKey}`
        );
        return blogAccount;
    }

    async makePost(post, blogAccountStr) {
        // convert our string to PublicKey type
        let blogAccount = new anchor.web3.PublicKey(blogAccountStr);
        const utf8encoded = Buffer.from(post);
        const tx = await this.program.rpc.makePost(
            // input must be compatible with UTF8 Vector in rust
            utf8encoded,
            // now pass the accounts in
            {
                accounts: {
                    blogAccount: blogAccount, // needs to be the same publicKey as init, or it won't work
                    authority: this.program.provider.wallet.publicKey // needs to be the same publicKey as init, or it won't work
                },
                signers: [this.program.provider.wallet.payer] // needs to be the same keyPAIR as init, or it won't work
            }
        );
        console.log(
            `Successfully posted ${post} to https://explorer.solana.com/address/${blogAccount}?cluster=devnet`
        );
        return tx;
    }
}

connection = new anchor.web3.Connection(
    "https://api.devnet.solana.com",
    "confirmed"
)

new anchor.Provider(connection, wallet, opts)


/**
 * In order to start up anchor.program, we need three things:
    IDL
    ProgramID, and
    Wallet Provider
    Our IDL (json file) is saved alongside our rust program at:
    |
    ├── target
    |   └── idl
    |      └── solblog.json


 */