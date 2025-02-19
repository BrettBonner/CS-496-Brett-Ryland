import axios from "axios";
import { getFacilities } from "./api";

jest.mock("axios");

test("getFacilities returns data on success", async () => {
  axios.get.mockResolvedValue({ status: 200, data: [{ id: 1, name: "Facility Test" }] });

  const data = await getFacilities();
  expect(data).toEqual([{ id: 1, name: "Facility Test" }]);
});
