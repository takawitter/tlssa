type ItemValue = number | string | boolean | object;
type ItemMap = Record<string, ItemValue>;

export class TypedStorageAdapter<Items extends ItemMap>{
    private storage: Storage;
    private keyPrefix?: string;

    constructor(storage: Storage, keyPrefix?: string){
        this.storage = storage;
        this.keyPrefix = keyPrefix;
    }

    getItem<K extends keyof Items>(
        key: K, defaultValue: Items[K] | ((key: K)=>Items[K])): Items[K];
    getItem<K extends keyof Items>(
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

    getOrCreateItem<K extends keyof Items & string>(
        key: K,
        initialValue: Items[K] | ((key: K)=>Items[K])): Items[K]
    getOrCreateItem(
        key: string,
        initialValue: ItemValue | ((key: string)=>ItemValue)): any
    {
        let ret = this.getItem(key);
        if(ret) return ret;
        ret = typeof initialValue === 'function' ? initialValue(key) : initialValue;
        this.storage.setItem(this.createKey(key), JSON.stringify(ret));
        return ret;
    }

    setItem<K extends keyof Items & string>(
        key: K, value: Items[K]): void;
    setItem(key: string, value: ItemValue){
        this.storage.setItem(this.createKey(key), JSON.stringify(value));
    }

    removeItem<K extends keyof Items & string>(key: K){
        this.storage.removeItem(this.createKey(key));
    }

    *keys(){
        const keyValid = this.keyPrefixValid() ?
            (k: string) => k.startsWith(this.keyPrefix!):
            (_: string) => true;
        let n = this.storage.length;
        for(let i = 0; i < n; i++){
            const k = this.storage.key(i);
            if(k && keyValid(k)){
                yield(this.storage.getItem(k));
            }
        }
    }

    length(){
        return this.keyPrefixValid() ?
            [...this.keys()].length :
            this.storage.length;
    }

    clear(){
        if(!this.keyPrefixValid()){
            this.storage.clear();
            return;
        }
        for(const k of [...this.keys()]){
            if(k === null) continue;
            if(k.startsWith(this.keyPrefix!)){
                this.storage.removeItem(k);
            }
        }
    }

    private createKey(key: string){
        const p = this.keyPrefix;
        if(p && p.length > 0){
            return `${p}.${key}`;
        }
        return key;
    }

    private keyPrefixValid(){
        return this.keyPrefix && this.keyPrefix.length > 0;
    }
}
