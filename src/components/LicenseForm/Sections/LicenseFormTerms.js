import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';
import { Field } from 'redux-form';

import {
  Accordion,
  Col,
  Label,
  Row,
} from '@folio/stripes/components';

import LicenseFormTermsList from '../../LicenseFormTermsList';

export default class LicenseFormTerms extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    onToggle: PropTypes.func,
    open: PropTypes.bool,
    parentResources: PropTypes.shape({
      terms: PropTypes.object,
    }),
  };

  state = {
    terms: [],
  }

  static getDerivedStateFromProps(props, state) {
    const terms = get(props.parentResources, ['terms', 'records'], []);
    if (terms.length !== state.terms.length) {
      return {
        terms: terms.map((term) => ({
          description: term.description,
          label: term.label,
          type: term.type,
          value: term.name,
        })),
      };
    }

    return null;
  }

  render() {
    return (
      <Accordion
        id={this.props.id}
        label={<FormattedMessage id="ui-licenses.section.terms" />}
        open={this.props.open}
        onToggle={this.props.onToggle}
      >
        <Row>
          <Col xs={5}>
            <Label tagName="span" required>
              <FormattedMessage id="ui-licenses.prop.termName" />
            </Label>
          </Col>
          <Col xs={6}>
            <Label tagName="span" required>
              <FormattedMessage id="ui-licenses.prop.termValue" />
            </Label>
          </Col>
          <Col xs={1}>
            <FormattedMessage id="stripes-core.button.delete" />
          </Col>
        </Row>
        <Field
          name="customProperties"
          component={LicenseFormTermsList}
          availableTerms={this.state.terms}
        />
      </Accordion>
    );
  }
}
