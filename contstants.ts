import { EleTextPosition } from "./types";

export const COLORS = {
  WGG_GREEN: {
    light: "#88997A",
    md: "#5C7b6C",
    dark: "#445136",
  },
  WGG_BLUE: {
    light: "#bcc8d0",
  },
  WGG_RED: {
    md: "#9b4b15",
  },
  WGG_BROWN: {
    light: "#D1C0B6",
    md: "#915324",
  },
};
export const DEFAULT_FONT_SIZE = 16;
export const DEFAULT_MIN_TURNS = 5;
export const DEFAULT_MAX_TURNS = 10;
export const DEFAULT_PADDING_TOP = 12;
export const DEFAULT_ELE_ROTATION = 0;
export const DEFAULT_ELE_TEXT_POSITION: EleTextPosition = "top";
export const DEFAULT_WHEEL_BORDER_COLOR = COLORS.WGG_BLUE.light;
export const DEFAULT_WHEEL_BORDER_WIDTH = 15;
export const DEFAULT_WHEEL_ARROW_COLOR = COLORS.WGG_GREEN.dark;
export const DEFAFULT_MODAL_TITLE = "Congratz!";
export const DEFAULT_MODAL_SECONDARY = "You won:";
export const DEFAULT_MODAL_BUTTON_TEXT = "Play Again";
