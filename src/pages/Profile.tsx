import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Link2, Target, Shield } from "lucide-react";
import ProfileTab from "@/components/settings/ProfileTab";
import ConnectedAccountsTab from "@/components/settings/ConnectedAccountsTab";
import GoalsBucketsTab from "@/components/settings/GoalsBucketsTab";
import SecurityTab from "@/components/settings/SecurityTab";
import DemoBanner from "@/components/DemoBanner";

const Profile = () => (
  <>
    <DemoBanner />
    <div className="p-4">
      <h1 className="font-display text-2xl font-semibold text-foreground mb-1">Profile</h1>
      <p className="text-muted-foreground text-sm mb-4">Manage your profile & preferences</p>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-secondary/50 p-1 w-full flex overflow-x-auto">
          <TabsTrigger value="profile" className="gap-1 text-xs flex-1">
            <User className="w-3.5 h-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="accounts" className="gap-1 text-xs flex-1">
            <Link2 className="w-3.5 h-3.5" /> Accounts
          </TabsTrigger>
          <TabsTrigger value="goals" className="gap-1 text-xs flex-1">
            <Target className="w-3.5 h-3.5" /> Goals
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1 text-xs flex-1">
            <Shield className="w-3.5 h-3.5" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile"><ProfileTab /></TabsContent>
        <TabsContent value="accounts"><ConnectedAccountsTab /></TabsContent>
        <TabsContent value="goals"><GoalsBucketsTab /></TabsContent>
        <TabsContent value="security"><SecurityTab /></TabsContent>
      </Tabs>
    </div>
  </>
);

export default Profile;
