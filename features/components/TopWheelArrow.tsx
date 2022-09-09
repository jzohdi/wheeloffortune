interface TopWheelArrowProps {
  visible: boolean;
  color: string;
}

export default function TopWheelArrow({ visible, color }: TopWheelArrowProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: 0,
        height: 1,
        width: "100%",
        justifyContent: "center",
        display: visible ? "flex" : "none",
      }}
    >
      <span
        className="arrow"
        style={{
          top: `calc(-45vmin)`,
          transform: "translateX(-1px)",
          backgroundColor: color,
        }}
      ></span>
    </div>
  );
}
