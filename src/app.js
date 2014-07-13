class App {
    constructor(name) {
        this.name = name;
    }

    greeting() {
        return `Hello ${this.name}`;
    }
}

module.exports = App