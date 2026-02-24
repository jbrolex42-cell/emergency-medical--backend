const { Subscription, User } = require('../models');
const shaIntegrationService = require('./shaIntegrationService');

const PLANS = {
  basic: {
    name: 'Basic Individual',
    amount: 4000, // KES per year
    features: ['Unlimited emergency calls', 'GPS tracking', 'SMS notifications'],
    shaCovered: false
  },
  family: {
    name: 'Family Plan',
    amount: 8000, // KES per year
    features: ['Covers 5 family members', 'Priority dispatch', 'Health records'],
    shaCovered: false
  },
  corporate: {
    name: 'Corporate Plan',
    amount: 25000, // KES per year
    features: ['Up to 50 employees', 'Dedicated account manager', 'Analytics dashboard'],
    shaCovered: false
  }
};

const subscriptionService = {
  getPlans: async () => {
    return Object.entries(PLANS).map(([key, plan]) => ({
      id: key,
      ...plan
    }));
  },

  create: async (userId, { plan, paymentMethod }) => {
    const planDetails = PLANS[plan];
    if (!planDetails) throw new Error('Invalid plan selected');

    const user = await User.findByPk(userId);
    
    // Check if user has SHA coverage
    let shaCovered = false;
    if (user.shaNumber && paymentMethod === 'sha') {
      const coverage = await shaIntegrationService.verifyCoverage(user.shaNumber);
      shaCovered = coverage.eccifEligible;
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    const subscription = await Subscription.create({
      userId,
      plan,
      amount: shaCovered ? 0 : planDetails.amount,
      paymentMethod,
      startDate,
      endDate,
      status: paymentMethod === 'mpesa' ? 'pending' : 'active',
      shaCovered,
      autoRenew: true
    });

    // If M-Pesa, initiate payment
    if (paymentMethod === 'mpesa') {
      // Initiate STK push (implementation depends on Daraja API)
      subscription.mpesaPending = true;
    }

    return {
      subscription,
      paymentInstructions: paymentMethod === 'mpesa' ? 
        'Please complete payment via M-Pesa STK push' : 
        'Subscription activated'
    };
  },

  getCurrent: async (userId) => {
    const subscription = await Subscription.findOne({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    if (!subscription) {
      return { active: false, message: 'No active subscription' };
    }

    const now = new Date();
    const active = subscription.status === 'active' && subscription.endDate > now;

    return {
      active,
      subscription,
      daysRemaining: active ? 
        Math.ceil((subscription.endDate - now) / (1000 * 60 * 60 * 24)) : 
        0
    };
  },

  renew: async (userId) => {
    const current = await subscriptionService.getCurrent(userId);
    if (!current.active) {
      throw new Error('No active subscription to renew');
    }

    // Create new subscription based on current plan
    return await subscriptionService.create(userId, {
      plan: current.subscription.plan,
      paymentMethod: current.subscription.paymentMethod
    });
  },

  processMpesaCallback: async (callbackData) => {
    // Process M-Pesa payment callback
    // Update subscription status to active
    console.log('M-Pesa callback received:', callbackData);
    return true;
  }
};

module.exports = subscriptionService;