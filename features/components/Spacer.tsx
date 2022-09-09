export default function Spacer({
  height = "100%",
  width = "100%",
}: {
  height?: string | number;
  width?: string | number;
}) {
  return <div style={{ width, height }}></div>;
}
