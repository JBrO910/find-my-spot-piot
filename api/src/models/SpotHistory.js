export default class SpotHistory {
    #id
    #spot
    #status
    #from
    #until

    get id() {
        return this.#id;
    }

    get spot() {
        return this.#spot;
    }

    set spot(value) {
        this.#spot = value;
    }

    get status() {
        return this.#status;
    }

    set status(value) {
        this.#status = value;
    }

    get from() {
        return this.#from;
    }

    set from(value) {
        this.#from = value;
    }

    get until() {
        return this.#until;
    }

    set until(value) {
        this.#until = value;
    }

    get serialised() {
        return {
            spot: this.spot,
            status: this.status,
            from: this.from,
            until: this.until,
        }
    }
}
