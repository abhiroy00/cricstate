import { colors } from "../src/utils/theme";

test("theme exposes a primary color", () => {
  expect(colors.primary).toBe("#E01A22");
});
