import cookie from 'js-cookie';


export const setCookie = (key, value) => {
    if (window !== 'undefined') {
        cookie.set(key, value, {
            expires: 1
        });
    }
}


export const removeCookie = (key) => {
    if (window !== 'undefined') {
        cookie.remove(key, {
            expires: 1
        });
    }
}


export const getCookie = (key) => {
    if (window !== 'undefined') {
        return cookie.get(key);
    }
}

export const setLocalStorage = (key, value) => {
    if (window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
    }
}


export const removeLocalStorage = (key) => {
    if (window !== 'undefined') {
        localStorage.removeItem(key);
    }
}


export const getLocalStorage = (key) => {
    if (window !== 'undefined') {
        return localStorage.getItem(key);
    }
}


export const authenticate = (response, next) => {
    setCookie('token', response.data.token);
    setLocalStorage('user', response.data.user);
    next();
}

export const signOut = (response, next) => {
    removeCookie('token');
    removeLocalStorage('user');
}

export const isAuth = () => {
    if (window !== 'undefined') {
        const cookieChecked = getCookie('token');
        if (cookieChecked) {
            if (localStorage.getItem('user')) {
                return JSON.parse(localStorage.getItem('user'));
            } else {
                return false;
            }
        }
    }
};


export const updateUser = (response, next) => {
    if (window !== 'undefined') {
        // let auth = JSON.parse(localStorage.getItem('user'));
        // auth = response.data;
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    next();
}

