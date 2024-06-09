import fetchIntercept from 'fetch-intercept';
import {fetchAuthSession} from 'aws-amplify/auth';
import {getAccessToken} from "./gameUtils";

class FetchInterceptors {
    constructor() {
        this.setupRequestInterceptor();
        this.setupResponseInterceptor();
        this.originalRequestConfig = null;
    }

    setupRequestInterceptor() {
        fetchIntercept.register({
            request: (url, config) => {
                const token = getAccessToken();
                if (token) {
                    if (!config) {
                        config = {};
                    }
                    config.headers = config.headers || {};
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                this.originalRequestConfig = config;
                return [url, config];
            }
        });
    }

    setupResponseInterceptor() {
        fetchIntercept.register({
            response: async (response) => {
                if (response.status === 401) {
                    console.log(response)
                    try {
                        const {tokens} = await fetchAuthSession({forceRefresh: true});
                        const newToken = tokens.accessToken.jwtToken;
                        if (newToken) {
                            const [url, config] = this.originalRequestConfig;
                            config.headers['Authorization'] = `Bearer ${newToken}`;
                            return await fetch(url, config);
                        }
                    } catch (error) {
                        console.error('Token refresh failed', error);
                    }
                }
                return response;
            }
        });
    }
}

export default FetchInterceptors;