/* eslint-disable react/no-unknown-property */
import type { NextPage } from "next";
import { useRef, useState, useCallback, useEffect } from "react";
import {
  Button,
  Drawer,
  Tabs,
  Checkbox,
  TextInput,
  ScrollArea,
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
import WheelStylesPicker from "../features/components/WheelStylesPicker";
import {
  DEFAFULT_MODAL_TITLE,
  DEFAULT_ELE_ROTATION,
  DEFAULT_ELE_TEXT_POSITION,
  DEFAULT_FONT_SIZE,
  DEFAULT_MAX_TURNS,
  DEFAULT_MIN_TURNS,
  DEFAULT_MODAL_BUTTON_TEXT,
  DEFAULT_MODAL_SECONDARY,
  DEFAULT_PADDING_TOP,
  DEFAULT_WHEEL_ARROW_COLOR,
  DEFAULT_WHEEL_BORDER_COLOR,
  DEFAULT_WHEEL_BORDER_WIDTH,
} from "../contstants";
import CenterStartSpinButton from "../features/components/CenterStartSpinButton";
import TopWheelArrow from "../features/components/TopWheelArrow";
import {
  AllElementsMap,
  EleTextPosition,
  ModalData,
  ModalElement,
  WheelConfig,
  WheelSpinConfig,
} from "../types";
import {
  calcWheelEleTransform,
  didCrossBorder,
  findIndexByEndDegree,
  getDefaultWheelConfig,
  getEleWidthtAndLeft,
  getHeightAndClipPath,
  getRandomColor,
  getRandomDegrees,
  objSize,
  sortElements,
} from "../utils";
import { ColorSwatchPicker } from "../features/components/ColorSwatchPicker";
import GeneralSettingsPicker from "../features/components/GeneralSettingsPicker";
import useLocalUrlState from "../hooks/useLocalUrl";

const soundProvider = getSoundProvider();

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

const Home: NextPage = () => {
  const [spinConfig, setSpinConfig] = useLocalUrlState<WheelSpinConfig>({
    key: "spin-config",
    defaultValue: {
      minTurns: DEFAULT_MIN_TURNS,
      maxTurns: DEFAULT_MAX_TURNS,
      spinSpeed: 1,
    },
  });
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [modalData, setModalData] = useLocalUrlState<ModalData>({
    key: "elements",
    defaultValue: {
      elements: defaultData,
    },
  });
  const [wheelConfig, setWheelConfig] = useState<WheelConfig>(
    getDefaultWheelConfig(modalData.elements)
  );
  const [currPrize, setCurrPrize] = useState<ModalElement | null>(null);
  /* =======  styles ======= */
  const [fontSize, setFontSize] = useLocalUrlState<number>({
    key: "fontSize",
    defaultValue: DEFAULT_FONT_SIZE,
  });
  const [paddingTop, setPaddingTop] = useLocalUrlState<number>({
    key: "paddingTop",
    defaultValue: DEFAULT_PADDING_TOP,
  });
  const [eleRotation, setEleRotation] = useLocalUrlState<number>({
    key: "eleRotation",
    defaultValue: DEFAULT_ELE_ROTATION,
  });
  const [eleTextPosition, setEleTextPosition] =
    useLocalUrlState<EleTextPosition>({
      key: "eleTextPosition",
      defaultValue: DEFAULT_ELE_TEXT_POSITION,
    });
  const [wheelBorderColor, setWheelBorderColor] = useLocalUrlState<string>({
    key: "borderColor",
    defaultValue: DEFAULT_WHEEL_BORDER_COLOR,
  });
  const [wheelBorderWidth, setWHeelBorderWidth] = useLocalUrlState<number>({
    key: "borderWidth",
    defaultValue: DEFAULT_WHEEL_BORDER_WIDTH,
  });
  const [wheelArrowColor, setWheelArrowColor] = useLocalUrlState<string>({
    key: "arrowColro",
    defaultValue: DEFAULT_WHEEL_ARROW_COLOR,
  });
  /* ========   general   ========*/
  const [backgroundSrc, setBackgroundSrc] = useState<string>("/homepage_3.png");
  const [prizeAudioSrc, setPrizeAudioSrc] = useState<string>(
    soundProvider.prizeSrc
  );
  const [shouldPlayPrizeAudio, setShouldPlayPrizeAudio] =
    useState<boolean>(false);
  const [shouldPlayTickAudio, setShouldPlayTickAudio] =
    useState<boolean>(false);
  const [modalTitle, setModalTitle] = useLocalUrlState<string>({
    key: "modaTitle",
    defaultValue: DEFAFULT_MODAL_TITLE,
  });
  const [modalSecondaryText, setModalSecondaryText] = useLocalUrlState<string>({
    key: "secondaryText",
    defaultValue: DEFAULT_MODAL_SECONDARY,
  });
  const [modalButtonText, setModalButtonText] = useLocalUrlState<string>({
    key: "buttonText",
    defaultValue: DEFAULT_MODAL_BUTTON_TEXT,
  });
  //////////////////
  const [newItem, setNewItem] = useState<string>("");
  // const { width, height, measureRef } = useSize();
  const containerRef = useRef<HTMLDivElement>();
  const currentRotation = useRef<number>(0);
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
      let spinDelta = Math.max(degreesLeft * 0.02 * spinConfig.spinSpeed, 0.25);

      const currentDegree = currentRotation.current;
      let targetDegree = currentDegree + spinDelta;
      const numberElements = activeEles.length;
      if (
        didCrossBorder(currentDegree % 360, targetDegree % 360, numberElements)
      ) {
        if (shouldPlayTickAudio) {
          soundProvider.playClick();
        }
        degreesToSpinRef.current -= 2;
      }
      container.style.transform = "rotate(" + targetDegree + "deg)";
      degreesToSpinRef.current -= spinDelta;
      currentRotation.current += spinDelta;
      // TODO: make clicking sound when passing edge
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
          if (shouldPlayPrizeAudio) {
            soundProvider.playPrize();
          }
        }, 300);
      }
    }
  }, [spinConfig, modalData, activeEles, shouldPlayPrizeAudio]);

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
  };

  const setupWheelRefs = useCallback((node: HTMLDivElement) => {
    if (node) {
      containerRef.current = node;
      // measureRef(node);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (prizeAudioSrc !== soundProvider.prizeSrc) {
      soundProvider.prizeSrc = prizeAudioSrc;
    }
    soundProvider.loadClickAudioELement().then((audioEle) => {
      soundProvider.clickAudioElement = audioEle;
    });
    soundProvider.loadPrizeAudioElement().then((audioEle) => {
      soundProvider.prizeAudioELement = audioEle;
    });
  }, [prizeAudioSrc]);

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
  const handleChangeSecondaryText = (ele: ModalElement, newText: string) => {
    modalData.elements[ele.id].secondaryText = newText;
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
        <title>Wheel of Fortune | App</title>
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
      <Modal
        opened={currPrize !== null}
        onClose={() => setCurrPrize(null)}
        centered
      >
        <div>
          <Title order={2}>{modalTitle}</Title>
          {modalSecondaryText && <p>{modalSecondaryText}</p>}
          <p>{currPrize?.text}</p>
          <p>{currPrize?.secondaryText}</p>
          <Button
            style={{ width: "100%" }}
            variant="outline"
            onClick={() => setCurrPrize(null)}
          >
            {modalButtonText}
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
              <Tabs.Tab value="Styles">Styles</Tabs.Tab>
              <Tabs.Tab value="General">General</Tabs.Tab>
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
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <TextInput
                            value={ele.text}
                            size="xs"
                            onChange={(e) =>
                              handleChangeText(ele, e.currentTarget.value)
                            }
                            placeholder="Main Text"
                          />
                          <TextInput
                            value={ele.secondaryText}
                            size="xs"
                            onChange={(e) =>
                              handleChangeSecondaryText(
                                ele,
                                e.currentTarget.value
                              )
                            }
                            placeholder="Secondary Text"
                          />
                        </div>
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
            <Tabs.Panel value="Styles">
              <WheelStylesPicker
                fontSize={fontSize}
                onChangeFontSize={setFontSize}
                paddingTop={paddingTop}
                onChangePaddingTop={setPaddingTop}
                eleRotation={eleRotation}
                onChangeEleRotation={setEleRotation}
                onChangeEleTextPosition={(val) =>
                  setEleTextPosition(val as EleTextPosition)
                }
                textPosition={eleTextPosition}
                wheelBorderColor={wheelBorderColor}
                onChangeWheelBorderColor={(color) => setWheelBorderColor(color)}
                wheelBorderWidth={wheelBorderWidth}
                onChangeWheelBorderWidth={setWHeelBorderWidth}
                arrowColor={wheelArrowColor}
                onChangeArrowColor={setWheelArrowColor}
              />
            </Tabs.Panel>
            <Tabs.Panel value="General">
              <GeneralSettingsPicker
                onChangeBackgroundImage={setBackgroundSrc}
                backgroundSrc={backgroundSrc}
                audioSrc={prizeAudioSrc}
                onChangePrizeSound={setPrizeAudioSrc}
                shouldPlayPrizeAudio={shouldPlayPrizeAudio}
                onChangeShouldPlayPrize={setShouldPlayPrizeAudio}
                shouldPlayTickAudio={shouldPlayTickAudio}
                onChangeTickSound={setShouldPlayTickAudio}
                modalTitle={modalTitle}
                onChangeModalTitle={setModalTitle}
                modalSecondaryText={modalSecondaryText}
                onChangeModalSecondaryText={setModalSecondaryText}
                modalButtonText={modalButtonText}
                onChangeModalButtonText={setModalButtonText}
                wheelSpeedScale={spinConfig.spinSpeed}
                onChangeWheelSpeedScale={(num) => {
                  setSpinConfig({ ...spinConfig, spinSpeed: num });
                }}
              />
            </Tabs.Panel>
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
        <TopWheelArrow visible={currPrize === null} color={wheelArrowColor} />
        <CenterStartSpinButton
          onClick={handleClickSpin}
          visible={currPrize === null}
        />
        <div className="wheel-container" ref={setupWheelRefs}>
          {activeEles.sort(sortElements).map((ele, i) => {
            return (
              <div
                key={i}
                style={{
                  ...getHeightAndClipPath(activeEles.length),
                  backgroundColor: ele.background,
                  transform: calcWheelEleTransform(activeEles.length, i),
                  zIndex: i + 1,
                }}
              >
                <span
                  style={{
                    transform: `rotate(${eleRotation}deg)`,
                    marginTop: paddingTop < 0 ? paddingTop : "",
                  }}
                >
                  {ele.text}
                </span>
              </div>
            );
          })}
        </div>
        <style jsx scoped>
          {`
            .wheel-container {
              width: 80vmin;
              height: 80vmin;
              border: ${wheelBorderWidth}px solid ${wheelBorderColor};
            }
            .wheel-container div {
              position: absolute;
              transform: translateX(-50%);
              transform-origin: bottom;
              text-align: center;
              display: flex;
              justify-content: center;
              font-weight: bold;
              color: #fff;
              padding: 0px 15px;
              font-size: ${fontSize}px;
              align-items: ${eleTextPosition === "center"
                ? "center"
                : "flex-start"};
              padding-top: ${paddingTop}px;
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
