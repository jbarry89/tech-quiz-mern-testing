describe("Quiz App End-to-End Test", () => {
  it("Complete the Full function of the Quiz Game", () => {
    //Wait for API call to fetch the questions
    cy.intercept("GET", "/api/questions/random", (req) => {
      req.reply({ fixture: "questions.json" }); // randomly selects sample size of 10
    }).as("getQuestions");

    cy.visit("http://127.0.0.1:3001");

    // Starts the Quiz Game
    cy.contains("Start Quiz").click();
    cy.wait("@getQuestions").then((interception) => {
      expect(interception.response?.body).to.exist;
    });

    // Verified questions are display
    cy.get('h2').should('be.visible');

    // Simulate answering all questions
    cy.fixture('questions.json').then((questions) =>{
        questions.forEach(() => {
          const randomAnswerIndex = Cypress._.random(0, 3);
          cy.get('.btn.btn-primary').eq(randomAnswerIndex).click();
        });
    });

    // Verify quiz completion and score
    cy.contains('Quiz Completed').should('be.visible');
    cy.contains('Your score:').should('be.visible');

    
    // Verify the Quiz Game can restart
    cy.contains('Take New Quiz').click();
    cy.wait("@getQuestions");
    cy.get('h2').should('be.visible');

  });
});
