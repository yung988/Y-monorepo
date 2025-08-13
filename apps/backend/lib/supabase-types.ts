export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          address: string | null
          city: string | null
          postal_code: string | null
          country: string
          date_of_birth: string | null
          total_orders: number
          total_revenue: number
          last_order_date: string | null
          customer_group: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string
          date_of_birth?: string | null
          total_orders?: number
          total_revenue?: number
          last_order_date?: string | null
          customer_group?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string
          date_of_birth?: string | null
          total_orders?: number
          total_revenue?: number
          last_order_date?: string | null
          customer_group?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          parent_id: string | null
          image_url: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          parent_id?: string | null
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          parent_id?: string | null
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          short_description: string | null
          sku: string
          price: number
          compare_price: number | null
          cost_price: number | null
          category_id: string | null
          brand: string | null
          weight: number | null
          dimensions: any | null
          stock: number
          min_stock: number
          max_stock: number
          status: string
          is_featured: boolean
          is_digital: boolean
          requires_shipping: boolean
          tax_rate: number
          meta_title: string | null
          meta_description: string | null
          images: any
          attributes: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          sku: string
          price: number
          compare_price?: number | null
          cost_price?: number | null
          category_id?: string | null
          brand?: string | null
          weight?: number | null
          dimensions?: any | null
          stock?: number
          min_stock?: number
          max_stock?: number
          status?: string
          is_featured?: boolean
          is_digital?: boolean
          requires_shipping?: boolean
          tax_rate?: number
          meta_title?: string | null
          meta_description?: string | null
          images?: any
          attributes?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          sku?: string
          price?: number
          compare_price?: number | null
          cost_price?: number | null
          category_id?: string | null
          brand?: string | null
          weight?: number | null
          dimensions?: any | null
          stock?: number
          min_stock?: number
          max_stock?: number
          status?: string
          is_featured?: boolean
          is_digital?: boolean
          requires_shipping?: boolean
          tax_rate?: number
          meta_title?: string | null
          meta_description?: string | null
          images?: any
          attributes?: any
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          customer_name: string
          customer_email: string
          customer_phone: string | null
          billing_address: any
          shipping_address: any | null
          status: string
          payment_status: string
          fulfillment_status: string
          subtotal: number
          tax_amount: number
          shipping_amount: number
          discount_amount: number
          total_amount: number
          currency: string
          payment_method: string | null
          shipping_method: string | null
          notes: string | null
          tags: any
          processed_at: string | null
          shipped_at: string | null
          delivered_at: string | null
          cancelled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          customer_id?: string | null
          customer_name: string
          customer_email: string
          customer_phone?: string | null
          billing_address: any
          shipping_address?: any | null
          status?: string
          payment_status?: string
          fulfillment_status?: string
          subtotal: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          total_amount: number
          currency?: string
          payment_method?: string | null
          shipping_method?: string | null
          notes?: string | null
          tags?: any
          processed_at?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string | null
          customer_name?: string
          customer_email?: string
          customer_phone?: string | null
          billing_address?: any
          shipping_address?: any | null
          status?: string
          payment_status?: string
          fulfillment_status?: string
          subtotal?: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          total_amount?: number
          currency?: string
          payment_method?: string | null
          shipping_method?: string | null
          notes?: string | null
          tags?: any
          processed_at?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          variant_id: string | null
          product_name: string
          variant_name: string | null
          sku: string
          quantity: number
          unit_price: number
          total_price: number
          tax_rate: number
          tax_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          variant_id?: string | null
          product_name: string
          variant_name?: string | null
          sku: string
          quantity: number
          unit_price: number
          total_price: number
          tax_rate?: number
          tax_amount?: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          variant_id?: string | null
          product_name?: string
          variant_name?: string | null
          sku?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          tax_rate?: number
          tax_amount?: number
          created_at?: string
        }
      }
      shipments: {
        Row: {
          id: string
          order_id: string | null
          tracking_number: string | null
          carrier: string | null
          service_type: string | null
          status: string
          shipped_at: string | null
          estimated_delivery: string | null
          delivered_at: string | null
          shipping_address: any
          weight: number | null
          dimensions: any | null
          cost: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id?: string | null
          tracking_number?: string | null
          carrier?: string | null
          service_type?: string | null
          status?: string
          shipped_at?: string | null
          estimated_delivery?: string | null
          delivered_at?: string | null
          shipping_address: any
          weight?: number | null
          dimensions?: any | null
          cost?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string | null
          tracking_number?: string | null
          carrier?: string | null
          service_type?: string | null
          status?: string
          shipped_at?: string | null
          estimated_delivery?: string | null
          delivered_at?: string | null
          shipping_address?: any
          weight?: number | null
          dimensions?: any | null
          cost?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          order_id: string | null
          payment_method: string
          provider: string | null
          transaction_id: string | null
          amount: number
          currency: string
          status: string
          gateway_response: any | null
          processed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id?: string | null
          payment_method: string
          provider?: string | null
          transaction_id?: string | null
          amount: number
          currency?: string
          status?: string
          gateway_response?: any | null
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string | null
          payment_method?: string
          provider?: string | null
          transaction_id?: string | null
          amount?: number
          currency?: string
          status?: string
          gateway_response?: any | null
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      discounts: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          type: string
          value: number
          minimum_amount: number | null
          maximum_discount: number | null
          usage_limit: number | null
          usage_count: number
          customer_usage_limit: number
          starts_at: string | null
          ends_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          type: string
          value: number
          minimum_amount?: number | null
          maximum_discount?: number | null
          usage_limit?: number | null
          usage_count?: number
          customer_usage_limit?: number
          starts_at?: string | null
          ends_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          type?: string
          value?: number
          minimum_amount?: number | null
          maximum_discount?: number | null
          usage_limit?: number | null
          usage_count?: number
          customer_usage_limit?: number
          starts_at?: string | null
          ends_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      product_reviews: {
        Row: {
          id: string
          product_id: string
          customer_id: string | null
          order_id: string | null
          rating: number
          title: string | null
          content: string | null
          is_verified: boolean
          is_published: boolean
          helpful_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          customer_id?: string | null
          order_id?: string | null
          rating: number
          title?: string | null
          content?: string | null
          is_verified?: boolean
          is_published?: boolean
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          customer_id?: string | null
          order_id?: string | null
          rating?: number
          title?: string | null
          content?: string | null
          is_verified?: boolean
          is_published?: boolean
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: any | null
          description: string | null
          category: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: any | null
          description?: string | null
          category?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: any | null
          description?: string | null
          category?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          event_type: string
          event_data: any
          user_id: string | null
          session_id: string | null
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          event_data: any
          user_id?: string | null
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          event_data?: any
          user_id?: string | null
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          created_at?: string
        }
      }
    }
  }
}
