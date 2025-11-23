// import { CasinoChip3D } from "@/components/chips/casino-chip-3d";
import { CasinoChip } from "@/components/chips/casino-chip";
import { CasinoChip3D } from "@/components/chips/casino-chip-3d";
import { CHIP_COLORS } from "@/modules/chip/colors";

export default function Page() {
  return (
    <div className="flex flex-wrap justify-center">
      {Object.entries(CHIP_COLORS).map(([denomination, colors]) => (
        <div key={denomination} className="m-4">
          {/* <CasinoChip
            suitColor={colors["text-secondary"]}
            centerCircleColor={colors["tertiary"]}
            chipBodyColor={colors["primary"]}
            edgeMarkColor={colors["secondary"]}
            denomination={denomination}
            denominationColor={colors["text-primary"]}
            denominationSize={48}
            circularText={`PHYTERTEK CASINO`}
            circularTextColor={colors["text-secondary"]}
            circularTextSize={14}
            circularTextRadius={62}
            className="mb-4"
          /> */}
          <CasinoChip3D
            centerCircleColor={colors["tertiary"]}
            chipBodyColor={colors["primary"]}
            edgeMarkColor={colors["secondary"]}
            denomination={denomination}
            denominationColor={colors["text-primary"]}
            denominationSize={48}
            circularText={`PHYTERTEK CASINO`}
            circularTextColor={colors["text-secondary"]}
            circularTextSize={14}
            circularTextRadius={62}
            scale={0.75}
          />
        </div>
      ))}
    </div>
  );
}
