import {secp256k1} from "@noble/curves/secp256k1";
import {LocalStorage} from "./storage/local-storage";
import {StorageKeys} from "./storage/storage-keys";
import {SigningKey} from "@ethersproject/signing-key";
import {arrayify, Bytes, BytesLike, joinSignature} from "@ethersproject/bytes";
import {computeAddress} from "@ethersproject/transactions";
import {hashMessage} from "@ethersproject/hash";

export class TempKey extends SigningKey {
    private static readonly storage = new LocalStorage();

    /**
     * Initialize TempKey based on the private key, if it is provided or generate a brand new TempKey.
     * @param privateKey Optional parameter to initialize private key from
     */
    public constructor(privateKey: BytesLike = secp256k1.utils.randomPrivateKey()) {
        super(privateKey);
    }

    /**
     * Sign the message with the private key
     * @param message Message to sign
     */
    public sign(message: Bytes | string): string {
        return joinSignature(this.signDigest(hashMessage(arrayify(message))));
    }

    /**
     * Save to the storage initialized as a static property of the TempKey class
     */
    public save(): void {
        TempKey.storage.save(StorageKeys.SESSION_KEY, this.privateKey);
    }

    /**
     * Remove the TempKey from the storage
     */
    public remove(): void {
        TempKey.storage.remove(StorageKeys.SESSION_KEY);
    }

    /**
     * Load private key from the storage and generate TempKey based on it.
     */
    public static load(): TempKey | null {
        const privateKey = TempKey.storage.get(StorageKeys.SESSION_KEY);
        return privateKey ? new TempKey(arrayify(privateKey)) : null;
    }

    /**
     * Return the address for the TempKey
     */
    public get address(): string {
        return computeAddress(this.privateKey);
    }
}
