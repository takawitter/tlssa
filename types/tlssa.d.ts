type ItemType = number | string | boolean | ItemType[] | {
    [key: string]: ItemType;
};
type ItemMap = Record<string, ItemType>;
type StringKeyOf<T extends Record<string, ItemType>> = keyof T & string;
type RejectOptional<T> = {
    [K in keyof T]-?: undefined extends T[K] ? never : T[K];
};
export declare class TypedStorageAdapter<Items extends RejectOptional<Items> & ItemMap> {
    private storage;
    private keyPrefix?;
    constructor(storage: Storage, keyPrefix?: string);
    getItem<K extends StringKeyOf<Items>>(key: K, defaultValue: Items[K] | ((key: K) => Items[K])): Items[K];
    getItem<K extends StringKeyOf<Items>>(key: K): Items[K] | null;
    getOrCreateItem<K extends StringKeyOf<Items>>(key: K, initialValue: Items[K] | ((key: K) => Items[K])): Items[K];
    setItem<K extends StringKeyOf<Items>>(key: K, value: Items[K] | ((key: K) => Items[K])): void;
    removeItem<K extends StringKeyOf<Items>>(key: K): void;
    keys(): Generator<StringKeyOf<Items>>;
    length(): number;
    clear(): void;
    private allNonNullStorageKeys;
    private createKey;
    private isValidPrefix;
    private doSetItem;
}
export {};
//# sourceMappingURL=tlssa.d.ts.map