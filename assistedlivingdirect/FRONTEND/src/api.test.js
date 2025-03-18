import axios from "axios";
import {
  getFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility,
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  changePassword,
  saveFacility,
  removeSavedFacility,
  getSavedFacilities,
  getFacilityByIdWithUpdate,
} from "./api";

// Mock axios
jest.mock("axios");

describe("Frontend API Functions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // getFacilities
  test("getFacilities returns data on success", async () => {
    const mockData = [{ id: 1, name: "Facility Test" }];
    axios.get.mockResolvedValue({ data: mockData });
    const data = await getFacilities();
    expect(data).toEqual(mockData);
    expect(axios.get).toHaveBeenCalledWith("http://localhost:3000/ALD_database");
  });

  test("getFacilities returns null on failure", async () => {
    axios.get.mockRejectedValue(new Error("Fetch failed"));
    const data = await getFacilities();
    expect(data).toBeNull();
  });

  // getFacilityById
  test("getFacilityById returns facility data on success", async () => {
    const mockData = { id: 1, name: "Test Facility" };
    axios.get.mockResolvedValue({ data: mockData });
    const data = await getFacilityById("1");
    expect(data).toEqual(mockData);
    expect(axios.get).toHaveBeenCalledWith("http://localhost:3000/ALD_database/1");
  });

  test("getFacilityById returns null on failure", async () => {
    axios.get.mockRejectedValue(new Error("Fetch failed"));
    const data = await getFacilityById("1");
    expect(data).toBeNull();
  });

  // createFacility
  test("createFacility successfully creates a facility with image", async () => {
    const facilityData = { name: "New Facility" };
    const imageBase64 = "base64string";
    const mockResponse = { id: 2, ...facilityData, imageURL: imageBase64 };
    axios.post.mockResolvedValue({ data: mockResponse });
    const data = await createFacility(facilityData, imageBase64);
    expect(data).toEqual(mockResponse);
    expect(axios.post).toHaveBeenCalledWith("http://localhost:3000/ALD_database", {
      ...facilityData,
      imageURL: imageBase64,
    });
  });

  test("createFacility throws error on failure", async () => {
    axios.post.mockRejectedValue(new Error("Create failed"));
    await expect(createFacility({}, "image")).rejects.toThrow("Create failed");
  });

  // updateFacility
  test("updateFacility updates facility with image", async () => {
    const facilityData = { name: "Updated Facility" };
    const imageBase64 = "newBase64";
    const mockResponse = { id: 3, ...facilityData, imageURL: imageBase64 };
    axios.put.mockResolvedValue({ data: mockResponse });
    const data = await updateFacility("3", facilityData, imageBase64);
    expect(data).toEqual(mockResponse);
    expect(axios.put).toHaveBeenCalledWith("http://localhost:3000/ALD_database/3", {
      ...facilityData,
      imageURL: imageBase64,
    });
  });

  test("updateFacility updates facility without image", async () => {
    const facilityData = { name: "Updated Facility" };
    const mockResponse = { id: 3, ...facilityData };
    axios.put.mockResolvedValue({ data: mockResponse });
    const data = await updateFacility("3", facilityData, null);
    expect(data).toEqual(mockResponse);
    expect(axios.put).toHaveBeenCalledWith("http://localhost:3000/ALD_database/3", {
      ...facilityData,
    });
  });

  test("updateFacility throws error on failure", async () => {
    axios.put.mockRejectedValue(new Error("Update failed"));
    await expect(updateFacility("3", {}, "image")).rejects.toThrow("Update failed");
  });

  // deleteFacility
  test("deleteFacility successfully deletes a facility", async () => {
    const mockResponse = { message: "Deleted successfully" };
    axios.delete.mockResolvedValue({ data: mockResponse });
    const data = await deleteFacility("4");
    expect(data).toEqual(mockResponse);
    expect(axios.delete).toHaveBeenCalledWith("http://localhost:3000/ALD_database/4");
  });

  test("deleteFacility returns null on failure", async () => {
    axios.delete.mockRejectedValue(new Error("Delete failed"));
    const data = await deleteFacility("4");
    expect(data).toBeNull();
  });

  // registerUser
  test("registerUser creates a new user", async () => {
    const mockResponse = { username: "test", email: "test@example.com" };
    axios.post.mockResolvedValue({ data: mockResponse });
    const data = await registerUser("test", "test@example.com", "pass");
    expect(data).toEqual(mockResponse);
    expect(axios.post).toHaveBeenCalledWith("http://localhost:3000/users", {
      username: "test",
      email: "test@example.com",
      password: "pass",
    });
  });

  test("registerUser throws error on failure", async () => {
    axios.post.mockRejectedValue(new Error("Register failed"));
    await expect(registerUser("test", "test@example.com", "pass")).rejects.toThrow("Register failed");
  });

  // loginUser
  test("loginUser logs in a user", async () => {
    const mockResponse = { username: "test", email: "test@example.com" };
    axios.post.mockResolvedValue({ data: mockResponse });
    const data = await loginUser("test", "pass");
    expect(data).toEqual(mockResponse);
    expect(axios.post).toHaveBeenCalledWith("http://localhost:3000/users/login", {
      identifier: "test",
      password: "pass",
    });
  });

  test("loginUser throws error on failure", async () => {
    axios.post.mockRejectedValue(new Error("Login failed"));
    await expect(loginUser("test", "pass")).rejects.toThrow("Login failed");
  });

  // updateUser
  test("updateUser updates user data", async () => {
    const mockResponse = { username: "newuser", email: "new@example.com" };
    axios.put.mockResolvedValue({ data: mockResponse });
    const data = await updateUser("test", "newuser", "new@example.com");
    expect(data).toEqual(mockResponse);
    expect(axios.put).toHaveBeenCalledWith("http://localhost:3000/users/test", {
      username: "newuser",
      email: "new@example.com",
    });
  });

  test("updateUser throws detailed error on failure", async () => {
    const errorResponse = { response: { data: { error: "Update failed" } } };
    axios.put.mockRejectedValue(errorResponse);
    await expect(updateUser("test", "newuser", "new@example.com")).rejects.toEqual("Update failed");
  });

  // deleteUser
  test("deleteUser deletes a user", async () => {
    const mockResponse = { message: "User deleted" };
    axios.delete.mockResolvedValue({ data: mockResponse });
    const data = await deleteUser("test", "pass");
    expect(data).toEqual(mockResponse);
    expect(axios.delete).toHaveBeenCalledWith("http://localhost:3000/users/test", {
      data: { password: "pass" },
    });
  });

  test("deleteUser throws error on failure", async () => {
    axios.delete.mockRejectedValue(new Error("Delete failed"));
    await expect(deleteUser("test", "pass")).rejects.toThrow("Delete failed");
  });

  // changePassword
  test("changePassword updates password", async () => {
    const mockResponse = { message: "Password changed" };
    axios.patch.mockResolvedValue({ data: mockResponse });
    const data = await changePassword("test", "oldpass", "newpass");
    expect(data).toEqual(mockResponse);
    expect(axios.patch).toHaveBeenCalledWith("http://localhost:3000/users/test/password", {
      currentPassword: "oldpass",
      newPassword: "newpass",
    });
  });

  test("changePassword throws detailed error on failure", async () => {
    const errorResponse = { response: { data: { error: "Change failed" } } };
    axios.patch.mockRejectedValue(errorResponse);
    await expect(changePassword("test", "oldpass", "newpass")).rejects.toEqual("Change failed");
  });

  // saveFacility
  test("saveFacility saves a facility", async () => {
    const mockResponse = { facilityId: "1" };
    axios.post.mockResolvedValue({ data: mockResponse });
    const data = await saveFacility("test", "1");
    expect(data).toEqual(mockResponse);
    expect(axios.post).toHaveBeenCalledWith("http://localhost:3000/users/test/saved-facilities", {
      facilityId: "1",
    });
  });

  test("saveFacility throws detailed error on failure", async () => {
    const errorResponse = { response: { data: { error: "Save failed" } } };
    axios.post.mockRejectedValue(errorResponse);
    await expect(saveFacility("test", "1")).rejects.toEqual("Save failed");
  });

  // removeSavedFacility
  test("removeSavedFacility removes a facility", async () => {
    const mockResponse = { message: "Removed" };
    axios.delete.mockResolvedValue({ data: mockResponse });
    const data = await removeSavedFacility("test", "1");
    expect(data).toEqual(mockResponse);
    expect(axios.delete).toHaveBeenCalledWith("http://localhost:3000/users/test/saved-facilities/1");
  });

  test("removeSavedFacility throws detailed error on failure", async () => {
    const errorResponse = { response: { data: { error: "Remove failed" } } };
    axios.delete.mockRejectedValue(errorResponse);
    await expect(removeSavedFacility("test", "1")).rejects.toEqual("Remove failed");
  });

  // getSavedFacilities
  test("getSavedFacilities retrieves saved facilities", async () => {
    const mockResponse = [{ id: "1", name: "Facility 1" }];
    axios.get.mockResolvedValue({ data: mockResponse });
    const data = await getSavedFacilities("test");
    expect(data).toEqual(mockResponse);
    expect(axios.get).toHaveBeenCalledWith("http://localhost:3000/users/test/saved-facilities");
  });

  test("getSavedFacilities throws detailed error on failure", async () => {
    const errorResponse = { response: { data: { error: "Fetch failed" } } };
    axios.get.mockRejectedValue(errorResponse);
    await expect(getSavedFacilities("test")).rejects.toEqual("Fetch failed");
  });

  // getFacilityByIdWithUpdate
  test("getFacilityByIdWithUpdate retrieves facility data", async () => {
    const mockResponse = { id: "1", name: "Facility 1" };
    axios.get.mockResolvedValue({ data: mockResponse });
    const data = await getFacilityByIdWithUpdate("1");
    expect(data).toEqual(mockResponse);
    expect(axios.get).toHaveBeenCalledWith("http://localhost:3000/ALD_database/1");
  });

  test("getFacilityByIdWithUpdate throws detailed error on failure", async () => {
    const errorResponse = { response: { data: { error: "Fetch failed" } } };
    axios.get.mockRejectedValue(errorResponse);
    await expect(getFacilityByIdWithUpdate("1")).rejects.toEqual("Fetch failed");
  });
});