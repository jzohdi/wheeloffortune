import { Divider, MantineSize, NumberInput, Radio, Title } from "@mantine/core";
import { EleTextPosition } from "../../types";
import { ColorSwatchPicker } from "./ColorSwatchPicker";
import Spacer from "./Spacer";

interface WheelStylesPickerProps {
  fontSize: number;
  onChangeFontSize: (num: number) => void;
  paddingTop: number;
  onChangePaddingTop: (num: number) => void;
  eleRotation: number;
  onChangeEleRotation: (num: number) => void;
  textPosition: EleTextPosition;
  onChangeEleTextPosition: (val: string) => void;
  wheelBorderColor: string;
  onChangeWheelBorderColor: (val: string) => void;
  wheelBorderWidth: number;
  onChangeWheelBorderWidth: (num: number) => void;
  arrowColor: string;
  onChangeArrowColor: (val: string) => void;
}

const numberInputProps = {
  size: "sm" as MantineSize,
  stepHoldDelay: 500,
  stepHoldInterval: 100,
};

const spacerHeight = 10;

export default function WheelStylesPicker({
  fontSize,
  onChangeFontSize,
  paddingTop,
  onChangePaddingTop,
  eleRotation,
  onChangeEleRotation,
  textPosition,
  onChangeEleTextPosition,
  wheelBorderColor,
  onChangeWheelBorderColor,
  wheelBorderWidth,
  onChangeWheelBorderWidth,
  arrowColor,
  onChangeArrowColor,
}: WheelStylesPickerProps) {
  return (
    <div style={{ padding: "10px 5px" }}>
      {/* <Title
        order={3}
        color="#5C7b6C"
        style={{ fontSize: "1.2rem", textAlign: "center" }}
      >
        Items
      </Title> */}
      <NumberInput
        {...numberInputProps}
        label="Font Size"
        value={fontSize}
        onChange={onChangeFontSize}
      />
      <Spacer height={spacerHeight} />
      <NumberInput
        {...numberInputProps}
        label="Padding Top"
        value={paddingTop}
        onChange={onChangePaddingTop}
      />
      <Spacer height={spacerHeight} />
      <NumberInput
        {...numberInputProps}
        label="Element Rotation"
        value={eleRotation}
        onChange={onChangeEleRotation}
      />
      <Spacer height={spacerHeight} />
      <Radio.Group
        label="Element Text Position"
        value={textPosition}
        onChange={onChangeEleTextPosition}
      >
        <Radio value="center" label="Center"></Radio>
        <Radio value="top" label="Top"></Radio>
      </Radio.Group>
      <Spacer height={spacerHeight} />
      <Divider />
      <Spacer height={spacerHeight} />
      <label style={{ fontSize: 14 }}>Border Color</label>
      <ColorSwatchPicker
        color={wheelBorderColor}
        onChange={onChangeWheelBorderColor}
        noMargin
        width="100%"
      />
      <Spacer height={spacerHeight} />
      <NumberInput
        {...numberInputProps}
        label="Border Width"
        value={wheelBorderWidth}
        onChange={onChangeWheelBorderWidth}
      />
      <Spacer height={spacerHeight} />
      <label style={{ fontSize: 14 }}>Arrow Color</label>
      <ColorSwatchPicker
        width="100%"
        color={arrowColor}
        onChange={onChangeArrowColor}
        noMargin
      />
    </div>
  );
}
