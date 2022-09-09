/* eslint-disable react/no-unknown-property */
import type { NextPage } from "next";
import { useRef, useState, useCallback, useEffect, CSSProperties } from "react";
import {
  Button,
  Drawer,
  Tabs,
  Checkbox,
  TextInput,
  ScrollArea,
  Popover,
  ColorPicker,
  Stack,
  Modal,
  Title,
} from "@mantine/core";
import { MenuIcon, TrashCanBoldIcon } from "@jzohdi/jsx-icons";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import useRAFLoop from "../hooks/useRAFLoop";
import confetti from "canvas-confetti";
import Head from "next/head";
import { getSoundProvider } from "../features/soundProvider";

const soundProvider = getSoundProvider();

type AllElementsMap = { [id: string]: ModalElement };

const defaultData: AllElementsMap = [
  {
    id: uuidv4(),
    text: "1",
    background: "#3f51b5",
    active: true,
  },
  {
    id: uuidv4(),
    text: "2",
    background: "#ff9800",
    active: true,
  },
  {
    id: uuidv4(),
    text: "3",
    background: "#e91e63",
    active: true,
  },
  {
    id: uuidv4(),
    text: "4",
    background: "#4caf50",
    active: true,
  },
  {
    id: uuidv4(),
    text: "5",
    background: "#009688",
    active: true,
  },
  {
    id: uuidv4(),
    text: "6",
    background: "#9c27b0",
    active: true,
  },
  {
    id: uuidv4(),
    text: "7",
    background: "#795548",
    active: true,
  },
  {
    id: uuidv4(),
    text: "8",
    background: "#f44336",
    active: true,
  },
  {
    id: uuidv4(),
    text: "9",
    background: "#00bbe0",
    active: true,
  },
  {
    id: uuidv4(),
    text: "10",
    background: "#00e02d",
    active: true,
  },
  {
    id: uuidv4(),
    text: "11",
    background: "#dcd800",
    active: true,
  },
].reduce((prev, curr) => {
  prev[curr.id] = { ...curr, order: parseInt(curr.text) };
  return prev;
}, {} as AllElementsMap);

type WheelConfig = {
  eleWidth: number;
  eleLeft: number;
  elePaddingTop: number;
  eleTextPosition: "top" | "center";
};

type ModalElement = {
  id: string;
  text: string;
  background: string;
  active: boolean;
  order: number;
};

type ModalData = {
  elements: AllElementsMap;
};

type WheelSpinConfig = {
  minTurns: number;
  maxTurns: number;
  spinSpeed: number;
};
const Home: NextPage = () => {
  const [spinConfig, setSpinConfig] = useState<WheelSpinConfig>({
    minTurns: 5,
    maxTurns: 10,
    spinSpeed: 1,
  });
  const [backgroundSrc, setBackgroundSrc] = useState<string>("/homepage_3.png");
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [modalData, setModalData] = useState<ModalData>({
    elements: defaultData,
  });
  const [wheelConfig, setWheelConfig] = useState<WheelConfig>(
    getDefaultWheelConfig(modalData.elements)
  );
  const [currPrize, setCurrPrize] = useState<ModalElement | null>(null);
  // const { width, height, measureRef } = useSize();
  const containerRef = useRef<HTMLDivElement>();
  const currentRotation = useRef<number>(0);
  const [newItem, setNewItem] = useState<string>("");
  const degreesToSpinRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeEles = Object.values(modalData.elements).filter(
    (ele) => ele.active
  );

  const doConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    var myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });
    myConfetti({
      particleCount: 300,
      spread: 160,
      origin: {
        x: 0.5,
        y: 0.8,
      },
      // any other options from the global
      // confetti function
    });
    setTimeout(() => {
      myConfetti.reset();
    }, 6000);
  };

  const doAnimation = useCallback(() => {
    const degreesLeft = degreesToSpinRef.current;
    const isSpinning = degreesLeft > 0;
    // console.log({ isSpinning, toSping: degreesToSpinRef.current });
    if (isSpinning) {
      const container = containerRef.current;
      if (!container) {
        return;
      }
      let spinDelta =
        spinConfig.spinSpeed * Math.max(Math.min(degreesLeft / 10, 10), 0.15);
      // degreesLeft > 50
      // ? // spinConfig.spinSpeed * Math.max(Math.min(degreesLeft / 15, 20), 0.15);
      //   Math.max(Math.log2(degreesLeft), 0.15)
      // : Math.max(Math.min(degreesLeft / 10, 20), 0.15);
      const currentDegree = currentRotation.current;
      const targetDegree = currentDegree + spinDelta;
      container.style.transform = "rotate(" + targetDegree + "deg)";
      degreesToSpinRef.current -= spinDelta;
      currentRotation.current += spinDelta;
      const numberElements = activeEles.length;
      // TODO: make clicking sound when passing edge
      if (
        didCrossBorder(currentDegree % 360, targetDegree % 360, numberElements)
      ) {
        soundProvider.playClick();
      }
      // console.log("spinning");
      if (degreesToSpinRef.current <= 0) {
        setTimeout(() => {
          degreesToSpinRef.current = 0;
          const endDegree = targetDegree % 360;
          const activeElements = Object.values(modalData.elements)
            .filter((e) => e.active)
            .sort(sortElements);
          const degreesPerEle = 360 / numberElements;
          const indexOfEnd = findIndexByEndDegree(endDegree, degreesPerEle);
          let prize = activeElements[0];
          if (indexOfEnd > 0) {
            prize = activeElements[numberElements - indexOfEnd];
          }
          setCurrPrize(prize);
          doConfetti();
          soundProvider.playPrize();
        }, 300);
      }
    }
  }, [spinConfig, modalData, activeEles]);

  useRAFLoop(() => {
    const degreesLeft = degreesToSpinRef.current;
    const isSpinning = degreesLeft > 0;
    // console.log({ isSpinning, toSping: degreesToSpinRef.current });
    if (isSpinning) {
      doAnimation();
    }
  });
  /*
	len = 11
	0  1 2 3 4 5 6 7 8 9 10 
	0 10 9 8 7 6 5 4 3 2  1
	 */

  const handleClickSpin = () => {
    const isSpinning = degreesToSpinRef.current > 0;
    if (isSpinning) {
      return;
    }
    const randomSpin = getRandomDegrees(
      spinConfig.minTurns * 360,
      spinConfig.maxTurns * 360
    );
    degreesToSpinRef.current = randomSpin;
    // const container = containerRef.current;
    // if (!container) {
    //   return;
    // }
    // const degrees = currentRotation.current;
    // container.style.transform = "rotate(" + degrees + "deg)";
    // currentRotation.current =
    //   degrees +
    //   getRandomDegrees(spinConfig.minTurns * 360, spinConfig.maxTurns * 360);
  };

  const setupWheelRefs = useCallback((node: HTMLDivElement) => {
    if (node) {
      containerRef.current = node;
      // measureRef(node);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    soundProvider.loadClickAudioELement().then((audioEle) => {
      soundProvider.clickAudioElement = audioEle;
    });
    soundProvider.loadPrizeAudioElement().then((audioEle) => {
      soundProvider.prizeAudioELement = audioEle;
    });
  }, []);

  // recalculate elements width and left whel modalData changes
  useEffect(() => {
    const activeElements = Object.values(modalData.elements).filter(
      (ele) => ele.active
    );
    // console.log(
    //   Object.keys(modalData.elements).length,
    //   modalData,
    //   activeElements
    // );
    const { width, left } = getEleWidthtAndLeft(activeElements.length);
    // console.log({ width, left });
    setWheelConfig((w) => ({ ...w, eleLeft: left, eleWidth: width }));
  }, [modalData]);

  const handleToggleEle = (ele: ModalElement) => {
    const isActive = !ele.active;
    modalData.elements[ele.id].active = isActive;
    setModalData({ ...modalData });
  };
  const handleChangeText = (ele: ModalElement, newText: string) => {
    modalData.elements[ele.id].text = newText;
    setModalData({ ...modalData });
  };

  const handleAddNewItem = () => {
    const text = newItem;
    const id = uuidv4();
    const background = getRandomColor();
    const active = true;
    const element: ModalElement = {
      text,
      id,
      active,
      background,
      order: objSize(modalData.elements) + 1,
    };
    modalData.elements[id] = element;
    setModalData({ ...modalData });
    setNewItem("");
  };
  const handleChangeEleColor = (ele: ModalElement, newColor: string) => {
    modalData.elements[ele.id].background = newColor;
    setModalData({ ...modalData });
  };
  const handleDeleteItem = (ele: ModalElement) => {
    const eleOrder = ele.order;
    const items = Object.values(modalData.elements);
    for (const item of items) {
      if (item.order > eleOrder) {
        item.order -= 1;
      }
    }
    delete modalData.elements[ele.id];
    setModalData({ ...modalData });
  };
  return (
    <>
      <Head>
        <title>WeGoGreenR Fortune Wheel!</title>
      </Head>
      <canvas
        style={{
          pointerEvents: "none",
          zIndex: 2000,
          width: "100%",
          height: "100%",
          position: "fixed",
          top: 0,
          left: 0,
        }}
        ref={canvasRef}
      ></canvas>
      <Modal opened={currPrize !== null} onClose={() => setCurrPrize(null)}>
        <div>
          <Title order={2}>Congatz!</Title>
          <p>You won:</p>
          <p>{currPrize?.text}</p>
          <Button
            style={{ width: "100%" }}
            variant="outline"
            onClick={() => setCurrPrize(null)}
          >
            Play Again
          </Button>
        </div>
      </Modal>
      <Image
        src={`${backgroundSrc}`}
        alt="default background wgg"
        layout="fill"
        priority
      />
      <Drawer
        transitionDuration={150}
        opened={openModal}
        onClose={() => setOpenModal(false)}
        overlayBlur={0}
        overlayOpacity={1}
        overlayColor="none"
        position="right"
      >
        <ScrollArea
          style={{ width: "100%", height: "calc(100% - 43px)", padding: 10 }}
        >
          <Tabs defaultValue="Items">
            <Tabs.List>
              <Tabs.Tab value="Items">Items</Tabs.Tab>
              <Tabs.Tab value="Item Style">Item Style</Tabs.Tab>
              <Tabs.Tab value="Wheel Style">Wheel Style</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="Items">
              <div
                style={{
                  padding: "5px 0px",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                }}
              >
                <TextInput
                  label="New Item"
                  value={newItem}
                  onChange={(e) => setNewItem(e.currentTarget.value)}
                  style={{ marginRight: 10 }}
                />
                <Button onClick={handleAddNewItem}>Add</Button>
              </div>
              <div>
                {Object.values(modalData.elements)
                  .sort(sortElements)
                  .map((ele) => {
                    const checked = ele.active;
                    // const;
                    return (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginTop: 5,
                        }}
                        key={ele.id}
                      >
                        <Checkbox
                          style={{
                            marginTop: 5,
                            marginRight: 5,
                            cursor: "pointer",
                          }}
                          size="md"
                          checked={checked}
                          onChange={() => handleToggleEle(ele)}
                        />
                        <TextInput
                          value={ele.text}
                          size="xs"
                          onChange={(e) =>
                            handleChangeText(ele, e.currentTarget.value)
                          }
                        />
                        <ColorSwatchPicker
                          color={ele.background}
                          onChange={(color) => handleChangeEleColor(ele, color)}
                        />
                        <Button
                          variant="outline"
                          color="red"
                          style={{ marginLeft: 10 }}
                          onClick={() => handleDeleteItem(ele)}
                        >
                          <TrashCanBoldIcon color="#FA5252" />
                        </Button>
                      </div>
                    );
                  })}
              </div>
            </Tabs.Panel>
            <Tabs.Panel value="Item Style"> styles</Tabs.Panel>
            <Tabs.Panel value="Wheel Style"> styles</Tabs.Panel>
          </Tabs>
        </ScrollArea>
      </Drawer>
      <Button
        style={{ position: "fixed", top: 10, right: 10 }}
        variant="subtle"
        onClick={() => setOpenModal(!openModal)}
      >
        <MenuIcon size={20} color="#5C7CFA" />
      </Button>
      <div
        style={{
          height: "100%",
          width: "100%",
          padding: "50px",
          backgroundColor: "black",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* <button onClick={handleClickSpin}>Spin</button> */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            height: 1,
            width: "100%",
            justifyContent: "center",
            display: currPrize !== null ? "none" : "flex",
          }}
        >
          <span className="arrow" style={{ top: `calc(-45vmin)` }}></span>
        </div>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            height: 1,
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            onClick={handleClickSpin}
            style={{
              zIndex: 10001,
              width: "8vmin",
              height: "8vmin",
              borderRadius: "50%",
              padding: 0,
              top: "-4vmin",
              overflow: "hidden",
              display: currPrize === null ? "flex" : "none",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              backgroundColor: "#445136",
              boxShadow: "0px 3px 14px 5px #0505054f",
            }}
          >
            <Image
              src="/greenr_logo.jpg"
              alt="WeGoGreenr Logo"
              layout="fill"
              priority
            ></Image>
          </Button>
        </div>
        <div className="wheel-container" ref={setupWheelRefs}>
          {activeEles.sort(sortElements).map((ele, i) => {
            return (
              <div
                key={i}
                style={{
                  ...getHeightAndClipPath(activeEles.length),
                  backgroundColor: ele.background,
                  transform: calcWheelEleTransform(activeEles.length, i),
                  zIndex: i,
                }}
              >
                {ele.text}
              </div>
            );
          })}
        </div>
        <style jsx scoped>
          {`
            .wheel-container {
              width: 80vmin;
              height: 80vmin;
            }
            .wheel-container div {
              position: absolute;
              transform: translateX(-50%);
              transform-origin: bottom;
              text-align: center;
              display: flex;
              justify-content: center;
              font-size: 20px;
              font-weight: bold;
              color: #fff;
              align-items: ${wheelConfig.eleTextPosition === "center"
                ? "center"
                : "flex-start"};
              padding-top: ${wheelConfig.elePaddingTop}px;
              width: ${wheelConfig.eleWidth}%;
              left: ${wheelConfig.eleLeft}%;
            }
          `}
        </style>
        <style global jsx>{`
          html,
          body,
          body > div:first-child,
          div#__next,
          div#__next > div {
            height: 100%;
          }
        `}</style>
      </div>
    </>
  );
};

export default Home;

type ColorSwatchPickerProps = {
  color: string;
  onChange: (color: string) => void;
};
function ColorSwatchPicker({ color, onChange }: ColorSwatchPickerProps) {
  const handleChangeText = (value: string) => {
    if (value.length >= 1) {
      return onChange(value);
    }
  };
  return (
    <Popover width={235} position="bottom" withArrow shadow="lg">
      <Popover.Target>
        <div
          style={{
            width: 24,
            height: 24,
            backgroundColor: color,
            marginLeft: 10,
            borderRadius: 3,
            border: "1px solid black",
            cursor: "pointer",
          }}
        ></div>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack>
          <ColorPicker
            format="hex"
            value={color}
            onChange={onChange}
          ></ColorPicker>
          <TextInput
            value={color}
            onChange={(e) => handleChangeText(e.currentTarget.value)}
          />
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}

function getDefaultWheelConfig(allEles: AllElementsMap): WheelConfig {
  const activeElements = Object.values(allEles).filter((ele) => ele.active);
  const { width, left } = getEleWidthtAndLeft(activeElements.length);
  const defaultConfig: WheelConfig = {
    eleLeft: left,
    eleWidth: width,
    elePaddingTop: 12,
    eleTextPosition: "top",
  };
  return defaultConfig;
}

function getRandomDegrees(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function calcWheelEleTransform(totalNum: number, index: number): string {
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
function getEleWidthtAndLeft(num: number): { width: number; left: number } {
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

function getHeightAndClipPath(numElements: number): CSSProperties {
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

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function sortElements(a: ModalElement, b: ModalElement): number {
  return a.order - b.order;
}

function objSize(obj: { [id: string]: any }): number {
  let size = 0;
  for (const key in obj) {
    size++;
  }
  return size;
}

// the middle of 1 will be 0
function findIndexByEndDegree(
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

function didCrossBorder(
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
