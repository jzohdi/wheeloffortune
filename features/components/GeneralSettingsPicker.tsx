import { FileInput, Switch, TextInput } from "@mantine/core";
import { useState } from "react";
import Spacer from "./Spacer";

interface GeneralSettingsPickerProps {
  backgroundSrc: string;
  onChangeBackgroundImage: (value: string) => void;
  audioSrc: string;
  onChangePrizeSound: (value: string) => void;
  shouldPlayPrizeAudio: boolean;
  onChangeShouldPlayPrize: (val: boolean) => void;
  modalTitle: string;
  onChangeModalTitle: (val: string) => void;
  modalSecondaryText: string;
  onChangeModalSecondaryText: (val: string) => void;
  modalButtonText: string;
  onChangeModalButtonText: (val: string) => void;
}

const spacerHeight = 10;

export default function GeneralSettingsPicker({
  backgroundSrc,
  onChangeBackgroundImage,
  audioSrc,
  onChangePrizeSound,
  shouldPlayPrizeAudio,
  onChangeShouldPlayPrize,
  modalButtonText,
  onChangeModalButtonText,
  modalTitle,
  onChangeModalTitle,
  modalSecondaryText,
  onChangeModalSecondaryText,
}: GeneralSettingsPickerProps) {
  // const [internalBackgroundImage, setInternalBackgroundImage] =
  //   useState<File | null>(null);
  const handleChangeBackground = (file: File) => {
    // setInternalBackgroundImage(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onChangeBackgroundImage(previewUrl);
    }
  };

  const handleChangePrizeSound = (file: File) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const src = e.target?.result;
      if (src) {
        if (typeof src === "string") {
          onChangePrizeSound(src);
        } else {
          const blob = new Blob([src], { type: "audio/wav" });
          const toString = URL.createObjectURL(blob);
          onChangePrizeSound(toString);
        }
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: "10px 5px" }}>
      <FileInput
        placeholder={backgroundSrc}
        accept="image/*"
        label="Background Image"
        onChange={handleChangeBackground}
      />
      <Spacer height={spacerHeight} />
      <FileInput
        placeholder={"/celebration"}
        accept="audio/*"
        label="Prize Sound"
        onChange={handleChangePrizeSound}
      />
      <Spacer height={20} />
      <Switch
        label="Play Prize Audio"
        checked={shouldPlayPrizeAudio}
        onChange={(e) => onChangeShouldPlayPrize(e.currentTarget.checked)}
      />
      <Spacer height={spacerHeight} />
      <TextInput
        label="Prize Modal Title"
        value={modalTitle}
        onChange={(e) => onChangeModalTitle(e.currentTarget.value)}
      />
      <Spacer height={spacerHeight} />
      <TextInput
        label="Prize Secondary Text"
        value={modalSecondaryText}
        onChange={(e) => onChangeModalSecondaryText(e.currentTarget.value)}
      />
      <Spacer height={spacerHeight} />
      <TextInput
        label="Modal Button Text"
        value={modalButtonText}
        onChange={(e) => onChangeModalButtonText(e.currentTarget.value)}
      />
    </div>
  );
}
