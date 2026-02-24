const axios = require('axios');
const { SHA_API_URL, SHA_API_KEY } = require('../config/env');

/**
 * SHA (Social Health Authority) Integration Service
 * Handles verification of SHA membership and coverage
 */

const shaIntegrationService = {
  verifyMember: async (idNumber) => {
    try {
      if (!SHA_API_KEY) {
        // Mock response for development
        return {
          active: true,
          memberNumber: `SHA${idNumber}`,
          coverageType: 'comprehensive',
          eccifEligible: true
        };
      }

      const response = await axios.post(`${SHA_API_URL}/verify`, {
        idNumber
      }, {
        headers: {
          'Authorization': `Bearer ${SHA_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('SHA verification error:', error);
      throw new Error('Unable to verify SHA membership');
    }
  },

  verifyCoverage: async (shaNumber) => {
    try {
      if (!SHA_API_KEY) {
        return {
          active: true,
          eccifEligible: true,
          ambulanceCovered: true
        };
      }

      const response = await axios.get(`${SHA_API_URL}/coverage/${shaNumber}`, {
        headers: {
          'Authorization': `Bearer ${SHA_API_KEY}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('SHA coverage check error:', error);
      throw new Error('Unable to verify coverage');
    }
  },

  submitClaim: async (claimData) => {
    try {
      if (!SHA_API_KEY) {
        return {
          claimNumber: `CLM${Date.now()}`,
          status: 'pending',
          estimatedPayment: 30 // days
        };
      }

      const response = await axios.post(`${SHA_API_URL}/claims`, claimData, {
        headers: {
          'Authorization': `Bearer ${SHA_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('SHA claim submission error:', error);
      throw new Error('Unable to submit claim');
    }
  },

  checkClaimStatus: async (claimNumber) => {
    try {
      if (!SHA_API_KEY) {
        return {
          claimNumber,
          status: 'processing',
          amount: 15000,
          currency: 'KES'
        };
      }

      const response = await axios.get(`${SHA_API_URL}/claims/${claimNumber}`, {
        headers: {
          'Authorization': `Bearer ${SHA_API_KEY}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('SHA claim status error:', error);
      throw new Error('Unable to check claim status');
    }
  }
};

module.exports = shaIntegrationService;