/* global describe, it, before, after, Nightmare */

const generateNumber = () => Math.round(Math.random() * 100000);

module.exports.test = (uiTestCtx,
  {
    docs, editedDoc, deletedDoc, docsFieldName
  }) => {
  describe(`ui-licenses: set docs: "${docs.map(d => d.name).join(', ')}"`, function test() {
    const { config, helpers: { login, logout } } = uiTestCtx;
    let docType = 'licenseFormDocs';
    if (docsFieldName === 'supplementaryDocs') {
      docType = 'licenseFormSupplement';
    }
    const nightmare = new Nightmare(config.nightmare);

    this.timeout(Number(config.test_timeout));

    describe('login > open licenses > create license > edit docs > logout', () => {
      before((done) => {
        login(nightmare, config, done);
      });

      after((done) => {
        logout(nightmare, config, done);
      });

      it('should navigate to create license page and expand docs section', done => {
        const name = `Docs License #${generateNumber()}`;

        console.log(`\tCreating ${name}`);

        nightmare
          .wait('#app-list-item-clickable-licenses-module')
          .click('#app-list-item-clickable-licenses-module')
          .wait('#licenses-module-display')
          .wait('#clickable-newlicense')
          .click('#clickable-newlicense')

          .waitUntilNetworkIdle(2000) // Wait for the default values to be fetched and set.

          .insert('#edit-license-name', name)
          .click(`#accordion-toggle-button-${docType}`)
          .then(done)
          .catch(done);
      });

      docs.forEach((doc, row) => {
        it(`should add doc ${doc.name}`, done => {
          let chain = nightmare
            .click(`#add-${docsFieldName}-btn`)
            .insert(`#${docsFieldName}-name-${row}`, doc.name);
          if (doc.category) {
            chain = chain
              .type(`#${docsFieldName}-category-${row}`, doc.category);
          }
          chain
            .insert(`#${docsFieldName}-note-${row}`, doc.note)
            .insert(`#${docsFieldName}-location-${row}`, doc.location)
            .insert(`#${docsFieldName}-url-${row}`, doc.url)
            .then(done)
            .catch(done);
        });
      });

      it('should create license', done => {
        nightmare
          .click('#clickable-createlicense')
          .waitUntilNetworkIdle(2000) // Wait for record to be fetched
          .then(done)
          .catch(done);
      });

      docs.forEach(doc => {
        it(`should find "${doc.name}" in docs list`, done => {
          nightmare
            .evaluate(d => {
              const docCard = document.querySelector(`[data-test-doc="${d.name}"]`);
              if (!docCard) {
                throw Error(`Could not find doc card with a doc named ${d.name}`);
              }
              const name = docCard.querySelector('[data-test-doc-name]').innerText;
              if (name !== d.name) {
                throw Error(`Expected name to be ${d.name} and found ${name}.`);
              }

              if (d.category) {
                const category = docCard.querySelector('[data-test-doc-category]').innerText;
                if (category !== d.category) {
                  throw Error(`Expected category to be ${d.category} and found ${category}.`);
                }
              }

              if (d.note) {
                const note = docCard.querySelector('[data-test-doc-note]').innerText;
                if (note !== d.note) {
                  throw Error(`Expected note to be ${d.note} and found ${note}.`);
                }
              }

              if (d.location) {
                const location = docCard.querySelector('[data-test-doc-location]').innerText;
                if (location !== d.location) {
                  throw Error(`Expected location to be ${d.location} and found ${location}.`);
                }
              }

              if (d.url) {
                const url = docCard.querySelector('[data-test-doc-url]').innerText;
                if (url !== d.url) {
                  throw Error(`Expected url to be ${d.url} and found ${url}.`);
                }

                const href = docCard.querySelector('[data-test-doc-url]').href;
                if (href !== d.url) {
                  throw Error(`Expected url href to be ${d.url} and found ${href}.`);
                }
              }
            }, doc)
            .then(done)
            .catch(done);
        });
      });

      it('should open edit license', done => {
        nightmare
          .click('[class*=paneHeader] [class*=dropdown] button')
          .wait('#clickable-edit-license')
          .click('#clickable-edit-license')
          .wait('#licenseFormInfo')
          .click(`#accordion-toggle-button-${docType}`)
          .waitUntilNetworkIdle(2000)
          .then(done)
          .catch(done);
      });

      docs.forEach(doc => {
        it(`should find correctly loaded values for ${doc.name}`, done => {
          nightmare
            .evaluate((d, field) => {
              const nameElements = [...document.querySelectorAll(`[id^=${field}-name-]`)];
              const nameElement = nameElements.find(e => e.value === d.name);
              if (!nameElement) {
                throw Error(`Failed to find doc name text field with loaded value of ${d.name}`);
              }

              if (d.category) {
                const categoryElements = [...document.querySelectorAll(`[id^=${field}-category-]`)];
                const categoryElement = categoryElements.find(e => e.value == d.category); // eslint-disable-line eqeqeq
                if (!categoryElement) {
                  throw Error(`Failed to find doc category field with loaded value of ${d.category}`);
                }
              }

              if (d.note) {
                const noteElements = [...document.querySelectorAll(`[id^=${field}-note-]`)];
                const noteElement = noteElements.find(e => e.value == d.note); // eslint-disable-line eqeqeq
                if (!noteElement) {
                  throw Error(`Failed to find doc note text field with loaded value of ${d.note}`);
                }
              }

              if (d.location) {
                const locationElements = [...document.querySelectorAll(`[id^=${field}-location-]`)];
                const locationElement = locationElements.find(e => e.value == d.location); // eslint-disable-line eqeqeq
                if (!locationElement) {
                  throw Error(`Failed to find doc location text field with loaded value of ${d.location}`);
                }
              }

              if (d.url) {
                const urlElements = [...document.querySelectorAll(`[id^=${field}-url-]`)];
                const urlElement = urlElements.find(e => e.value == d.url); // eslint-disable-line eqeqeq
                if (!urlElement) {
                  throw Error(`Failed to find doc url text field with loaded value of ${d.url}`);
                }
              }
            }, doc, docsFieldName)
            .then(done)
            .catch(done);
        });
      });

      if (editedDoc) {
        it(`should edit license with changed doc ${editedDoc.name}`, done => {
          nightmare
            .evaluate((d, field) => {
              const nameElements = [...document.querySelectorAll(`[id^=${field}-name-]`)];
              const index = nameElements.findIndex(e => e.value === d.docToEdit);
              if (index === -1) {
                throw Error(`Failed to find doc name text field with loaded value of ${d.docToEdit}`);
              }

              return index;
            }, editedDoc, docsFieldName)
            .then(row => {
              let chain = nightmare
                .insert(`#${docsFieldName}-name-${row}`, '')
                .insert(`#${docsFieldName}-name-${row}`, editedDoc.name);
              if (editedDoc.category) {
                chain = chain
                  .type(`#${docsFieldName}-category-${row}`, '')
                  .type(`#${docsFieldName}-category-${row}`, editedDoc.category);
              }
              chain
                .insert(`#${docsFieldName}-note-${row}`, '')
                .insert(`#${docsFieldName}-note-${row}`, editedDoc.note)
                .insert(`#${docsFieldName}-location-${row}`, '')
                .insert(`#${docsFieldName}-location-${row}`, editedDoc.location)
                .insert(`#${docsFieldName}-url-${row}`, '')
                .insert(`#${docsFieldName}-url-${row}`, editedDoc.url);
            })
            .then(done)
            .catch(done);
        });
      }

      /* if (editedDoc) {
        it(`should edit license with changed doc ${editedDoc.name}`, done => {
        //  nightmare
          let chain = nightmare
            .evaluate((d, field) => {
              const nameElements = [...document.querySelectorAll(`[id^=${field}-name-]`)];
              const index = nameElements.findIndex(e => e.value === d.docToEdit);
              if (index === -1) {
                throw Error(`Failed to find doc name text field with loaded value of ${d.docToEdit}`);
              }

              return index;
            }, editedDoc, docsFieldName)
          if (docsFieldName === 'supplementaryDocs') {
            //  let chain = nightmare
            chain = chain
              .then(row => {
                return nightmare
                  .insert(`#${docsFieldName}-name-${row}`, '')
                  .insert(`#${docsFieldName}-name-${row}`, editedDoc.name)
                  .type(`#${docsFieldName}-category-${row}`, editedDoc.category)
                  .insert(`#${docsFieldName}-note-${row}`, '')
                  .insert(`#${docsFieldName}-note-${row}`, editedDoc.note)
                  .insert(`#${docsFieldName}-location-${row}`, '')
                  .insert(`#${docsFieldName}-location-${row}`, editedDoc.location)
                  .insert(`#${docsFieldName}-url-${row}`, '')
                  .insert(`#${docsFieldName}-url-${row}`, editedDoc.url);
              });
          } else {
            chain = chain
              .then(row => {
                return nightmare
                  .insert(`#${docsFieldName}-name-${row}`, '')
                  .insert(`#${docsFieldName}-name-${row}`, editedDoc.name)
                  .insert(`#${docsFieldName}-note-${row}`, '')
                  .insert(`#${docsFieldName}-note-${row}`, editedDoc.note)
                  .insert(`#${docsFieldName}-location-${row}`, '')
                  .insert(`#${docsFieldName}-location-${row}`, editedDoc.location)
                  .insert(`#${docsFieldName}-url-${row}`, '')
                  .insert(`#${docsFieldName}-url-${row}`, editedDoc.url);
              });
          }
          chain
            .then(done)
            .catch(done);
        });
      } */

      if (deletedDoc) {
        it(`should delete doc ${deletedDoc}`, done => {
          nightmare
            .evaluate((d, field) => {
              const nameElements = [...document.querySelectorAll(`[id^=${field}-name-]`)];
              const index = nameElements.findIndex(e => e.value === d);
              if (index === -1) {
                throw Error(`Failed to find doc name text field with loaded value of ${d}`);
              }

              return index;
            }, deletedDoc, docsFieldName)
            .then(row => nightmare.click(`#${docsFieldName}-delete-${row}`))
            .then(done)
            .catch(done);
        });
      }

      it('should save updated license', done => {
        nightmare
          .click('#clickable-updatelicense')
          .waitUntilNetworkIdle(2000) // Wait for record to be fetched
          .then(done)
          .catch(done);
      });

      if (editedDoc) {
        it(`should find "${editedDoc.name}" in docs list with updated values`, done => {
          nightmare
            .evaluate(d => {
              const docCard = document.querySelector(`[data-test-doc="${d.name}"]`);
              if (!docCard) {
                throw Error(`Could not find doc card with a doc named ${d.name}`);
              }
              const name = docCard.querySelector('[data-test-doc-name]').innerText;
              if (name !== d.name) {
                throw Error(`Expected name to be ${d.name} and found ${name}.`);
              }

              if (d.category) {
                const category = docCard.querySelector('[data-test-doc-category]').innerText;
                if (category !== d.category) {
                  throw Error(`Expected category to be ${d.category} and found ${category}.`);
                }
              }

              if (d.note) {
                const note = docCard.querySelector('[data-test-doc-note]').innerText;
                if (note !== d.note) {
                  throw Error(`Expected note to be ${d.note} and found ${note}.`);
                }
              }

              if (d.location) {
                const location = docCard.querySelector('[data-test-doc-location]').innerText;
                if (location !== d.location) {
                  throw Error(`Expected location to be ${d.location} and found ${location}.`);
                }
              }

              if (d.url) {
                const url = docCard.querySelector('[data-test-doc-url]').innerText;
                if (url !== d.url) {
                  throw Error(`Expected url to be ${d.url} and found ${url}.`);
                }

                const href = docCard.querySelector('[data-test-doc-url]').href;
                if (href !== d.url) {
                  throw Error(`Expected url href to be ${d.url} and found ${href}.`);
                }
              }
            }, editedDoc)
            .then(done)
            .catch(done);
        });
      }

      if (deletedDoc) {
        it(`should NOT find "${deletedDoc}" in docs list`, done => {
          nightmare
            .evaluate(d => {
              const docCard = document.querySelector(`[data-test-doc="${d}"]`);
              if (docCard) {
                throw Error(`Found a doc named ${d} when it should have been deleted.`);
              }
              return docCard;
            }, deletedDoc)
            .then(done)
            .catch(done);
        });
      }
    });
  });
};
