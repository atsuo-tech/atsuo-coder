import Cache from "@/lib/cache";

export default class Value<T, ID> {

	private id: ID;

	private value: Cache<T>;

	private setter: (value: T, id: ID) => Promise<void>;

	constructor(id: ID, defaultValue: T, interval: number, getter: (id: ID) => Promise<T>, setter: (value: T, id: ID) => Promise<void>) {

		this.value = new Cache<T>(async () => {

			return await getter(id);

		}, interval);

		this.id = id;
		this.setter = setter;

		this.value.set(defaultValue);

	}

	public async fetch() {

		return await this.value.fetch();

	}

	public async update() {

		return await this.value.update();

	}

	public async get() {

		return await this.value.get();

	}

	public async set(value: T) {

		await this.setter(value, this.id);

		this.value.set(value);

		return value;

	}

};