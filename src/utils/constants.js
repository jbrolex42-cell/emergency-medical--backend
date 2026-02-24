module.exports = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  
  EMERGENCY_TYPES: [
    'medical',
    'trauma', 
    'maternal',
    'cardiac',
    'respiratory',
    'other'
  ],

  SEVERITY_LEVELS: [
    'critical',
    'urgent',
    'moderate',
    'minor'
  ],

  EMERGENCY_STATUS: {
    PENDING: 'pending',
    DISPATCHED: 'dispatched',
    EN_ROUTE: 'en_route',
    ON_SCENE: 'on_scene',
    TRANSPORTING: 'transporting',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

  USER_ROLES: {
    USER: 'user',
    PROVIDER: 'provider',
    EMT: 'emt',
    ADMIN: 'admin'
  },

  VEHICLE_TYPES: {
    AMBULANCE_BASIC: 'ambulance_basic',
    AMBULANCE_ADVANCED: 'ambulance_advanced',
    MOTORCYCLE: 'motorcycle',
    '4X4': '4x4',
    BOAT: 'boat'
  },

  SUBSCRIPTION_PLANS: {
    BASIC: 'basic',
    FAMILY: 'family',
    CORPORATE: 'corporate'
  },

  // Kenya-specific constants
  KENYA_COUNTIES: [
    'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta',
    'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru',
    'Tharaka-Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua',
    'Nyeri', 'Kirinyaga', 'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot',
    'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi',
    'Baringo', 'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Kericho',
    'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 'Busia', 'Siaya',
    'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira', 'Nairobi'
  ],

  RESPONSE_TIME_TARGETS: {
    URBAN: 15, // minutes
    RURAL: 30  // minutes
  }
};