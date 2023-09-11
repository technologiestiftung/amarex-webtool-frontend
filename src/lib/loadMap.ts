import { Districts } from "@/types";
import fs from "fs";
import path from "path";

export const getMapData = async () => {
  const berlinDistrictsPath = await path.join(
    process.cwd(),
    "public/data/berlin_bezirke.json"
  );
  const berlinDistricts: Districts = await JSON.parse(
    fs.readFileSync(berlinDistrictsPath, "utf-8")
  );

  return {
    berlinDistricts,
  };
};
