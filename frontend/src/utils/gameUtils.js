import awsmobile from "./aws-exports";

export const getAccessToken = () => {
    const username = localStorage.getItem(`CognitoIdentityServiceProvider.${awsmobile.aws_user_pools_web_client_id}.LastAuthUser`);
    return localStorage.getItem(
        `CognitoIdentityServiceProvider.${awsmobile.aws_user_pools_web_client_id}.${username}.accessToken`);
};

export const createGame = (login) => {
    const url = process.env.REACT_APP_URL + "/game/start";
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "login": login
        })
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to create game');
            }
            return response.json();
        })
        .catch((error) => {
            throw new Error(error.message);
        });
};

export const getRating = () => {
    const url = process.env.REACT_APP_URL + "/rating";
    return fetch(url, {
        method: 'GET'
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to get rating');
            }
            return response.json();
        })
};
export const setImageForUser = (playerLogin, image) => {
    const url = process.env.REACT_APP_URL + "/user/image";
    const formData = new FormData();
    formData.append('login', playerLogin); // Append the login directly as a string
    formData.append('image', image)
    return fetch(url, {
        method: 'POST',
        body: formData
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to upload image');
            }
            alert('Image uploaded successfully');
            return response.json();
        })
}
export const connectToGame = (login) => {
    const url = process.env.REACT_APP_URL + "/game/connect";
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            player: {login: login}
        })
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to create game');
            }
            return response.json();
        })
        .catch((error) => {
            console.log(error);
            throw new Error(error.message);
        });
}

export const makeMove = (data) => {
    const url = process.env.REACT_APP_URL + "/game/gameplay";
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to create game');
            }
            return response.json();
        })
        .catch((error) => {
            throw new Error(error.message);
        });
};