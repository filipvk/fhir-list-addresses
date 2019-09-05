const _ = require('lodash');
const fhirListAddresses = require('../index');
const practitioner = require('../fixtures/practitioner');
const expect = require('chai').expect;

describe('processing a fhir record', function() {
  it('should return the data with line information', function() {
    const data = fhirListAddresses(practitioner);
    expect(data.data.length).to.eql(4);
    expect(data.line.string.length).to.eql(256);
    expect(data.line.truncated).to.eql(false);
    expect(data.data[0]).to.have.keys('use', 'city', 'line', 'type', 'state', 'country', 'postalCode');
  });
  
  describe('with no addresses', function() {
    it('should empty data', function() {
      const practitionerNoAddress = _.cloneDeep(practitioner);
      practitionerNoAddress.address = [];
      practitionerNoAddress.contained = [];
      const data = fhirListAddresses(practitionerNoAddress);
      expect(data.data.length).to.eql(0);
      expect(data.line.string.length).to.eql(0);
      expect(data.line.truncated).to.eql(false);
    });
  });

  describe('setting options', function() {
    it('should limit the line to 29 characters', function() {
      const data = fhirListAddresses(practitioner, {
        line: {
          length: 29,
        },
      });
      expect(data.line.string.length).to.eql(29);
    });

    it('should allow an ellipsis to the line added to the end of the line', function() {
      const data = fhirListAddresses(practitioner, {
        line: {
          addEllipsis: true,
        },
      });

      expect(data.line.string.length).to.eql(260);
      expect(data.line.string.indexOf('...')).to.eql(257);
    });

    describe('specifying address parts', function() {
      it('should allow specific attributes to be returned', function() {
        const data = fhirListAddresses(practitioner, {
          includeAddressAttributes: ['city', 'state'],
        });
        expect(data.data[0]).to.have.keys('city', 'state');
      });

      it('should deduplicate by city and state', function() {
        const practitionerDuplicateAddress = _.cloneDeep(practitioner);
        practitionerDuplicateAddress.address = _.union(practitioner.address, practitionerDuplicateAddress.address);
        const data = fhirListAddresses(practitionerDuplicateAddress, {
          includeAddressAttributes: ['city', 'state'],
          deDuplicate: true,
        });
        expect(data.data.length).to.eql(2);
      });
    });
  });
});