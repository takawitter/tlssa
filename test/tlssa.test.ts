import { beforeEach, expect, test } from "vitest";
import { TypedStorageAdapter } from "../src/tlssa";

beforeEach(()=>{
    localStorage.clear();
});

function newStorageAdapter(keyPrefix?: string){
    return new TypedStorageAdapter<{
        id: string;
        amount: number;
        valid: boolean;
        profile: {name: string};
        roles: string[];
    }>(localStorage, keyPrefix);
}

// getItem
test("getItem() returns null if no value set.", ()=>{
    const s = newStorageAdapter();
    expect(s.getItem("id")).toBeNull();
});

test("getItem() returns the value set by setItem() - number.", ()=>{
    const s = newStorageAdapter();
    s.setItem("amount", 20);
    expect(s.getItem("amount")).toBe(20);
});

test("getItem() returns the value set by setItem() - string.", ()=>{
    const s = newStorageAdapter();
    s.setItem("id", "000");
    expect(s.getItem("id")).toBe("000");
});

test("getItem() returns the value set by setItem() - boolean.", ()=>{
    const s = newStorageAdapter();
    s.setItem("valid", true);
    expect(s.getItem("valid")).toBe(true);
});

test("getItem() returns the value set by setItem() - object.", ()=>{
    const s = newStorageAdapter();
    s.setItem("profile", {name: "John"});
    expect(s.getItem("profile")).toStrictEqual({name: "John"});
});

test("getItem() returns the value set by setItem() - array.", ()=>{
    const s = newStorageAdapter();
    s.setItem("roles", ["user", "admin"]);
    expect(s.getItem("roles")).toStrictEqual(["user", "admin"]);
});

test("getItem() returns the default value without storing if not set.", ()=>{
    const s = newStorageAdapter();
    expect(s.getItem("id", "001")).toBe("001");
    expect(s.getItem("id")).toBeNull();
});


// setItem
test("setItem() stores value in JSON format.", ()=>{
    const s = newStorageAdapter();
    s.setItem("profile", {name: "John"});
    expect(localStorage.getItem("profile")).toBe("{\"name\":\"John\"}");
});


// getOrCreateItem
test("getOrCreateItem() stores the value spplied as initialValue if not set.", ()=>{
    const s = newStorageAdapter();
    expect(s.getItem("id")).toBeNull();
    expect(s.getOrCreateItem("id", "002")).toBe("002");
    expect(s.getItem("id")).toBe("002");
});


// removeItem
test("removeItem() removes Item.", ()=>{
    const s = newStorageAdapter();
    s.setItem("id", "002");
    expect(s.getItem("id")).toBe("002");
    s.removeItem("id");
    expect(s.getItem("id")).toBeNull();
});


// length
test("length() returns item count stored in storage.", ()=>{
    const s = newStorageAdapter();
    expect(s.length()).toBe(0);
    s.setItem("id", "002");
    expect(s.length()).toBe(1);
    localStorage.setItem("foo", "bar");
    expect(s.length()).toBe(2);
});


// keys
test("keys() return keys of all items in storage.", ()=>{
    const s = newStorageAdapter();
    expect(s.length()).toBe(0);
    s.setItem("id", "002");
    localStorage.setItem("foo", "bar");
    expect([...s.keys()].toSorted()).toStrictEqual(["foo", "id"]);
});


// clear
test("clear() clears all items in storage.", ()=>{
    const s = newStorageAdapter();
    expect(s.length()).toBe(0);
    s.setItem("id", "002");
    localStorage.setItem("foo", "bar");
    expect(s.length()).toBe(2);
    s.clear();
    expect(s.length()).toBe(0);
});


// prefix
test("[prefix] getItem() load item with given prefix.", ()=>{
    const s = newStorageAdapter("prefix");
    localStorage.setItem("prefix.id", "\"000\"");
    expect(s.getItem("id")).toBe("000");
});

test("[prefix] setItem() stores item with given prefix.", ()=>{
    const s = newStorageAdapter("prefix");
    s.setItem("id", "000");
    expect(localStorage.getItem("prefix.id")).toBe("\"000\"");
});

test("[prefix] removeItem() removes item with given prefix and key.", ()=>{
    const s = newStorageAdapter("prefix");
    s.setItem("id", "000");
    s.removeItem("id");
    expect(localStorage.length).toBe(0);
});

test("[prefix] length() only count items that has valid prefix.", ()=>{
    const s = newStorageAdapter("prefix");
    s.setItem("id", "000");
    localStorage.setItem("name", "John");
    expect(s.length()).toBe(1);
});

test("[prefix] keys() only returns keys that has valid prefix.", ()=>{
    const s = newStorageAdapter("prefix");
    s.setItem("id", "000");
    localStorage.setItem("name", "John");
    expect([...s.keys()]).toStrictEqual(["id"]);
    expect([...(function*(){
        for(let i = 0; i < localStorage.length; i++){
            yield(localStorage.key(i))
        }
    })()].toSorted()).toStrictEqual(["name", "prefix.id"]);
});

test("[prefix] clear() only clears items that has valid key with prefix.", ()=>{
    const s = newStorageAdapter("prefix");
    s.setItem("id", "000");
    localStorage.setItem("name", "John");
    s.clear();
    expect(s.length()).toBe(0);
    expect(localStorage.length).toBe(1);
    expect(localStorage.getItem("name")).toBe("John");
});
