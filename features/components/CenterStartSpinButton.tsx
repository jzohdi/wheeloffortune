import { Button } from "@mantine/core";
import Image from "next/image";

interface CenterStartSpinButtonProps {
  onClick: () => void;
  visible: boolean;
}

export default function CenterStartSpinButton({
  onClick,
  visible,
}: CenterStartSpinButtonProps) {
  return (
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
        onClick={onClick}
        style={{
          zIndex: 10001,
          width: "8vmin",
          height: "8vmin",
          borderRadius: "50%",
          padding: 0,
          top: "-4vmin",
          overflow: "hidden",
          display: visible ? "flex" : "none",
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
  );
}
