interface SubscriptionCreateParams {
  plan_id: string
  customer_notify?: number
  quantity?: number
  total_count?: number
  notes?: Record<string, string>
}

interface RazorpayClient {
  subscriptions: {
    create: (params: SubscriptionCreateParams) => Promise<{ id: string; [key: string]: unknown }>
    cancel: (subscriptionId: string, cancelAtCycleEnd?: boolean) => Promise<{ id: string; [key: string]: unknown }>
  }
}

function createRazorpayClient(): RazorpayClient {
  const keyId = process.env.RAZORPAY_KEY_ID || ''
  const keySecret = process.env.RAZORPAY_KEY_SECRET || ''

  const getAuthHeader = () => {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
    return `Basic ${auth}`
  }

  return {
    subscriptions: {
      async create(params: SubscriptionCreateParams) {
        if (!keyId || !keySecret) {
          throw new Error('Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) not configured.')
        }

        const res = await fetch('https://api.razorpay.com/v1/subscriptions', {
          method: 'POST',
          headers: {
            Authorization: getAuthHeader(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData?.error?.description || `Razorpay subscription create failed (${res.status})`)
        }

        return res.json()
      },

      async cancel(subscriptionId: string, cancelAtCycleEnd = true) {
        if (!keyId || !keySecret) {
          throw new Error('Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) not configured.')
        }

        const res = await fetch(`https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`, {
          method: 'POST',
          headers: {
            Authorization: getAuthHeader(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0 }),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData?.error?.description || `Razorpay subscription cancel failed (${res.status})`)
        }

        return res.json()
      },
    },
  }
}

export const razorpay = createRazorpayClient()

