import { ColorPicker, Popover, Stack, TextInput } from "@mantine/core";

type ColorSwatchPickerProps = {
  color: string;
  onChange: (color: string) => void;
  width?: string | number;
  noMargin?: boolean;
};
export function ColorSwatchPicker({
  color,
  onChange,
  width,
  noMargin,
}: ColorSwatchPickerProps) {
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
            width: width || 24,
            height: 24,
            backgroundColor: color,
            marginLeft: noMargin ? 0 : 10,
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
