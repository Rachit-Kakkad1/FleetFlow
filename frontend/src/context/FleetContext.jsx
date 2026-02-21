import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { vehicleService, driverService, tripService, maintenanceService, expenseService, authService } from '../api/services';
import toast from 'react-hot-toast';

const FleetContext = createContext(null);

const initialState = {
    vehicles: [],
    drivers: [],
    trips: [],
    maintenance: [],
    expenses: [],
    user: null,
};

function reducer(state, action) {
    switch (action.type) {
        case 'REFRESH_ALL':
            return {
                ...state,
                vehicles: action.payload.vehicles || [],
                drivers: action.payload.drivers || [],
                trips: action.payload.trips || [],
                maintenance: action.payload.maintenance || [],
                expenses: action.payload.expenses || [],
            };
        case 'SET_USER':
            return { ...state, user: action.payload };
        default:
            return state;
    }
}

export function FleetProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const refresh = useCallback(async () => {
        // Skip fetching if no valid token
        if (!localStorage.getItem('ff_token')) return;

        try {
            const results = await Promise.allSettled([
                vehicleService.getAll(),
                driverService.getAll(),
                tripService.getAll(),
                maintenanceService.getAll(),
                expenseService.getAll()
            ]);

            const [vehicles, drivers, trips, maintenance, expenses] = results.map(r => r.status === 'fulfilled' ? r.value : []);

            dispatch({ type: 'REFRESH_ALL', payload: { vehicles, drivers, trips, maintenance, expenses } });
        } catch (error) {
            console.error("Failed to fetch fleet data", error);
            // Optionally clear token on 401
            if (error.response?.status === 401) {
                authService.logout();
                dispatch({ type: 'SET_USER', payload: null });
            }
        }
    }, []);

    useEffect(() => {
        const user = authService.getUser();
        if (user) {
            dispatch({ type: 'SET_USER', payload: user });
            refresh();
        }
    }, [refresh]);

    const showToast = useCallback((message, type = 'success') => {
        if (type === 'error') toast.error(message);
        else if (type === 'warning') toast(message, { icon: '!' });
        else toast.success(message);
    }, []);

    const login = useCallback(async (email, password) => {
        const user = await authService.login(email, password);
        if (user) {
            dispatch({ type: 'SET_USER', payload: user });
            await refresh();
        }
        return user;
    }, [refresh]);

    const logout = useCallback(() => {
        authService.logout();
        dispatch({ type: 'SET_USER', payload: null });
    }, []);

    return (
        <FleetContext.Provider value={{ ...state, dispatch, refresh, showToast, login, logout }}>
            {children}
        </FleetContext.Provider>
    );
}

export const useFleet = () => useContext(FleetContext);
