function now () {
	return performance?.now() ?? Date.now();
}

export class Timer {
	private start_time: number | null = null;
	private elapsed_time: number = 0;
	private loop_id: number | null = null;
	constructor(private tick?: (duration: number) => void) {}
	start() {
		this.start_time = now();
		this.loop();
	}

	pause() {
		if (this.loop_id != null) {
			cancelAnimationFrame(this.loop_id);
			this.loop_id = null;
		}
	}

	reset() {
		this.pause();
		this.start_time = null;
		this.elapsed_time = 0;
	}

	private loop() {
		if (this.start_time !== null) {
			this.elapsed_time = now() - this.start_time;
			this.tick?.(this.elapsed_time);
		}

		this.loop_id = requestAnimationFrame(() => this.loop());
	}

	get duration() {
		return this.elapsed_time;
	}
}
