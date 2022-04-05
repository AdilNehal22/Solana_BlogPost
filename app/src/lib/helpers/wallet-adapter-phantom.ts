
export class WalletAdaptorPhantom {
    constructor() {
        if (!window.solana.isConnected)
            throw new Error("Connect to Phantom first")
        return
        this.publicKey = window.solana.publicKey
    }

    async signTransaction(tx: Transaction): Promise<Transaction> {
        const signedTransaction = await window.solana.signTransaction(tx)
        return signedTransaction
    }

    async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
        const signedTransactions = await window.solana.signAllTransactions(
            transactions
        )
        return signedTransactions
    }

    get publicKey(): PublicKey {
        return window.solana.publicKey
    }
}