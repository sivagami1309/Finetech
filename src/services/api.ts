const API_BASE = '/api';

export class ApiService {
  private static getToken(): string | null {
    return localStorage.getItem('finguard_auth_token');
  }

  public static setToken(token: string | null) {
    if (token) {
      localStorage.setItem('finguard_auth_token', token);
    } else {
      localStorage.removeItem('finguard_auth_token');
    }
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data;
  }

  // Auth endpoints
  public static async register(payload: any) {
    const res = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  public static async login(credentials: any) {
    const res = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  public static async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  public static async getCurrentUser() {
    return this.request<any>('/auth/me');
  }

  // User profile
  public static async getProfile() {
    return this.request<any>('/users/me');
  }

  public static async updateProfile(data: any) {
    return this.request<any>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Payment Requests & Quotes
  public static async createPaymentRequest(data: any) {
    return this.request<any>('/payment-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public static async listPaymentRequests(page = 1, limit = 10) {
    return this.request<any>(`/payment-requests?page=${page}&limit=${limit}`);
  }

  public static async getPaymentRequest(id: string) {
    return this.request<any>(`/payment-requests/${id}`);
  }

  public static async calculateQuote(amount: number, sourceCurrency = 'USD', destinationCurrency = 'INR') {
    return this.request<any>('/payment-requests/quote', {
      method: 'POST',
      body: JSON.stringify({ sourceAmount: amount, sourceCurrency, destinationCurrency }),
    });
  }

  public static async confirmPaymentRequest(id: string) {
    return this.request<any>(`/payment-requests/${id}/confirm`, {
      method: 'POST',
    });
  }

  // Transactions
  public static async listTransactions(params: { page?: number; limit?: number; status?: string; currency?: string; search?: string } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.status) query.append('status', params.status);
    if (params.currency) query.append('currency', params.currency);
    if (params.search) query.append('search', params.search);

    return this.request<any>(`/transactions?${query.toString()}`);
  }

  public static async getTransaction(id: string) {
    return this.request<any>(`/transactions/${id}`);
  }

  public static async getTransactionHistory(id: string) {
    return this.request<any>(`/transactions/${id}/history`);
  }

  public static async simulateStatus(id: string, targetStatus: string, reason?: string) {
    return this.request<any>(`/transactions/${id}/simulate-status`, {
      method: 'POST',
      body: JSON.stringify({ targetStatus, reason }),
    });
  }

  public static async getDashboardStats() {
    return this.request<any>('/transactions/stats/dashboard');
  }

  // Blockchain
  public static async verifyTransaction(txHashOrRef: string) {
    return this.request<any>(`/blockchain/verify/${encodeURIComponent(txHashOrRef)}`);
  }

  // Health
  public static async getSystemHealth() {
    return this.request<any>('/health');
  }

  public static async getDatabaseHealth() {
    return this.request<any>('/health/database');
  }

  public static async getBlockchainHealth() {
    return this.request<any>('/health/blockchain');
  }
}
