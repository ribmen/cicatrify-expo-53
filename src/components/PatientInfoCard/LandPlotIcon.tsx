import * as React from "react";
import Svg, { Path } from "react-native-svg";

interface LandPlotIconProps {
  color?: string;
  width?: number;
  height?: number;
}

export const LandPlotIcon: React.FC<LandPlotIconProps> = ({
  color = "#BFACC8",
  width = 32,
  height = 32,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 8L18 5L12 2V12M7.99999 11.99L2.49999 15.13C2.34609 15.2172 2.21808 15.3437 2.12902 15.4965C2.03997 15.6494 1.99304 15.8231 1.99304 16C1.99304 16.1769 2.03997 16.3506 2.12902 16.5035C2.21808 16.6563 2.34609 16.7828 2.49999 16.87L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L21.5 16.87C21.6539 16.7828 21.7819 16.6563 21.871 16.5035C21.96 16.3506 22.0069 16.1769 22.0069 16C22.0069 15.8231 21.96 15.6494 21.871 15.4965C21.7819 15.3437 21.6539 15.2172 21.5 15.13L16 12M6.48999 12.85L17.51 19.15M17.51 12.85L6.49999 19.15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
