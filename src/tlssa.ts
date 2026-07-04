type ItemValue = number | string | boolean | ItemValue[] | {[key: string]: ItemValue};
type ItemMap = Record<string, ItemValue>;
type StringKeyOf<T extends Record<string, ItemValue>> = keyof T & string;

export class TypedStorageAdapter<Items extends ItemMap>{
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
    getItem(
        key: string, defaultValue?: ItemValue | ((key: string)=>ItemValue)): ItemValue | null
    {
        let ret = this.storage.getItem(this.createKey(key));
        if(ret) ret = JSON.parse(ret);
        if(ret !== null) return ret;
        if(!defaultValue) return null;
        return typeof defaultValue === 'function' ? defaultValue(key) : defaultValue;
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
        if(!this.isValidPrefix(this.keyPrefix)){
            this.storage.clear();
            return;
        }
        for(const k of this.keys()){
            this.storage.removeItem(k);
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
            value = value(key);
        }
        this.storage.setItem(this.createKey(key), JSON.stringify(value));
        return value;
    }
}
