describe('Booking Flow', () => {
  it('should complete a booking successfully', () => {
    cy.visit('/');
    
    // Fill in search form
    cy.get('input[name="checkIn"]').type('2024-01-15');
    cy.get('input[name="checkOut"]').type('2024-01-17');
    cy.get('select[name="guests"]').select('2');
    cy.get('button[type="submit"]').click();
    
    // Select a room
    cy.get('.room-card').first().click();
    
    // Fill booking form
    cy.get('input[name="guestName"]').type('John Doe');
    cy.get('input[name="guestEmail"]').type('john@example.com');
    cy.get('input[name="guestPhone"]').type('1234567890');
    cy.get('button[type="submit"]').click();
    
    // Verify success message
    cy.contains('Booking successful').should('be.visible');
  });
});