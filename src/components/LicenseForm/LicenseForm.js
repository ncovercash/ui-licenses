import React from 'react';
import PropTypes from 'prop-types';

import {
  AccordionSet,
  Col,
  ExpandAllButton,
  Row
} from '@folio/stripes/components';

import {
  LicenseFormInfo,
  LicenseFormCoreDocs,
  LicenseFormTerms,
  LicenseFormSupplement,
} from './sections';

import css from './LicenseForm.css';

class LicenseForm extends React.Component {
  static propTypes = {
    parentMutator: PropTypes.object,
    parentResources: PropTypes.object,
  }

  state = {
    sections: {
      licenseFormInfo: true,
      licenseFormDocs: false,
      licenseFormTerms: false,
      licenseFormSupplement: false
    }
  }

  getSectionProps() {
    return {
      onToggle: this.handleSectionToggle,
      parentResources: this.props.parentResources,
      parentMutator: this.props.parentMutator,
    };
  }

  handleSectionToggle = ({ id }) => {
    this.setState((prevState) => ({
      sections: {
        ...prevState.sections,
        [id]: !prevState.sections[id],
      }
    }));
  }

  handleAllSectionsToggle = (sections) => {
    this.setState({ sections });
  }

  render() {
    const sectionProps = this.getSectionProps();
    const { sections } = this.state;

    return (
      <div className={css.licenseForm}>
        <AccordionSet>
          <Row end="xs">
            <Col xs>
              <ExpandAllButton
                accordionStatus={sections}
                onToggle={this.handleAllSectionsToggle}
              />
            </Col>
          </Row>
          <LicenseFormInfo id="licenseFormInfo" open={sections.licenseFormInfo} {...sectionProps} />
          <LicenseFormCoreDocs id="licenseFormDocs" open={sections.licenseFormDocs} {...sectionProps} />
          <LicenseFormTerms id="licenseFormTerms" open={sections.licenseFormTerms} {...sectionProps} />
          <LicenseFormSupplement id="licenseFormSupplement" open={sections.licenseFormSupplement} {...sectionProps} />
        </AccordionSet>
      </div>
    );
  }
}

export default LicenseForm;
