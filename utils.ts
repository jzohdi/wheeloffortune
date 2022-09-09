import { CSSProperties } from "react";
import { AllElementsMap, ModalElement, WheelConfig } from "./types";

export function getDefaultWheelConfig(allEles: AllElementsMap): WheelConfig {
  const activeElements = Object.values(allEles).filter((ele) => ele.active);
  const { width, left } = getEleWidthtAndLeft(activeElements.length);
  const defaultConfig: WheelConfig = {
    eleLeft: left,
    eleWidth: width,
  };
  return defaultConfig;
}

export function getRandomDegrees(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function calcWheelEleTransform(totalNum: number, index: number): string {
  return `rotate(${(360 * index) / totalNum}deg)`;
}

/*

width: 570.875

1 = width: 100%, height: 100%, left: 0, clip: none;
2 = width: 100%, height: 50%, left: 0, clip: none;
3 = width: 175%, left: -205px 
4 = width: 100% left: 0px
5 = width: 73%, left:  73px /13%
6 = width: 58%, left: 113px/21%
7 = width: 50%, left: 25%
8 = width: 42%, left: 29%
9 = width: 38%, left: 31%
10 = width: 34%, left: 33%
11 = width: 30%, left: 35%
12 = width: 28%, left: 36%;
idea: let user adjust width, and left
*/

// height: 50%;
// clip-path: polygon(100% 0, 50% 100%, 0 0);
// width: ${360 - 20 * wheelElements.length}px;
// left: ${55 + 10 * wheelElements.length}px;
export function getEleWidthtAndLeft(num: number): {
  width: number;
  left: number;
} {
  if (num === 1) {
    return {
      width: 100,
      left: 0,
    };
  }
  if (num === 2) {
    return {
      width: 100,
      left: 0,
    };
  }
  if (num === 3) {
    return {
      width: 176,
      left: 38,
    };
  }
  if (num === 4) {
    return {
      width: 100,
      left: 0,
    };
  }
  if (num === 5) {
    return {
      width: 73,
      left: 13,
    };
  }
  if (num === 6) {
    return {
      width: 58,
      left: 21,
    };
  }
  if (num === 7) {
    return {
      width: 50,
      left: 25,
    };
  }
  if (num === 8) {
    return {
      width: 42,
      left: 29,
    };
  }
  if (num < 12) {
    const width = 38 - 4 * (num - 9);
    const left = 31 + 2 * (num - 9);
    // console.log({ width, left });
    return {
      width,
      left,
    };
  }
  const width = 30 - 2 * (num - 11);
  const left = 35 + (num - 11);
  return {
    width,
    left,
  };
}

export function getHeightAndClipPath(numElements: number): CSSProperties {
  if (numElements === 1) {
    return {
      height: "100%",
      clipPath: "",
    };
  }
  const height = "50%";
  if (numElements === 2) {
    return {
      height,
      clipPath: "",
    };
  }
  const clipPath = "polygon(100% 0, 50% 100%, 0 0)";
  return {
    height,
    clipPath,
  };
}

export function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function sortElements(a: ModalElement, b: ModalElement): number {
  return a.order - b.order;
}

export function objSize(obj: { [id: string]: any }): number {
  let size = 0;
  for (const key in obj) {
    size++;
  }
  return size;
}

// the middle of 1 will be 0
export function findIndexByEndDegree(
  endDegree: number,
  degreesPerEle: number
): number {
  let index = 0;
  let currentDegree = degreesPerEle / 2;
  while (currentDegree <= endDegree) {
    index++;
    currentDegree += degreesPerEle;
  }
  return index;
}

export function didCrossBorder(
  prevDegree: number,
  currDegree: number,
  numElements: number
): boolean {
  const degreesPerEle = 360 / numElements;
  let currBorder = degreesPerEle / 2; // first border is at half the degrees of one ele;
  for (let i = 0; i < numElements; i++) {
    if (currBorder <= currDegree && currBorder >= prevDegree) {
      return true;
    }
    currBorder += degreesPerEle;
  }
  if (currBorder <= currDegree && currBorder >= prevDegree) {
    return true;
  }
  return false;
}
