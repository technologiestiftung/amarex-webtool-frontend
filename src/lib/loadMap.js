import fs from "fs";
import path from "path";

export const getMapData = async () => {
  const berlinBoroughsPath = await path.join(
    process.cwd(),
    "public/data/berlin_bezirke.geojson"
  );
  const berlinBoroughs = await JSON.parse(
    fs.readFileSync(berlinBoroughsPath, "utf-8")
  );

  return {
    berlinBoroughs,
  };
};
