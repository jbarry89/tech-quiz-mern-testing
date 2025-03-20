import Quiz from "../../client/src/components/Quiz";
import questions from "../fixtures/questions.json";

describe('<Quiz /> Component Test', () => {
  let randomQuestions: typeof questions = [];
  beforeEach(() => {
     // Intercept the API request and use the questions.json fixture to mock the response
     cy.intercept('GET', '/api/questions/random', (req) => {
        randomQuestions = Cypress._.sampleSize(questions, 10); // randomly selects sample size of 10
        req.reply({ body: randomQuestions });
     }).as('getQuestions');
  });

  it('should start the quiz and display the first question', () => {
    cy.mount(<Quiz />);
    cy.contains('Start Quiz').click();
    cy.wait('@getQuestions').then((interception) => {
        const typedQuestions = interception.response?.body as typeof questions;
        expect(typedQuestions).to.have.length(10);
        cy.contains(typedQuestions[0].question).should('be.visible');
    });
  });

  it('should display "Quiz Completed" after answering all 10 questions', () => {
    cy.mount(<Quiz />);
    cy.contains('Start Quiz').click();
    cy.wait('@getQuestions').then((interception) => {
        const typedQuestions = interception.response?.body as typeof questions;
  
        typedQuestions.forEach((question) => {
          const answersLength = question.answers.length;
          const randomAnswerIndex = Cypress._.random(0, answersLength - 1);
          cy.get('.btn.btn-primary').eq(randomAnswerIndex).click(); // Simulate answering
        });
  
        // Verify Quiz is completed message and score message displayed
        cy.contains('Quiz Completed').should('be.visible');
        cy.contains('Your score: ').should('be.visible');
    });

  });


  it('should restart the quiz when "Take New Quiz" is clicked', () => {
    cy.mount(<Quiz />);
    cy.contains('Start Quiz').click();
    cy.wait('@getQuestions').then((interception) => {
        const typedQuestions = interception.response?.body as typeof questions;
        
        typedQuestions.forEach((question) => {
            const answersLength = question.answers.length;
            const randomAnswerIndex = Cypress._.random(0, answersLength - 1);
            cy.get('.btn.btn-primary').eq(randomAnswerIndex).click(); // Simulate answering
          });
  
        cy.contains('Take New Quiz').click();
        cy.wait('@getQuestions').then((interception) => {
            const typedQuestions = interception.response?.body as typeof questions;
            expect(typedQuestions).to.have.length(10);
            cy.contains(typedQuestions[0].question).should('be.visible');
        });
      });
  
   });

   it('should display the correct score at the end of the quiz', () => {
    cy.mount(<Quiz />);
    cy.contains('Start Quiz').click();
    cy.wait('@getQuestions').then((interception) => {
        const typedQuestions = interception.response?.body as typeof questions;
        let correctAnswersCount = 0;

        typedQuestions.forEach((question) => {
            const answersLength = question.answers.length;
            const randomAnswerIndex = Cypress._.random(0, answersLength - 1);
            const correctAnswerIndex = question.answers.findIndex((answer) => answer.isCorrect);
            cy.get('.btn.btn-primary').eq(randomAnswerIndex).click(); // Simulate answering
          
            if(correctAnswerIndex === randomAnswerIndex){
                correctAnswersCount++;
            }
        
        });
        
        cy.contains('Quiz Completed').should('be.visible');
        cy.contains(`Your score: ${correctAnswersCount}/${typedQuestions.length}`).should('be.visible');
        
    });

   });

});
