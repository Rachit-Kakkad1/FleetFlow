import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { initializeData } from '../data/seedData';
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
                vehicles: vehicleService.getAll(),
                drivers: driverService.getAll(),
                trips: tripService.getAll(),
                maintenance: maintenanceService.getAll(),
                expenses: expenseService.getAll(),
            };
        case 'SET_USER':
            return { ...state, user: action.payload };
        default:
            return state;
    }
}

export function FleetProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        initializeData();
        dispatch({ type: 'REFRESH_ALL' });
        const user = authService.getUser();
        if (user) dispatch({ type: 'SET_USER', payload: user });
    }, []);

    const refresh = useCallback(() => {
        dispatch({ type: 'REFRESH_ALL' });
    }, []);

    const showToast = useCallback((message, type = 'success') => {
        if (type === 'error') toast.error(message);
        else if (type === 'warning') toast(message, { icon: '!' });
        else toast.success(message);
    }, []);

    const login = useCallback((email, password) => {
        const user = authService.login(email, password);
        if (user) {
            dispatch({ type: 'SET_USER', payload: user });
        }
        return user;
    }, []);

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
