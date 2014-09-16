/// <reference path="../../typings/tsd.d.ts" />

export = App

class App {
    constructor(public name: string) {}

    greeting() {
        return "Hello " + this.name;
    }
}