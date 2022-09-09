let provider: SoundProvider | null = null;

export function getSoundProvider(): SoundProvider {
  if (!provider) {
    provider = new SoundProvider();
  }
  return provider;
}

export class SoundProvider {
  public clickAudioElement: undefined | HTMLAudioElement;
  public prizeAudioELement: undefined | HTMLAudioElement;
  public clickSrc: string = "/wheel_click.wav";
  public prizeSrc: string = "/tada-fanfare-a-6313.mp3";
  constructor() {}

  async playClick() {
    let audioEle = this.clickAudioElement;
    if (!audioEle) {
      audioEle = await this.loadClickAudioELement();
    }
    audioEle.muted = false;
    audioEle.currentTime = 0;
    audioEle.play();
  }

  async playPrize() {
    let audioEle = this.prizeAudioELement;
    if (!audioEle) {
      audioEle = await this.loadPrizeAudioElement();
    }
    audioEle.muted = false;
    audioEle.currentTime = 0;
    audioEle.play();
  }

  async loadPrizeAudioElement(): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const soundEffect = new Audio();
      const doneLoading = () => {
        soundEffect.removeEventListener("canplay", doneLoading);
        soundEffect.removeEventListener("canplaythrough", doneLoading);
        resolve(soundEffect);
      };
      const handleError = () => {
        console.error("an error occurred while loading initial audio file");
        reject();
      };
      soundEffect.autoplay = true;
      soundEffect.loop = false;
      soundEffect.muted = true;
      soundEffect.addEventListener("canplay", doneLoading);
      soundEffect.addEventListener("canplaythrough", doneLoading);
      soundEffect.addEventListener("error", handleError);
      soundEffect.src = this.prizeSrc;
    });
  }
  async loadClickAudioELement(): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const soundEffect = new Audio();
      const doneLoading = () => {
        soundEffect.removeEventListener("canplay", doneLoading);
        soundEffect.removeEventListener("canplaythrough", doneLoading);
        resolve(soundEffect);
      };
      const handleError = () => {
        console.error("an error occurred while loading initial audio file");
        reject();
      };
      soundEffect.autoplay = true;
      soundEffect.loop = false;
      soundEffect.muted = true;
      soundEffect.addEventListener("canplay", doneLoading);
      soundEffect.addEventListener("canplaythrough", doneLoading);
      soundEffect.addEventListener("error", handleError);
      soundEffect.src = this.clickSrc;
      // soundEffect.src =
      //   "data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
    });
  }
}
