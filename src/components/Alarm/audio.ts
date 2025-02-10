
export class AudioPlayer {
	constructor(
		private element: HTMLAudioElement,
		private audio_source: string = ""
	) {}

	/**
	 * 设置音频源
	 * @param audio_source 音频源
	 */
	setAudioSource(audio_source: string) {
		this.audio_source = audio_source;

		this.element.src = this.audio_source;
	}

	play(): void {
		this.element.autoplay = true;
		this.element.loop = true;
		this.element.muted = false;
		this.element.playbackRate = 1;

		if (!this.audio_source) {
			throw new Error("audio source is empty");
		}

		this.element.src = this.audio_source;
		this.element.play();
	}

	pause(): void {
		this.element.pause();
	}

	mute(): void {
		this.element.muted = true;
	}

	dispose(): void {
		this.element.pause();
		this.element.src = "";
	}
}
