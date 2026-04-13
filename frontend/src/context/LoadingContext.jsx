import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import api from '../api/axios';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const activeRequests = useRef(0);

    const loaderTimer = useRef(null);

    const showLoading = useCallback(() => {
        activeRequests.current += 1;
    }, []);

    const hideLoading = useCallback(() => {
        activeRequests.current = Math.max(0, activeRequests.current - 1);
        
        if (activeRequests.current === 0) {
            if (loaderTimer.current) {
                clearTimeout(loaderTimer.current);
                loaderTimer.current = null;
            }
            setIsLoading(false);
        }
    }, [setIsLoading]);

    useEffect(() => {
        const requestInterceptor = api.interceptors.request.use(
            (config) => {
                // If the dynamic loading is disabled for this request, skip
                if (config.showLoader !== false) {
                    showLoading();
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        const responseInterceptor = api.interceptors.response.use(
            (response) => {
                if (response.config.showLoader !== false) {
                    hideLoading();
                }
                return response;
            },
            (error) => {
                if (error.config?.showLoader !== false) {
                    hideLoading();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.request.eject(requestInterceptor);
            api.interceptors.response.eject(responseInterceptor);
        };
    }, [showLoading, hideLoading]);

    return (
        <LoadingContext.Provider value={{ isLoading, setIsLoading, showLoading, hideLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};
