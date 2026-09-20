import { colors } from "../src/utils/theme";

test("theme exposes a primary color", () => {
  expect(colors.primary).toBe("#0b6e4f");
});
