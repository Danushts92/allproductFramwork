import { test, expect } from "../../../../shared/fixtures/base.fixture";
import { RegistrationPage } from "../../pages/registration.page";

const validUser = {
  fullName: "Jane Doe",
  email: "jane.doe@example.com",
  password: "Str0ngPass!",
  country: "Germany",
  acceptTerms: true,
};

test.describe("Demo Form — Registration", () => {
  let form: RegistrationPage;

  test.beforeEach(async ({ page }) => {
    form = new RegistrationPage(page);
    await form.open();
  });

  test("page loads with empty form", async () => {
    await expect(form.heading).toBeVisible();
    await expect(form.fullNameInput).toBeEmpty();
    await expect(form.emailInput).toBeEmpty();
    await expect(form.termsCheckbox).not.toBeChecked();
  });

  test("user can register with valid data", async () => {
    await form.fill(validUser);
    await form.submit();
    await expect(form.successMessage).toHaveText("Welcome, Jane Doe! Registration successful.");
  });

  test("shows errors when submitting an empty form", async () => {
    await form.submit();
    await expect(form.fullNameError).toHaveText("Full name is required");
    await expect(form.emailError).toHaveText("Enter a valid email");
    await expect(form.passwordError).toHaveText("Password must be at least 8 characters");
    await expect(form.termsError).toHaveText("You must accept the terms");
    await expect(form.successMessage).toBeEmpty();
  });

  test("rejects an invalid email", async () => {
    await form.fill({ ...validUser, email: "not-an-email" });
    await form.submit();
    await expect(form.emailError).toHaveText("Enter a valid email");
    await expect(form.successMessage).toBeEmpty();
  });

  test("rejects a short password", async () => {
    await form.fill({ ...validUser, password: "short" });
    await form.submit();
    await expect(form.passwordError).toHaveText("Password must be at least 8 characters");
  });

  test("reset clears the form", async () => {
    await form.fill(validUser);
    await form.reset();
    await expect(form.fullNameInput).toBeEmpty();
    await expect(form.emailInput).toBeEmpty();
    await expect(form.countrySelect).toHaveValue("");
    await expect(form.termsCheckbox).not.toBeChecked();
  });
});
