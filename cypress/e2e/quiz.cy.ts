describe("Quiz App End-to-End Test", () => {
  it("Complete the Full function of the Quiz Game", () => {
    cy.fixture("questions.json").then((questions) => {
      // Shuffle and pick 10 random questions
      const randomQuestions = Cypress._.sampleSize(questions, 10);

      //Wait for API call to fetch the questions
      cy.intercept("GET", "/api/questions/random", (req) => {
        req.reply(randomQuestions); // randomly selects sample size of 10
      }).as("getQuestions");
    });

    cy.visit("http://127.0.0.1:3001/");

    // Starts the Quiz Game
    cy.contains("Start Quiz", { timeout: 5000 }).should("be.visible").click();
    cy.wait("@getQuestions", { timeout: 5000 }).then((interception) => {
      expect(interception.response?.body).to.exist;
      expect(interception.response?.body).to.have.length(10); // Expecting 10 questions
      
      // Verified questions are display
      cy.get("h2", { timeout: 5000 }).should("be.visible");
      
      // Simulate answering all questions
      interception.response?.body.forEach(() => {
          const randomAnswerIndex = Cypress._.random(0, 3);
          cy.get(".btn.btn-primary", {timeout: 5000}).should("be.visible").eq(randomAnswerIndex).click();
        });
        
    });

    // Verify quiz completion and score
    cy.contains("Quiz Completed").should("be.visible");
    cy.contains("Your score:").should("be.visible");

    // Verify the Quiz Game can restart
    cy.contains("Take New Quiz").click();
    cy.wait("@getQuestions");
    cy.get("h2").should("be.visible");
  });
});
