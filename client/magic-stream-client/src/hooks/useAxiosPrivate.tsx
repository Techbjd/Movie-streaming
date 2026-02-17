import { useEffect, useRef } from 'react';
import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse} from 'axios';
import useAuth from './useAuth';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

type FailedQueueItem = {
    resolve: (value: AxiosResponse) => void;
    reject: (reason?: any) => void;
};

const useAxiosPrivate = () => {
    const axiosAuth = axios.create({
        baseURL: apiUrl,
        withCredentials: true,
    });

    const { auth, setAuth } = useAuth();

    const isRefreshing = useRef(false);
    const failedQueue = useRef<FailedQueueItem[]>([]);

    const processQueue = (error: any, response: AxiosResponse | null = null) => {
        failedQueue.current.forEach(prom => {
            if (error) {
                prom.reject(error);
            } else {
                prom.resolve(response!);
            }
        });
        failedQueue.current = [];
    };

    useEffect(() => {
        const interceptor = axiosAuth.interceptors.response.use(
            response => response,
            async (error: AxiosError) => {
                console.log('⚠ Interceptor caught error:', error);

                const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

                if (
                    originalRequest.url?.includes('/refresh') &&
                    error.response?.status === 401
                ) {
                    console.error('❌ Refresh token has expired or is invalid.');
                    return Promise.reject(error);
                }

                if (error.response?.status === 401 && !originalRequest._retry) {
                    if (isRefreshing.current) {
                        return new Promise<AxiosResponse>((resolve, reject) => {
                            failedQueue.current.push({ resolve, reject });
                        })
                        .then(() => axiosAuth(originalRequest))
                        .catch(err => Promise.reject(err));
                    }

                    originalRequest._retry = true;
                    isRefreshing.current = true;

                    return new Promise<AxiosResponse>((resolve, reject) => {
                        axiosAuth.post('/refresh')
                            .then(() => {
                                processQueue(null);
                                axiosAuth(originalRequest)
                                    .then(resolve)
                                    .catch(reject);
                            })
                            .catch(refreshError => {
                                processQueue(refreshError, null);
                                localStorage.removeItem('user');
                                setAuth(null);
                                reject(refreshError);
                            })
                            .finally(() => {
                                isRefreshing.current = false;
                            });
                    });
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axiosAuth.interceptors.response.eject(interceptor);
        };
    }, [auth]);

    return axiosAuth;
};

export default useAxiosPrivate;
