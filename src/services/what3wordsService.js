const axios = require('axios');
const { WHAT3WORDS_API_KEY } = require('../config/env');

/**
 * what3words Integration Service
 * Converts GPS coordinates to 3-word addresses for rural Kenya
 * where street addresses don't exist
 */

const what3wordsService = {
  coordinatesToWords: async (lat, lng, language = 'en') => {
    try {
      if (!WHAT3WORDS_API_KEY) {
        // Return mock what3words for development
        return mockWhat3Words(lat, lng);
      }

      const response = await axios.get(
        `https://api.what3words.com/v3/convert-to-3wa?coordinates=${lat},${lng}&language=${language}&key=${WHAT3WORDS_API_KEY}`
      );

      return response.data.words;
    } catch (error) {
      console.error('what3words conversion error:', error);
      throw new Error('Unable to convert coordinates to what3words');
    }
  },

  wordsToCoordinates: async (words) => {
    try {
      if (!WHAT3WORDS_API_KEY) {
        // Return mock coordinates for development
        return mockCoordinates(words);
      }

      const response = await axios.get(
        `https://api.what3words.com/v3/convert-to-coordinates?words=${words}&key=${WHAT3WORDS_API_KEY}`
      );

      return {
        lat: response.data.coordinates.lat,
        lng: response.data.coordinates.lng
      };
    } catch (error) {
      console.error('what3words conversion error:', error);
      throw new Error('Unable to convert what3words to coordinates');
    }
  },

  autosuggest: async (input, lat, lng, radius = 100) => {
    try {
      if (!WHAT3WORDS_API_KEY) {
        return [];
      }

      const response = await axios.get(
        `https://api.what3words.com/v3/autosuggest?input=${encodeURIComponent(input)}&key=${WHAT3WORDS_API_KEY}&focus=${lat},${lng}&clip-to-radius=${radius}`
      );

      return response.data.suggestions;
    } catch (error) {
      console.error('what3words autosuggest error:', error);
      return [];
    }
  }
};

// Mock functions for development
function mockWhat3Words(lat, lng) {
  const words = ['table', 'chair', 'book', 'tree', 'river', 'hill', 'sun', 'moon', 'star'];
  const randomWords = () => words[Math.floor(Math.random() * words.length)];
  return `${randomWords()}.${randomWords()}.${randomWords()}`;
}

function mockCoordinates(words) {
  // Return approximate coordinates for Nairobi area
  return {
    lat: -1.2921 + (Math.random() - 0.5) * 0.1,
    lng: 36.8219 + (Math.random() - 0.5) * 0.1
  };
}

module.exports = what3wordsService;