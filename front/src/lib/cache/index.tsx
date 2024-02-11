export default class Cache<T> {

	private cache: T | null = null;

	private lastUpdate: number = 0;

	private updateInterval: number;

	private updateFunction: () => Promise<T>;

	constructor(updateFunction: () => Promise<T>, updateInterval: number) {

		this.updateFunction = updateFunction;

		this.updateInterval = updateInterval;

	}

	public async get() {

		if (Date.now() - this.lastUpdate > this.updateInterval || this.cache == null) {

			this.cache = await this.updateFunction();

			this.lastUpdate = Date.now();

		}

		return this.cache;

	}

	public async set(value: T) {

		this.cache = value;

	}

	public async update() {

		this.cache = await this.updateFunction();

		this.lastUpdate = Date.now();

	}

	public async fetch() {

		await this.update();

		return this.cache;

	}

	public async clear() {

		this.cache = null;

	}

	public async setInternal(value: number) {

		this.updateInterval = value;

	}

	public async getInternal() {

		return this.updateInterval;

	}

	public async setUpdateFunction(func: () => Promise<T>) {

		this.updateFunction = func;

	}

	public async getUpdateFunction() {

		return this.updateFunction;

	}

};