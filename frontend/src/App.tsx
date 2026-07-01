import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Wallet, 
  LogOut, 
  Trash2, 
  Edit2,
  Plus, 
  User as UserIcon, 
  Mail, 
  Lock, 
  Calendar, 
  Tag, 
  IndianRupee, 
  ShieldAlert 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

interface DecodedToken {
  user_id: number;
  sub: string;
  exp: number;
}

interface Transaction {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  user_id: number;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
}

function parseJwt(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function App() {
  // Authentication State
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  // Auth Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  
  // Dashboard & Profile State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // New Transaction Form State
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('Food');
  
  // General feedback messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Account Deletion State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Edit Transaction State
  const [editingTxId, setEditingTxId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('Food');

  // Setup Axios Interceptors and parse token when token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      const decoded = parseJwt(token);
      if (decoded) {
        // Token expiration check (exp is in Unix seconds)
        const isExpired = decoded.exp * 1000 < Date.now();
        if (isExpired) {
          handleLogout();
          setErrorMsg('Session expired. Please log in again.');
        } else {
          setUserId(decoded.user_id);
          setUsername(decoded.sub);
          setErrorMsg(null);
        }
      } else {
        handleLogout();
      }
    } else {
      localStorage.removeItem('token');
      setUserId(null);
      setUsername(null);
      setProfile(null);
      setTransactions([]);
    }
  }, [token]);

  // Fetch Dashboard data once authenticated
  useEffect(() => {
    if (token && userId) {
      fetchProfile();
      fetchTransactions();
    }
  }, [token, userId]);

  // Network Calls
  const fetchProfile = async () => {
    try {
      const response = await axios.get<UserProfile>(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch (err: any) {
      console.error('Failed to fetch user profile:', err);
      // If unauthorized, logout
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      }
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get<Transaction[]>(`${API_URL}/transactions/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Sort transactions by date descending
      const sorted = response.data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(sorted);
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginUsername || !loginPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    try {
      // FastAPI OAuth2 password login expects application/x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('username', loginUsername);
      formData.append('password', loginPassword);

      const response = await axios.post(`${API_URL}/auth/login`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const { access_token } = response.data;
      setToken(access_token);
      setSuccessMsg('Logged in successfully.');
      setLoginUsername('');
      setLoginPassword('');
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setErrorMsg(detail);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!registerUsername || !registerEmail || !registerPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    try {
      // Register expects application/json
      await axios.post(`${API_URL}/auth/register`, {
        username: registerUsername,
        email: registerEmail,
        password: registerPassword
      });

      setSuccessMsg('Registration successful! Please log in below.');
      setAuthTab('login');
      // Autofill username
      setLoginUsername(registerUsername);
      // Clear registration inputs
      setRegisterUsername('');
      setRegisterEmail('');
      setRegisterPassword('');
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Registration failed. Username or email might be taken.';
      setErrorMsg(detail);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const amountNum = parseFloat(txAmount);
    if (!txTitle.trim() || isNaN(amountNum) || amountNum <= 0 || !txCategory) {
      setErrorMsg('Please provide a valid title, positive amount, and category.');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/transactions/`,
        {
          title: txTitle.trim(),
          amount: amountNum,
          category: txCategory
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTxTitle('');
      setTxAmount('');
      setSuccessMsg('Expense logged successfully.');
      fetchTransactions();
    } catch (err: any) {
      setErrorMsg('Failed to log expense. Please try again.');
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm('Are you sure you want to delete this expense entry?')) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await axios.delete(`${API_URL}/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg('Expense entry deleted.');
      fetchTransactions();
    } catch (err: any) {
      setErrorMsg('Failed to delete expense entry.');
    }
  };

  const startEditTransaction = (tx: Transaction) => {
    setEditingTxId(tx.id);
    setEditTitle(tx.title);
    setEditAmount(tx.amount.toString());
    setEditCategory(tx.category);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleUpdateTransaction = async (id: number) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const amountNum = parseFloat(editAmount);
    if (!editTitle.trim() || isNaN(amountNum) || amountNum <= 0 || !editCategory) {
      setErrorMsg('Please provide a valid title, positive amount, and category.');
      return;
    }

    try {
      await axios.patch(
        `${API_URL}/transactions/${id}`,
        {
          title: editTitle.trim(),
          amount: amountNum,
          category: editCategory
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditingTxId(null);
      setSuccessMsg('Expense updated successfully.');
      fetchTransactions();
    } catch (err: any) {
      setErrorMsg('Failed to update expense. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!profile) return;
    if (deleteConfirmText !== profile.username) {
      setErrorMsg('Account confirmation name does not match.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await axios.delete(`${API_URL}/users/${profile.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Clear storage and state on successful deletion
      handleLogout();
      alert('Your account and all associated expenses have been deleted.');
    } catch (err: any) {
      setErrorMsg('Failed to delete your account.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUserId(null);
    setUsername(null);
    setProfile(null);
    setTransactions([]);
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowDeleteConfirm(false);
    setDeleteConfirmText('');
  };

  // Helper formatting functions
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Total expenses calculated dynamically
  const totalExpenses = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  // Unauthenticated View: Login/Register Forms
  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="logo-container" style={{ justifyContent: 'center', marginBottom: '24px' }}>
            <Wallet size={24} />
            <span>Expense Tracker</span>
          </div>

          <div className="auth-tabs">
            <div 
              className={`auth-tab ${authTab === 'login' ? 'active' : ''}`}
              onClick={() => {
                setAuthTab('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
            >
              Sign In
            </div>
            <div 
              className={`auth-tab ${authTab === 'register' ? 'active' : ''}`}
              onClick={() => {
                setAuthTab('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
            >
              Register
            </div>
          </div>

          {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          {authTab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="login-username">Username or Email</label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={16} className="text-muted" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                  <input
                    id="login-username"
                    type="text"
                    placeholder="Enter your username or email"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    style={{ paddingLeft: '34px' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label htmlFor="login-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} className="text-muted" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                  <input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{ paddingLeft: '34px' }}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="reg-username">Username</label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={16} className="text-muted" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                  <input
                    id="reg-username"
                    type="text"
                    placeholder="Create a username"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    style={{ paddingLeft: '34px' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} className="text-muted" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="Enter your email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    style={{ paddingLeft: '34px' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label htmlFor="reg-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} className="text-muted" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                  <input
                    id="reg-password"
                    type="password"
                    placeholder="Create a strong password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    style={{ paddingLeft: '34px' }}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Create Account
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Authenticated View: Dashboard Layout
  return (
    <>
      <header>
        <div className="header-container">
          <div className="logo-container">
            <Wallet size={20} />
            <span>Expense Tracker</span>
          </div>
          
          <div className="nav-user">
            <span>Logged in as <strong>{username}</strong></span>
            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '6px 12px' }}>
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <div className="dashboard-grid">
          {/* Main Column */}
          <div>
            {/* Create Transaction Card */}
            <div className="card">
              <h2 className="card-title">Log New Expense</h2>
              <form onSubmit={handleCreateTransaction} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="tx-title">Title / Description</label>
                  <input
                    id="tx-title"
                    type="text"
                    placeholder="e.g., Office Supplies"
                    value={txTitle}
                    onChange={(e) => setTxTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="tx-amount">Amount (INR)</label>
                  <div style={{ position: 'relative' }}>
                    <IndianRupee size={14} className="text-muted" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                    <input
                      id="tx-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value)}
                      style={{ paddingLeft: '24px' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="tx-category">Category</label>
                  <select
                    id="tx-category"
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                  >
                    <option value="Food">Food & Dining</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Housing">Housing & Rent</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Leisure">Leisure & Travel</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other / Misc</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary" style={{ height: '38px' }}>
                  <Plus size={16} />
                  <span>Add Log</span>
                </button>
              </form>
            </div>

            {/* Transactions List Card */}
            <div className="card">
              <div className="flex flex-between" style={{ marginBottom: '16px' }}>
                <h2 className="card-title" style={{ marginBottom: 0 }}>Logged Transactions</h2>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  Total Expenses:{' '}
                  <span className="amount-expense" style={{ fontSize: '1rem', color: totalExpenses > 0 ? 'var(--error)' : 'inherit' }}>
                    {formatCurrency(totalExpenses)}
                  </span>
                </div>
              </div>

              {transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)' }}>
                  No logged transactions found. Add a transaction above to get started.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th className="text-right">Amount</th>
                        <th style={{ width: '60px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        editingTxId === tx.id ? (
                          <tr key={tx.id}>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              <div className="flex" style={{ alignItems: 'center', gap: '8px' }}>
                                <Calendar size={14} className="text-muted" />
                                <span>{formatDate(tx.date)}</span>
                              </div>
                            </td>
                            <td>
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                required
                                style={{ padding: '4px 8px', fontSize: '0.875rem' }}
                              />
                            </td>
                            <td>
                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                style={{ padding: '4px 8px', fontSize: '0.875rem' }}
                              >
                                <option value="Food">Food & Dining</option>
                                <option value="Utilities">Utilities</option>
                                <option value="Housing">Housing & Rent</option>
                                <option value="Transportation">Transportation</option>
                                <option value="Leisure">Leisure & Travel</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Other">Other / Misc</option>
                              </select>
                            </td>
                            <td className="text-right">
                              <div style={{ position: 'relative', display: 'inline-block', width: '100px' }}>
                                <IndianRupee size={10} className="text-muted" style={{ position: 'absolute', left: '6px', top: '9px' }} />
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editAmount}
                                  onChange={(e) => setEditAmount(e.target.value)}
                                  required
                                  style={{ padding: '4px 6px 4px 16px', fontSize: '0.875rem', textAlign: 'right' }}
                                />
                              </div>
                            </td>
                            <td className="text-right" style={{ whiteSpace: 'nowrap' }}>
                              <button
                                onClick={() => handleUpdateTransaction(tx.id)}
                                className="btn-primary"
                                style={{ padding: '4px 8px', marginRight: '4px', fontSize: '0.75rem' }}
                                title="Save Changes"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingTxId(null)}
                                className="btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                title="Cancel"
                              >
                                Cancel
                              </button>
                            </td>
                          </tr>
                        ) : (
                          <tr key={tx.id}>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              <div className="flex" style={{ alignItems: 'center', gap: '8px' }}>
                                <Calendar size={14} className="text-muted" />
                                <span>{formatDate(tx.date)}</span>
                              </div>
                            </td>
                            <td style={{ fontWeight: 500 }}>{tx.title}</td>
                            <td>
                              <div className="flex" style={{ alignItems: 'center', gap: '6px' }}>
                                <Tag size={12} className="text-muted" />
                                <span>{tx.category}</span>
                              </div>
                            </td>
                            <td className="text-right amount-expense" style={{ color: 'var(--error)' }}>
                              {formatCurrency(tx.amount)}
                            </td>
                            <td className="text-right" style={{ whiteSpace: 'nowrap' }}>
                              <button
                                onClick={() => startEditTransaction(tx)}
                                className="btn-secondary"
                                title="Edit Transaction"
                                style={{ padding: '6px', marginRight: '4px' }}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteTransaction(tx.id)}
                                className="btn-danger"
                                title="Delete Transaction"
                                style={{ padding: '6px' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        )
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Profile Column */}
          <div>
            <div className="card profile-card">
              <h2 className="card-title">User Account</h2>
              {profile ? (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', fontSize: '0.875rem' }}>
                    <div>
                      <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>User ID</span>
                      <strong>{profile.id}</strong>
                    </div>
                    <div>
                      <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>Username</span>
                      <strong>{profile.username}</strong>
                    </div>
                    <div>
                      <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>Email Address</span>
                      <strong>{profile.email}</strong>
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '16px 0' }} />

                  {!showDeleteConfirm ? (
                    <button 
                      onClick={() => setShowDeleteConfirm(true)} 
                      className="btn-danger" 
                      style={{ width: '100%', padding: '10px' }}
                    >
                      Delete Account
                    </button>
                  ) : (
                    <div style={{ backgroundColor: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: 'var(--radius)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="flex" style={{ gap: '8px', color: 'var(--error)', fontSize: '0.8125rem', fontWeight: 500 }}>
                        <ShieldAlert size={16} style={{ flexShrink: 0 }} />
                        <span>Warning: This action is permanent. All transaction data will be deleted!</span>
                      </div>
                      
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label htmlFor="del-confirm-input" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Type <strong>{profile.username}</strong> to confirm:
                        </label>
                        <input
                          id="del-confirm-input"
                          type="text"
                          placeholder={profile.username}
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          style={{ border: '1px solid var(--error-border)', marginTop: '4px' }}
                        />
                      </div>

                      <div className="flex" style={{ gap: '8px' }}>
                        <button 
                          onClick={handleDeleteAccount} 
                          className="btn-danger-solid" 
                          disabled={deleteConfirmText !== profile.username}
                          style={{ flex: 1 }}
                        >
                          Delete
                        </button>
                        <button 
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteConfirmText('');
                          }} 
                          className="btn-secondary"
                          style={{ flex: 1 }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-muted" style={{ fontSize: '0.875rem' }}>Loading account info...</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
