import { suite } from '../utils/suite'

suite('vuex tab', () => {
  it('should update state', () => {
    cy.get('.vuex-tab').click()
    // using the decrease button
    cy.get('.data-field').eq(0).click()
      .find('.actions .vue-ui-button').eq(1)
      .click({force: true})
      .click({force: true})

    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('-2')
    })

    // using the increase button
    cy.get('.data-field').eq(0).click()
      .find('.actions .vue-ui-button').eq(2)
      .click({force: true})
      .click({force: true})

    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('0')
    })

    // using the edit input
    cy.get('.data-field').eq(0).click()
      .find('.actions .vue-ui-button').eq(0).click({force: true})
    cy.get('.edit-input').type('12')
    cy.get('.edit-overlay > .actions > :nth-child(2) > .content > .vue-ui-icon').click()

    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('12')
    })

    // change count back to 1
    cy.get('.data-field').eq(0).click()
      .find('.actions .vue-ui-button').eq(0).click({force: true})
    cy.get('.edit-input').type('0')
    cy.get('.edit-overlay > .actions > :nth-child(2) > .content > .vue-ui-icon').click()

    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('0')
    })
  })

  it('should display mutations history', () => {
    cy.get('#target').iframe().then(({ get }) => {
      get('.increment')
        .click({ force: true })
        .click({ force: true })
      get('.decrement').click({ force: true })
      get('#counter p').contains('1')
    })
    cy.get('.vuex-tab').click()
    cy.get('.history .entry').should('have.length', 4)
    cy.get('[data-id="load-vuex-state"]').click()
    cy.get('.recording-vuex-state').should('not.be.visible')
    cy.get('.loading-vuex-state').should('not.be.visible')
    cy.get('.vuex-state-inspector').then(el => {
      expect(el.text()).to.include('type:"DECREMENT"')
      expect(el.text()).to.include('count:1')
    })
    cy.get('.history .entry').eq(3).should('have.class', 'inspected').should('have.class', 'active')
  })

  it('should filter state & getters', () => {
    cy.get('.right .search input').clear().type('cou')
    cy.get('.data-field').should('have.length', 1)
    cy.get('.right .search input').clear().type('no value')
    cy.get('.data-field').should('have.length', 0)
    cy.get('.right .search input').clear()
  })

  it('should filter history', () => {
    cy.get('.left .search input').clear().type('inc')
    cy.get('.history .entry[data-active="true"]').should('have.length', 2)
    cy.get('.history .entry[data-active="true"].inspected').should('have.length', 0)
    cy.get('.history .entry[data-active="true"].active').should('have.length', 0)

    cy.get('.left .search input').clear().type('/dec/i')
    cy.get('.history .entry[data-active="true"]').should('have.length', 1)
    cy.get('.history .entry[data-active="true"].inspected').should('have.length', 0)
    cy.get('.history .entry[data-active="true"].active').should('have.length', 0)

    cy.get('.left .search input').clear().type('/dec)/i')
    cy.get('.history .entry[data-active="true"]').should('have.length', 3)
    cy.get('.history .entry[data-active="true"].inspected').should('have.length', 0)
    cy.get('.history .entry[data-active="true"].active').should('have.length', 1)

    cy.get('.left .search input').clear()
  })

  it('should inspect state', () => {
    cy.get('.history .entry .mutation-type').eq(2).click()
    cy.get('.history .entry').eq(2)
      .should('have.class', 'inspected')
      .should('not.have.class', 'active')
    cy.get('.recording-vuex-state').should('not.be.visible')
    cy.get('.loading-vuex-state').should('not.be.visible')
    cy.get('.vuex-state-inspector').then(el => {
      expect(el.text()).to.include('type:"INCREMENT"')
      expect(el.text()).to.include('count:2')
    })
    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('1')
    })
  })

  it('should time-travel', () => {
    cy.get('.history .entry[data-index="2"] .entry-actions .action:nth-child(3)').click({ force: true })
    cy.get('.history .entry[data-index="2"]')
      .should('have.class', 'inspected')
      .should('have.class', 'active')
    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('2')
    })

    cy.get('.history .entry[data-index="1"] .mutation-type').click({ force: true })
    cy.get('.history .entry[data-index="1"]')
      .should('have.class', 'inspected')
      .should('not.have.class', 'active')
    cy.get('.history .entry[data-index="2"]')
      .should('not.have.class', 'inspected')
      .should('have.class', 'active')
    cy.get('.recording-vuex-state').should('not.be.visible')
    cy.get('.loading-vuex-state').should('not.be.visible')
    cy.get('.recording-vuex-state').should('not.be.visible')
    cy.get('.vuex-state-inspector').then(el => {
      expect(el.text()).to.include('type:"INCREMENT"')
      expect(el.text()).to.include('count:1')
    })
    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('2')
    })
    cy.get('.history .entry[data-index="1"] .entry-actions .action:nth-child(3)').click({ force: true })
    cy.get('.history .entry[data-index="1"]')
      .should('have.class', 'inspected')
      .should('have.class', 'active')
    cy.get('.history .entry[data-index="2"]')
      .should('not.have.class', 'inspected')
      .should('not.have.class', 'active')
    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('1')
    })

    // Base state
    cy.get('.history .entry[data-index="0"] .mutation-type').click({ force: true })
    cy.get('.history .entry[data-index="0"]')
      .should('have.class', 'inspected')
      .should('not.have.class', 'active')
    cy.get('.vuex-state-inspector').then(el => {
      expect(el.text()).to.include('count:0')
    })
    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('1')
    })
    cy.get('.history .entry[data-index="0"] .entry-actions .action:nth-child(1)').click({ force: true })
    cy.get('.history .entry[data-index="0"]')
      .should('have.class', 'inspected')
      .should('have.class', 'active')
    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('0')
    })
  })

  it('should revert', () => {
    cy.get('.history .entry[data-index="3"] .mutation-type').click({ force: true })
    cy.get('.history .entry[data-index="3"]').find('.action:nth-child(2)').click({ force: true })
    cy.get('.history .entry[data-active="true"]').should('have.length', 3)
    cy.get('.history .entry[data-index="2"]')
      .should('have.class', 'inspected')
      .should('have.class', 'active')
    cy.get('.vuex-state-inspector').then(el => {
      expect(el.text()).to.include('count:2')
    })
    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('2')
    })
  })

  it('should commit', () => {
    cy.get('.history .entry[data-index="2"] .mutation-type').click({ force: true })
    cy.get('.history .entry[data-index="2"] .action:nth-child(1)').click({ force: true })
    cy.get('.history .entry[data-active="true"]').should('have.length', 1)
    cy.get('.history .entry[data-index="0"]')
      .should('have.class', 'inspected')
      .should('have.class', 'active')
    cy.get('.vuex-state-inspector').then(el => {
      expect(el.text()).to.include('count:2')
    })
    cy.get('#target').iframe().then(({ get }) => {
      get('#counter p').contains('2')
    })
  })

  it('should display getters', () => {
    cy.get('.vuex-state-inspector').then(el => {
      expect(el.text()).to.include('isPositive:true')
    })
    cy.get('#target').iframe().then(({ get }) => {
      get('.decrement')
        .click({ force: true })
        .click({ force: true })
        .click({ force: true })
    })
    cy.get('.history .entry[data-index="3"]').click({ force: true })
    cy.get('.recording-vuex-state').should('not.be.visible')
    cy.get('.loading-vuex-state').should('not.be.visible')
    cy.get('.vuex-state-inspector').then(el => {
      expect(el.text()).to.include('isPositive:false')
    })
  })

  it('should toggle recording', () => {
    cy.get('.toggle-recording')
      .click()
      .contains('Paused')
    cy.get('.toggle-recording .svg-icon').should('not.have.class', 'enabled')
    // should not record
    cy.get('#target').iframe().then(({ get }) => {
      get('.increment').click({ force: true })
    })
    cy.get('.history .entry').should('have.length', 4)
  })

  it('should copy vuex state', () => {
    cy.get('.export').click()
    cy.get('.export .message')
      .contains('(Copied to clipboard!)')
      .should('not.be.visible', { timeout: 3000 })
  })

  it('should import vuex state', () => {
    cy.get('.import').click()
    cy.get('.import-state').should('be.visible')
    cy.get('.import-state textarea').clear().type('{{}invalid: json}')
    cy.get('.message.invalid-json').should('be.visible')
    cy.get('.import-state textarea').clear().type('{{}"count":42,"date":"[native Date Fri Dec 22 2017 10:12:04 GMT+0100 (CET)]"}')
    cy.wait(500)
    cy.get('.message.invalid-json').should('not.be.visible')
    cy.get('.vuex-state-inspector').then(el => {
      expect(el.text()).to.include('count:42')
      expect(el.text()).to.include('date:' + new Date('Fri Dec 22 2017 10:12:04 GMT+0100 (CET)'))
    })
    cy.get('.import').click()
    cy.get('.import-state').should('not.be.visible')
  })
})
