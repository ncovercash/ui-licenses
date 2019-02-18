import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FormattedMessage } from 'react-intl';
import {
  Accordion,
  Col,
  InfoPopover,
  Layout,
  Row
} from '@folio/stripes/components';

export default class LicenseTerms extends React.Component {
  static propTypes = {
    license: PropTypes.shape({ customProperties: PropTypes.object }),
    id: PropTypes.string,
    onToggle: PropTypes.func,
    open: PropTypes.bool,
    parentResources: PropTypes.shape({
      terms: PropTypes.object,
    })
  };

  renderTerm = (term, index) => {
    let value = get(this.props.license, ['customProperties', term.name, '0', 'value']);

    if (value === undefined) {
      if (term.default) value = <FormattedMessage id="ui-licenses.terms.notSet" />;
      else return null;
    }

    if (typeof value === 'object' && value.label) {
      value = value.label;
    }

    return (
      <Layout className="padding-top-gutter" key={index}>
        <Row>
          <Col xs={12} md={4}>
            {term.description ? <InfoPopover content={term.description} /> : null}
            <strong data-test-term-label={term.name}>{term.label}</strong>
          </Col>
          <Col xs={12} md={8}>
            <span data-test-term-value={term.name}>{value}</span>
          </Col>
        </Row>
      </Layout>
    );
  }

  renderTerms = () => {
    const terms = get(this.props.parentResources.terms, ['records'], []);
    return terms.map(this.renderTerm);
  }

  render() {
    const { id, license, onToggle, open } = this.props;
    if (!license.customProperties || Object.keys(license.customProperties).length === 0) return null;

    return (
      <Accordion
        id={id}
        label={<FormattedMessage id="ui-licenses.section.terms" />}
        open={open}
        onToggle={onToggle}
      >
        {this.renderTerms(license.customProperties)}
      </Accordion>
    );
  }
}
