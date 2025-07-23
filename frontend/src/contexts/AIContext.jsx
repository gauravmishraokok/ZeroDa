import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AIContext = createContext(null);

// Gemini API configuration (hardcoded as per user request)
const GEMINI_API_KEY = 'AIzaSyDWbmbufjfjB2j5BMEGt5WMScuFtEyqNtA';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export function AIProvider({ children }) {
  const [predictions, setPredictions] = useState(null);
  const [insights, setInsights] = useState(null);
  const [mergeLoading, setMergeLoading] = useState(false);
  const [predictLoading, setPredictLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [syncResult, setSyncResult] = useState(null);

  // Automated AI Accounting (SMS Sync)
  const syncInboxSMS = async () => {
    setMergeLoading(true);
    setError(null);
    setSyncResult(null);
    try {
      const { data } = await axios.post('http://localhost:5000/process-messages');
      setSyncResult(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setMergeLoading(false);
    }
  };

  // Monthly Spending Forecast
  const predictMonthlySpend = async () => {
    setPredictLoading(true);
    setError(null);
    setPredictions(null);
    try {
      const { data } = await axios.get('http://localhost:5000/ai/predict-monthly-spend');
      setPredictions(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setPredictLoading(false);
    }
  };

  // AI Insights
  const getAIInsights = async () => {
    setInsightsLoading(true);
    setError(null);
    setInsights(null);
    try {
      const { data } = await axios.get('http://localhost:5000/ai/insights');
      setInsights(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setInsightsLoading(false);
    }
  };

  return (
    <AIContext.Provider
      value={{
        predictions,
        insights,
        mergeLoading,
        predictLoading,
        insightsLoading,
        error,
        predictMonthlySpend,
        getAIInsights,
        syncInboxSMS,
        syncResult
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}
