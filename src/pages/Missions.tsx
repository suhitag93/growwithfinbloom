import GamifiedMissions from "@/components/dashboard/GamifiedMissions";
import AchievementsBadges from "@/components/dashboard/AchievementsBadges";
import LevelProgressionMap from "@/components/dashboard/LevelProgressionMap";
import DemoBanner from "@/components/DemoBanner";

const Missions = () => (
  <>
    <DemoBanner />
    <div className="p-4 space-y-3">
      <h1 className="font-display text-2xl font-semibold text-foreground">Missions</h1>
      <GamifiedMissions />
      <AchievementsBadges />
      <LevelProgressionMap />
    </div>
  </>
);

export default Missions;
