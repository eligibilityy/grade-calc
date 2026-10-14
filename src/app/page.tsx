// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GwaCalculator } from "@/components/gwa-calculator";
import { bscs2026 } from "@/data/dlsl-bscs-2026";

export default function Home() {
  return (
    <>
      <GwaCalculator curriculum={bscs2026} />

      {/* <Tabs defaultValue="gwa">
        <TabsList>
          <TabsTrigger value="gwa">GWA</TabsTrigger>
        </TabsList>
        <TabsContent value="gwa" className="mt-4">
          <GwaCalculator curriculum={bscs2024} />
        </TabsContent>
      </Tabs> */}
    </>
  );
}
