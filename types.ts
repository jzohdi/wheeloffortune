export type AllElementsMap = { [id: string]: ModalElement };
export type EleTextPosition = "top" | "center";
export type WheelConfig = {
  eleWidth: number;
  eleLeft: number;
};

export type ModalElement = {
  id: string;
  text: string;
  secondaryText?: string;
  background: string;
  active: boolean;
  order: number;
};

export type ModalData = {
  elements: AllElementsMap;
};

export type WheelSpinConfig = {
  minTurns: number;
  maxTurns: number;
  spinSpeed: number;
};
