import fs from "fs";
import path from "path";

export const getMapData = async () => {
  const berlinDistrictsPath = await path.join(
    process.cwd(),
    "public/data/berlin_bezirke.geojson"
  );
  const berlinDistricts = await JSON.parse(
    fs.readFileSync(berlinDistrictsPath, "utf-8")
  );

  return {
    berlinDistricts,
  };
};
