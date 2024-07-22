// TODO: add url from env
const apiUrl = "http://0.0.0.0:8000";

/**
 * Fetches data from Rabimo API asynchronously
 * @param {Object} payload - data to send
 * @returns {Promise} - a promise that resolves to the response data
 */
async function getMultiblock(payload) {
  try {
    const response = await fetch(`${apiUrl}/calculate_multiblock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data from Rabimo API:", error);
    throw error;
  }
}
/**
 * Tests Rabimo API
 * @param {*} endpoint
 */
async function getTest(endpoint = "all") {
  console.log("[getRabimo] :: Testing API::");
  const payload = [
    {
      code: "0000000001000016",
      precipitationYear: 632,
      precipitationSummer: 333,
      evapotranspirationYear: 660,
      evapotranspirationSummer: 530,
      district: "1",
      totalArea: 4951.8538,
      areaMain: 4951.8538,
      areaRoad: 0,
      mainFraction: 1,
      roof: 0.009,
      greenRoof: 0,
      swgRoof: 1,
      pvd: 0.9736,
      swgPvd: 1,
      srf1Pvd: 0.33,
      srf2Pvd: 0.15,
      srf3Pvd: 0.16,
      srf4Pvd: 0,
      srf5Pvd: 0.36,
      roadFraction: 0,
      pvdR: 0,
      swgPvdR: 1,
      srf1PvdR: 0,
      srf2PvdR: 0,
      srf3PvdR: 0,
      srf4PvdR: 0,
      sealed: 0.9826,
      toSwale: 0,
      gwDist: 2.8,
      ufc30: 12,
      ufc150: 10,
      landType: "urban",
      vegClass: 35,
      irrigation: 0,
      blockType: "300_road",
    },
    {
      code: "0000000001000017",
      precipitationYear: 631,
      precipitationSummer: 332,
      evapotranspirationYear: 660,
      evapotranspirationSummer: 530,
      district: "1",
      totalArea: 3406.4166,
      areaMain: 3406.4166,
      areaRoad: 0,
      mainFraction: 1,
      roof: 0.0038,
      greenRoof: 0,
      swgRoof: 1,
      pvd: 0.9769,
      swgPvd: 1,
      srf1Pvd: 0.36,
      srf2Pvd: 0.17,
      srf3Pvd: 0.13,
      srf4Pvd: 0,
      srf5Pvd: 0.34,
      roadFraction: 0,
      pvdR: 0,
      swgPvdR: 1,
      srf1PvdR: 0,
      srf2PvdR: 0,
      srf3PvdR: 0,
      srf4PvdR: 0,
      sealed: 0.9807,
      toSwale: 0,
      gwDist: 2.7,
      ufc30: 11,
      ufc150: 10,
      landType: "urban",
      vegClass: 35,
      irrigation: 0,
      blockType: "300_road",
    },
  ];

  if (endpoint === "all") {
    await fetch(`${apiUrl}/calculate_all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        return data;
      });
  } else {
    await fetch(`${apiUrl}/calculate_multiblock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        return data;
      });
  }
}

/**
 * Fetches data from Rabimo API asynchronously
 * @param {Object} payload - data to send
 * @returns {Promise} - a promise that resolves to the response data
 */
async function getMultiblockDeltaW(payload) {
  try {
    const response = await fetch(`${apiUrl}/calculate_multiblock_delta_w`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data from Rabimo API:", error);
    throw error;
  }
}

export default { getMultiblock, getTest, getMultiblockDeltaW };

