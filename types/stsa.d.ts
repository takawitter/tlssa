type ItemValue = number | string | boolean | object;
type ItemMap = Record<string, ItemValue>;
export declare class TypedStorageAdapter<Items extends ItemMap> {
    private storage;
    private keyPrefix?;
    constructor(storage: Storage, keyPrefix?: string);
    getItem<K extends keyof Items>(key: K, defaultValue: Items[K] | ((key: K) => Items[K])): Items[K];
    getItem<K extends keyof Items>(key: K): Items[K] | null;
    getOrCreateItem<K extends keyof Items & string>(key: K, initialValue: Items[K] | ((key: K) => Items[K])): Items[K];
    setItem<K extends keyof Items & string>(key: K, value: Items[K]): void;
    removeItem<K extends keyof Items & string>(key: K): void;
    keys(): Generator<string | null, void, unknown>;
    length(): number;
    clear(): void;
    private createKey;
    private keyPrefixValid;
}
export {};
//# sourceMappingURL=stsa.d.ts.map