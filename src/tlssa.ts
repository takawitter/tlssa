// number, string, boolean, array of those and object that has value types up to this point.
type ItemType = number | string | boolean | ItemType[] | {[key: string]: ItemType};
// map ({name: type, ...}) of items.
type ItemMap = Record<string, ItemType>;
// type to omit undefined.
type RejectOptional<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : T[K];
};
type StringKeyOf<T extends Record<string, ItemType>> = keyof T & string;

export class TypedStorageAdapter<Items extends RejectOptional<Items> & ItemMap>{
    private storage: Storage;
    private keyPrefix?: string;

    constructor(storage: Storage, keyPrefix?: string){
        this.storage = storage;
        this.keyPrefix = keyPrefix;
    }

    getItem<K extends StringKeyOf<Items>>(
        key: K, defaultValue: Items[K] | ((key: K)=>Items[K])): Items[K];
    getItem<K extends StringKeyOf<Items>>(
        key: K): Items[K] | null;
    getItem<K extends StringKeyOf<Items>>(
        key: K, defaultValue?: Items[K] | ((key: K)=>Items[K])): Items[K] | null
    {
        let ret = this.storage.getItem(this.createKey(key));
        if(ret) ret = JSON.parse(ret);
        if(ret !== null) return ret as Items[K];
        if(!defaultValue) return null;
        return typeof defaultValue === 'function' ?
            (defaultValue as (key: K)=>Items[K])(key) : defaultValue;
    }

    getOrCreateItem<K extends StringKeyOf<Items>>(
        key: K,
        initialValue: Items[K] | ((key: K)=>Items[K])): Items[K]
    {
        return this.getItem(key) || this.doSetItem(key, initialValue);
    }

    setItem<K extends StringKeyOf<Items>>(
        key: K, value: Items[K] | ((key: K)=>Items[K])): void
    {
        this.doSetItem(key, value);
    }

    removeItem<K extends StringKeyOf<Items>>(key: K): void{
        this.storage.removeItem(this.createKey(key));
    }

    *keys(): Generator<StringKeyOf<Items>>{
        const prefix = this.keyPrefix;
        if(this.isValidPrefix(prefix)){
            for(const k of this.allNonNullStorageKeys()){
                if(k.startsWith(prefix)){
                    yield(k.substring(prefix.length + 1));
                }
            }
        } else{
            for(const k of this.allNonNullStorageKeys()){
                yield(k);
            }
        }
    }

    length(): number{
        return this.isValidPrefix(this.keyPrefix) ?
            [...this.keys()].length :
            this.storage.length;
    }

    clear(): void{
        const prefix = this.keyPrefix;
        if(!this.isValidPrefix(prefix)){
            this.storage.clear();
            return;
        }
        for(const k of this.allNonNullStorageKeys()){
            if(k.startsWith(prefix)){
                this.storage.removeItem(k);
            }
        }
    }

    private *allNonNullStorageKeys(): Generator<string>{
        let n = this.storage.length;
        for(let i = 0; i < n; i++){
            const k = this.storage.key(i);
            if(k) yield(k);
        }
    }

    private createKey(key: string){
        const p = this.keyPrefix;
        if(p && p.length > 0){
            return `${p}.${key}`;
        }
        return key;
    }

    private isValidPrefix(prefix?: string): prefix is string{
        return typeof prefix !== "undefined" && prefix.length > 0;
    }

    private doSetItem<K extends StringKeyOf<Items>>(
        key: K, value: Items[K] | ((key: K)=>Items[K])): Items[K]
    {
        if(typeof value === 'function'){
            value = (value as ((key: K)=>Items[K]))(key);
        }
        this.storage.setItem(this.createKey(key), JSON.stringify(value));
        return value;
    }
}
