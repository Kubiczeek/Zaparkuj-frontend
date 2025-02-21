import parkingLots from "$lib/parkingLots/data.json";

export const getAllParkingLotIds = () => parkingLots.map((lot) => lot.id)