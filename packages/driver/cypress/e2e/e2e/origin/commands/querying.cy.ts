import { findCrossOriginLogs } from '../../../../support/utils'

context('cy.origin querying', () => {
  beforeEach(() => {
    cy.visit('/fixtures/primary-origin.html')
    cy.get('a[data-cy="dom-link"]').click()
  })

  it('.get()', () => {
    cy.origin('http://foobar.com:3500', () => {
      cy.get('#input')
    })
  })

  it('.contains()', () => {
    cy.origin('http://foobar.com:3500', () => {
      cy.contains('Nested Find')
    })
  })

  it('.within()', () => {
    cy.origin('http://foobar.com:3500', () => {
      cy.get('#by-id').within(() => {
        cy.get('#input')
      })
    })
  })

  it('.root()', () => {
    cy.origin('http://foobar.com:3500', () => {
      cy.root().should('match', 'html')
    })
  })

  context('cross-origin AUT errors', { defaultCommandTimeout: 50 }, () => {
    it('.get()', (done) => {
      cy.on('fail', (err) => {
        expect(err.message).to.include(`Timed out retrying after 50ms:`)
        expect(err.message).to.include(`The command was expected to run against origin \`http://localhost:3500\` but the application is at origin \`http://foobar.com:3500\`.`)
        expect(err.message).to.include(`This commonly happens when you have either not navigated to the expected origin or have navigated away unexpectedly.`)
        //  make sure that the secondary origin failures do NOT show up as spec failures or AUT failures
        expect(err.message).not.to.include(`The following error originated from your test code, not from Cypress`)
        expect(err.message).not.to.include(`The following error originated from your application code, not from Cypress`)
        done()
      })

      cy.get('#input')
    })

    it('.contains()', (done) => {
      cy.on('fail', (err) => {
        expect(err.message).to.include(`Timed out retrying after 50ms:`)
        expect(err.message).to.include(`The command was expected to run against origin \`http://localhost:3500\` but the application is at origin \`http://foobar.com:3500\`.`)
        expect(err.message).to.include(`This commonly happens when you have either not navigated to the expected origin or have navigated away unexpectedly.`)
        //  make sure that the secondary origin failures do NOT show up as spec failures or AUT failures
        expect(err.message).not.to.include(`The following error originated from your test code, not from Cypress`)
        expect(err.message).not.to.include(`The following error originated from your application code, not from Cypress`)
        done()
      })

      cy.contains('Nested Find')
    })

    it('.within()', (done) => {
      cy.on('fail', (err) => {
        expect(err.message).to.include(`Timed out retrying after 50ms:`)
        expect(err.message).to.include(`The command was expected to run against origin \`http://localhost:3500\` but the application is at origin \`http://foobar.com:3500\`.`)
        expect(err.message).to.include(`This commonly happens when you have either not navigated to the expected origin or have navigated away unexpectedly.`)
        //  make sure that the secondary origin failures do NOT show up as spec failures or AUT failures
        expect(err.message).not.to.include(`The following error originated from your test code, not from Cypress`)
        expect(err.message).not.to.include(`The following error originated from your application code, not from Cypress`)
        done()
      })

      cy.get('#by-id').within(() => {
        cy.get('#input')
      })
    })

    it('.root()', (done) => {
      cy.on('fail', (err) => {
        expect(err.message).to.include(`Timed out retrying after 50ms:`)
        expect(err.message).to.include(`The command was expected to run against origin \`http://localhost:3500\` but the application is at origin \`http://foobar.com:3500\`.`)
        expect(err.message).to.include(`This commonly happens when you have either not navigated to the expected origin or have navigated away unexpectedly.`)
        //  make sure that the secondary origin failures do NOT show up as spec failures or AUT failures
        expect(err.message).not.to.include(`The following error originated from your test code, not from Cypress`)
        expect(err.message).not.to.include(`The following error originated from your application code, not from Cypress`)
        done()
      })

      cy.root().should('match', 'html')
    })

    it('does not get elements in the runner', (done) => {
      cy.on('fail', (err) => {
        expect(err.message).to.include(`Timed out retrying after 50ms:`)
        expect(err.message).to.include(`The command was expected to run against origin \`http://localhost:3500\` but the application is at origin \`http://foobar.com:3500\`.`)
        expect(err.message).to.include(`This commonly happens when you have either not navigated to the expected origin or have navigated away unexpectedly.`)
        //  make sure that the secondary origin failures do NOT show up as spec failures or AUT failures
        expect(err.message).not.to.include(`The following error originated from your test code, not from Cypress`)
        expect(err.message).not.to.include(`The following error originated from your application code, not from Cypress`)
        done()
      })

      cy.get('h1')
    })

    it('does not contain elements in the runner', (done) => {
      cy.on('fail', (err) => {
        expect(err.message).to.include(`Timed out retrying after 50ms:`)
        expect(err.message).to.include(`The command was expected to run against origin \`http://localhost:3500\` but the application is at origin \`http://foobar.com:3500\`.`)
        expect(err.message).to.include(`This commonly happens when you have either not navigated to the expected origin or have navigated away unexpectedly.`)
        //  make sure that the secondary origin failures do NOT show up as spec failures or AUT failures
        expect(err.message).not.to.include(`The following error originated from your test code, not from Cypress`)
        expect(err.message).not.to.include(`The following error originated from your application code, not from Cypress`)
        done()
      })

      cy.contains('SpecRunner')
    })
  })

  context('#consoleProps', () => {
    let logs: Map<string, any>

    beforeEach(() => {
      logs = new Map()

      cy.on('log:changed', (attrs, log) => {
        logs.set(attrs.id, log)
      })
    })

    it('.contains()', () => {
      cy.origin('http://foobar.com:3500', () => {
        cy.contains('Nested Find')
      })

      cy.shouldWithTimeout(() => {
        // in the case of some firefox browsers, the document state is left in a cross origin context when running these assertions
        // set to  context to undefined to run the assertions
        if (Cypress.isBrowser('firefox')) {
          cy.state('document', undefined)
        }

        const { consoleProps } = findCrossOriginLogs('contains', logs, 'foobar.com')

        expect(consoleProps.Command).to.equal('contains')
        expect(consoleProps['Applied To']).to.be.undefined
        expect(consoleProps.Elements).to.equal(1)
        expect(consoleProps.Content).to.equal('Nested Find')
        expect(consoleProps.Yielded).to.have.property('tagName').that.equals('DIV')
        expect(consoleProps.Yielded).to.have.property('id').that.equals('nested-find')
      })
    })

    it('.within()', () => {
      cy.origin('http://foobar.com:3500', () => {
        cy.get('#by-id').within(() => {
          cy.get('#input')
        })
      })

      cy.shouldWithTimeout(() => {
        // in the case of some firefox browsers, the document state is left in a cross origin context when running these assertions
        // set to  context to undefined to run the assertions
        if (Cypress.isBrowser('firefox')) {
          cy.state('document', undefined)
        }

        const { consoleProps } = findCrossOriginLogs('within', logs, 'foobar.com')

        expect(consoleProps.Command).to.equal('within')
        expect(consoleProps.Yielded).to.have.property('tagName').that.equals('FORM')
        expect(consoleProps.Yielded).to.have.property('id').that.equals('by-id')
      })
    })

    it('.root()', () => {
      cy.origin('http://foobar.com:3500', () => {
        cy.root()
      })

      cy.shouldWithTimeout(() => {
        const { consoleProps } = findCrossOriginLogs('root', logs, 'foobar.com')

        expect(consoleProps.Command).to.equal('root')
        expect(consoleProps.Yielded).to.have.property('tagName').that.equals('HTML')
      })
    })
  })
})
