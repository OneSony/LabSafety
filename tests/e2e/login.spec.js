describe("Login Page", () => {
  it("logs in successfully with correct credentials", () => {
    cy.visit("/login");
    cy.get('input[placeholder="Username"]').type("admin");
    cy.get('input[placeholder="Password"]').type("password");
    cy.get("button").click();
    cy.on("window:alert", (txt) => {
      expect(txt).to.contains("Login Successful");
    });
  });

  it("shows error for incorrect credentials", () => {
    cy.visit("/login");
    cy.get('input[placeholder="Username"]').type("wrong");
    cy.get('input[placeholder="Password"]').type("wrong");
    cy.get("button").click();
    cy.on("window:alert", (txt) => {
      expect(txt).to.contains("Login Failed");
    });
  });
});
