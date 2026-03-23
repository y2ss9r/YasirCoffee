import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * useApi — a lightweight data-fetching hook for the myCoffee API.
 *
 * @param {string} path - Relative API path, e.g. '/api/products'
 * @param {object} [options] - Fetch options (method, body, etc.)
 *
 * Returns:
 *  - data       : the parsed JSON response (or null)
 *  - loading    : boolean
 *  - error      : error message string (or null)
 *  - request()  : function to trigger / retry the fetch
 */
const useApi = (path, options = {}) => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const request = useCallback(
        async (overrideOptions = {}) => {
            setLoading(true);
            setError(null);

            const headers = {
                'Content-Type': 'application/json',
                ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
                ...(options.headers || {}),
                ...(overrideOptions.headers || {}),
            };

            try {
                const res = await fetch(path, {
                    ...options,
                    ...overrideOptions,
                    headers,
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || 'Request failed');
                setData(json);
                return { success: true, data: json };
            } catch (err) {
                setError(err.message);
                return { success: false, error: err.message };
            } finally {
                setLoading(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [path, user]
    );

    return { data, loading, error, request };
};

export default useApi;
